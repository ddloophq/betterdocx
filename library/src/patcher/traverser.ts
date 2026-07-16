import { Element } from "xml-js";

import { IRenderedParagraphNode, renderParagraphNode } from "./run-renderer";

export type ElementWrapper = {
    readonly element: Element;
    readonly index: number;
    readonly parent: ElementWrapper | undefined;
};

const elementsToWrapper = (wrapper: ElementWrapper): readonly ElementWrapper[] =>
    wrapper.element.elements?.map((e, i) => ({
        element: e,
        index: i,
        parent: wrapper,
    })) ?? [];

export const traverse = (node: Element): readonly IRenderedParagraphNode[] => {
    const renderedParagraphs: IRenderedParagraphNode[] = [];

    const queue: ElementWrapper[] = [
        ...elementsToWrapper({
            element: node,
            index: 0,
            parent: undefined,
        }),
    ];

    // The array iterator picks up elements pushed during iteration, giving a
    // BFS without the O(n) cost that shift()-based dequeuing has per node.
    for (const currentNode of queue) {
        if (currentNode.element.name === "w:p") {
            renderedParagraphs.push(renderParagraphNode(currentNode));
        }
        queue.push(...elementsToWrapper(currentNode));
    }

    return renderedParagraphs;
};

export const findLocationOfText = (
    node: Element,
    text: string,
): readonly IRenderedParagraphNode[] => traverse(node).filter((p) => p.text.includes(text));
