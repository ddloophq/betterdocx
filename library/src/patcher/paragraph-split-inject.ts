import { Element } from "xml-js";

import { INLINE_RUN_WRAPPERS } from "./run-renderer";
import { createTextElementContents, patchSpaceAttribute } from "./util";

export type RunElementLocation = {
    readonly parent: Element;
    readonly index: number;
};

const runHasToken = (runElement: Element, token: string): boolean =>
    (runElement.elements ?? []).some((e) => {
        if (e.type !== "element" || e.name !== "w:t" || !e.elements?.[0]) {
            return false;
        }

        return !!(e.elements[0].text as string)?.includes(token);
    });

const findRunElementIn = (parent: Element, token: string): RunElementLocation | undefined => {
    for (const [index, element] of (parent.elements ?? []).entries()) {
        if (element.type !== "element") {
            continue;
        }
        if (element.name === "w:r" && runHasToken(element, token)) {
            return { parent, index };
        }
        if (INLINE_RUN_WRAPPERS.has(element.name ?? "")) {
            const nested = findRunElementIn(element, token);
            if (nested) {
                return nested;
            }
        }
    }

    return undefined;
};

// Runs may sit inside inline wrappers (hyperlinks, tracked changes, smart
// tags), so the location includes the run's immediate parent for splicing.
export const findRunElementIndexWithToken = (
    paragraphElement: Element,
    token: string,
): RunElementLocation => {
    const location = findRunElementIn(paragraphElement, token);

    if (!location) {
        throw new Error("Token not found");
    }

    return location;
};

export const splitRunElement = (
    runElement: Element,
    token: string,
): { readonly left: Element; readonly right: Element } => {
    const splitElements: Element[] = [];
    // Output index of the text part preceding the token; everything up to and
    // including it goes to the left run, the rest to the right run.
    let splitIndex = -1;

    for (const e of runElement.elements ?? []) {
        if (splitIndex === -1 && e.type === "element" && e.name === "w:t") {
            const text = (e.elements?.[0]?.text as string) ?? "";

            if (text.includes(token)) {
                splitIndex = splitElements.length;

                splitElements.push(
                    ...text.split(token).map((t) =>
                        Object.assign(patchSpaceAttribute(e), {
                            elements: createTextElementContents(t),
                        }),
                    ),
                );
                continue;
            }
        }

        splitElements.push(e);
    }

    if (splitIndex === -1) {
        splitIndex = splitElements.length - 1;
    }

    const leftRunElement: Element = {
        ...JSON.parse(JSON.stringify(runElement)),
        elements: splitElements.slice(0, splitIndex + 1),
    };

    const rightRunElement: Element = {
        ...JSON.parse(JSON.stringify(runElement)),
        elements: splitElements.slice(splitIndex + 1),
    };

    return { left: leftRunElement, right: rightRunElement };
};
