import xml from "xml";
import { Element } from "xml-js";

import { Formatter, IFormatterContext } from "@export/formatter";
import { XmlComponent } from "@file/xml-components";

import { IPatch, PatchType } from "./from-docx";
import { findRunElementIndexWithToken, splitRunElement } from "./paragraph-split-inject";
import { replaceTokenInParagraphElement } from "./paragraph-token-replacer";
import { findLocationOfText } from "./traverser";
import { toJson } from "./util";

const formatter = new Formatter();

// U+0000 is not a legal XML character, so it can never occur in parsed
// document text; unlike a printable marker, it cannot collide with content.
const SPLIT_TOKEN = "\u0000";

type IReplacerResult = {
    readonly element: Element;
    readonly didFindOccurrence: boolean;
    // Occurrences of patchText before this pass's replacements; lets the
    // caller detect a recursive patch that never converges.
    readonly occurrenceCount: number;
};

const countOccurrences = (text: string, search: string): number => text.split(search).length - 1;

export const replacer = ({
    json,
    patch,
    patchText,
    context,
    keepOriginalStyles = true,
    renderedParagraphs: indexedParagraphs,
}: {
    readonly json: Element;
    readonly patch: IPatch;
    readonly patchText: string;
    readonly context: IFormatterContext;
    readonly keepOriginalStyles?: boolean;
    /** Pre-indexed locations from the caller's current stable mutation pass. */
    readonly renderedParagraphs?: readonly import("./run-renderer").IRenderedParagraphNode[];
}): IReplacerResult => {
    const renderedParagraphs = indexedParagraphs ?? findLocationOfText(json, patchText);

    if (renderedParagraphs.length === 0) {
        return { element: json, didFindOccurrence: false, occurrenceCount: 0 };
    }

    const occurrenceCount = renderedParagraphs.reduce(
        (acc, paragraph) => acc + countOccurrences(paragraph.text, patchText),
        0,
    );

    // Formatting and serializing the patch children is expensive, so do it
    // once and deep-clone the parsed template per occurrence.
    const templateJson = patch.children.map(
        (c) => toJson(xml(formatter.format(c as XmlComponent, context))).elements![0],
    );

    // Process in reverse document order: splicing a DOCUMENT patch shifts the
    // indices of subsequent siblings, so later occurrences must be patched
    // before earlier ones for their pre-computed paths to stay valid.

    // Fresh copy — Array#toSorted needs a newer TS lib target than this package uses.
    // oxlint-disable-next-line unicorn/no-array-sort
    const sortedParagraphs = [...renderedParagraphs].sort((a, b) =>
        comparePaths(b.pathToParagraph, a.pathToParagraph),
    );

    for (const renderedParagraph of sortedParagraphs) {
        const textJson = templateJson.map((e) => structuredClone(e));

        switch (patch.type) {
            case PatchType.BLOCK: {
                const parentElement = goToParentElementFromPath(
                    json,
                    renderedParagraph.pathToParagraph,
                );
                const elementIndex = getLastElementIndexFromPath(renderedParagraph.pathToParagraph);

                parentElement.elements!.splice(elementIndex, 1, ...textJson);
                ensureTerminalParagraph(
                    findNearestAncestorByName(json, renderedParagraph.pathToParagraph, "w:tc") ??
                        parentElement,
                );
                break;
            }
            case PatchType.INLINE:
            default: {
                const paragraphElement = goToElementFromPath(
                    json,
                    renderedParagraph.pathToParagraph,
                );
                replaceTokenInParagraphElement({
                    paragraphElement,
                    renderedParagraph,
                    originalText: patchText,
                    replacementText: SPLIT_TOKEN,
                });

                const { parent: runParent, index } = findRunElementIndexWithToken(
                    paragraphElement,
                    SPLIT_TOKEN,
                );

                const runElementToBeReplaced = runParent.elements![index];
                const { left, right } = splitRunElement(runElementToBeReplaced, SPLIT_TOKEN);

                let newRunElements = textJson;
                let patchedRightElement = right;

                if (keepOriginalStyles) {
                    const originalRunProperties = runElementToBeReplaced.elements!.filter(
                        (e) => e.type === "element" && e.name === "w:rPr",
                    );

                    newRunElements = textJson.map((e) =>
                        mergeRunPropertiesRecursively(e, originalRunProperties),
                    );

                    patchedRightElement = mergeRunProperties(right, originalRunProperties);
                }

                runParent.elements!.splice(index, 1, left, ...newRunElements, patchedRightElement);
                break;
            }
        }
    }

    return { element: json, didFindOccurrence: true, occurrenceCount };
};

const mergeRunPropertiesRecursively = (
    element: Element,
    inheritedProperties: readonly Element[],
): Element => {
    if (element.type === "element" && element.name === "w:r") {
        return mergeRunProperties(element, inheritedProperties);
    }
    if (element.elements === undefined) {
        return element;
    }
    return {
        ...element,
        elements: element.elements.map((child) =>
            mergeRunPropertiesRecursively(child, inheritedProperties),
        ),
    };
};

const mergeRunProperties = (run: Element, inheritedProperties: readonly Element[]): Element => {
    if (inheritedProperties.length === 0) {
        return run;
    }

    const runProperties = (run.elements ?? []).filter(
        (element) => element.type === "element" && element.name === "w:rPr",
    );
    const explicitPropertyNames = new Set(
        runProperties.flatMap((properties) =>
            (properties.elements ?? [])
                .filter((element) => element.type === "element")
                .map((element) => element.name),
        ),
    );
    const inheritedChildren = inheritedProperties.flatMap((properties) =>
        (properties.elements ?? []).filter(
            (element) => element.type !== "element" || !explicitPropertyNames.has(element.name),
        ),
    );
    const explicitChildren = runProperties.flatMap((properties) => properties.elements ?? []);
    const mergedProperties: Element = {
        ...inheritedProperties[0],
        ...runProperties[0],
        type: "element",
        name: "w:rPr",
        attributes: {
            ...inheritedProperties[0].attributes,
            ...runProperties[0]?.attributes,
        },
        elements: [...inheritedChildren, ...explicitChildren],
    };
    const elementsWithoutProperties = (run.elements ?? []).filter(
        (element) => element.type !== "element" || element.name !== "w:rPr",
    );

    return {
        ...run,
        elements: [mergedProperties, ...elementsWithoutProperties],
    };
};

const ensureTerminalParagraph = (parent: Element): void => {
    if (parent.name !== "w:tc") {
        return;
    }
    let lastChildElement: Element | undefined;
    for (let index = (parent.elements?.length ?? 0) - 1; index >= 0; index--) {
        if (parent.elements![index].type === "element") {
            lastChildElement = parent.elements![index];
            break;
        }
    }
    if (lastChildElement?.name !== "w:p") {
        (parent.elements ??= []).push({ type: "element", name: "w:p" });
    }
};

const findNearestAncestorByName = (
    json: Element,
    path: readonly number[],
    name: string,
): Element | undefined => {
    let element = json;
    let nearest = element.name === name ? element : undefined;
    for (let index = 1; index < path.length - 1; index++) {
        element = element.elements![path[index]];
        if (element.name === name) {
            nearest = element;
        }
    }
    return nearest;
};

const comparePaths = (a: readonly number[], b: readonly number[]): number => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) {
            return a[i] - b[i];
        }
    }

    return a.length - b.length;
};

const goToElementFromPath = (json: Element, path: readonly number[]): Element => {
    let element = json;

    // We start from 1 because the first element is the root element
    // Which we do not want to double count
    for (let i = 1; i < path.length; i++) {
        const index = path[i];
        const nextElements = element.elements!;

        element = nextElements[index];
    }

    return element;
};

const goToParentElementFromPath = (json: Element, path: readonly number[]): Element =>
    goToElementFromPath(json, path.slice(0, -1));

const getLastElementIndexFromPath = (path: readonly number[]): number => path.at(-1)!;
