import { Element } from "xml-js";

import { ElementWrapper } from "./traverser";

export type IRenderedParagraphNode = {
    readonly text: string;
    readonly runs: readonly IRenderedRunNode[];
    readonly index: number;
    readonly pathToParagraph: readonly number[];
};

// Inline containers whose runs are part of the paragraph's visible text.
// Runs inside them must be found (and patched) like direct w:p children.
export const INLINE_RUN_WRAPPERS: ReadonlySet<string> = new Set([
    "w:hyperlink",
    "w:ins",
    "w:smartTag",
    "w:sdt",
    "w:sdtContent",
]);

type StartAndEnd = {
    readonly start: number;
    readonly end: number;
};

type IParts = {
    readonly text: string;
    readonly index: number;
} & StartAndEnd;

export type IRenderedRunNode = {
    readonly text: string;
    readonly parts: readonly IParts[];
    readonly index: number;
    readonly element: Element;
} & StartAndEnd;

const collectRunElements = (
    parent: Element,
): readonly { readonly element: Element; readonly index: number }[] =>
    (parent.elements ?? []).flatMap((element, i) => {
        if (element.name === "w:r") {
            return [{ element, index: i }];
        }
        if (element.type === "element" && INLINE_RUN_WRAPPERS.has(element.name ?? "")) {
            return collectRunElements(element);
        }
        return [];
    });

export const renderParagraphNode = (node: ElementWrapper): IRenderedParagraphNode => {
    if (node.element.name !== "w:p") {
        throw new Error(`Invalid node type: ${node.element.name}`);
    }

    if (!node.element.elements) {
        return {
            text: "",
            runs: [],
            index: -1,
            pathToParagraph: [],
        };
    }

    let currentRunStringLength = 0;

    const runs = collectRunElements(node.element).map(({ element, index }) => {
        const renderedRunNode = renderRunNode(element, index, currentRunStringLength);
        currentRunStringLength += renderedRunNode.text.length;

        return renderedRunNode;
    });

    const text = runs.reduce((acc, curr) => acc + curr.text, "");

    return {
        text,
        runs,
        index: node.index,
        pathToParagraph: buildNodePath(node),
    };
};

const renderRunNode = (
    node: Element,
    index: number,
    currentRunStringIndex: number,
): IRenderedRunNode => {
    if (!node.elements) {
        return {
            text: "",
            parts: [],
            index: -1,
            element: node,
            start: currentRunStringIndex,
            end: currentRunStringIndex,
        };
    }

    // start/end are inclusive indices into the paragraph text
    let currentTextStringIndex = currentRunStringIndex;

    const parts = node.elements
        .map((element, i: number) => {
            if (element.name !== "w:t" || !element.elements || element.elements.length === 0) {
                return undefined;
            }

            const partText = element.elements[0].text?.toString() ?? "";
            const start = currentTextStringIndex;
            currentTextStringIndex += partText.length;

            return {
                text: partText,
                index: i,
                start,
                end: currentTextStringIndex - 1,
            };
        })
        .filter((e) => !!e)
        .map((e) => e as IParts);

    const text = parts.reduce((acc, curr) => acc + curr.text, "");

    return {
        text,
        parts,
        index,
        element: node,
        start: currentRunStringIndex,
        end: text.length === 0 ? currentRunStringIndex : currentTextStringIndex - 1,
    };
};

const buildNodePath = (node: ElementWrapper): readonly number[] =>
    node.parent ? [...buildNodePath(node.parent), node.index] : [node.index];
