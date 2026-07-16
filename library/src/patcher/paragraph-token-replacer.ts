import { Element } from "xml-js";

import { IRenderedParagraphNode } from "./run-renderer";
import { createTextElementContents, patchSpaceAttribute } from "./util";

const ReplaceMode = {
    START: 0,
    MIDDLE: 1,
    END: 2,
} as const;

export const replaceTokenInParagraphElement = ({
    paragraphElement,
    renderedParagraph,
    originalText,
    replacementText,
}: {
    readonly paragraphElement: Element;
    readonly renderedParagraph: IRenderedParagraphNode;
    readonly originalText: string;
    readonly replacementText: string;
}): Element => {
    const startIndex = renderedParagraph.text.indexOf(originalText);
    const endIndex = startIndex + originalText.length - 1;

    let replaceMode: (typeof ReplaceMode)[keyof typeof ReplaceMode] = ReplaceMode.START;

    for (const run of renderedParagraph.runs) {
        for (const { text, index, start, end } of run.parts) {
            switch (replaceMode) {
                case ReplaceMode.START:
                    if (startIndex >= start && startIndex <= end) {
                        // Offsets are relative to this part's text, which may be
                        // one of several w:t parts within the run.
                        const offsetStartIndex = startIndex - start;
                        const offsetEndIndex = Math.min(endIndex, end) - start;

                        const firstPart =
                            text.substring(0, offsetStartIndex) +
                            replacementText +
                            text.substring(offsetEndIndex + 1);
                        patchTextElement(run.element.elements![index], firstPart);
                        replaceMode = ReplaceMode.MIDDLE;
                        continue;
                        /* c8 ignore next 2 */
                    }
                    break;
                case ReplaceMode.MIDDLE:
                    if (endIndex <= end) {
                        const lastPart = text.substring(endIndex - start + 1);
                        patchTextElement(run.element.elements![index], lastPart);
                        // We need to add xml:space="preserve" to the last element to preserve the whitespace
                        // Otherwise, the text will be merged with the next element

                        run.element.elements![index] = patchSpaceAttribute(
                            run.element.elements![index],
                        );
                        replaceMode = ReplaceMode.END;
                    } else {
                        patchTextElement(run.element.elements![index], "");
                    }
                    break;
                /* c8 ignore next */
                default:
            }
        }
    }

    return paragraphElement;
};

const patchTextElement = (element: Element, text: string): Element => {
    element.elements = createTextElementContents(text);

    return element;
};
