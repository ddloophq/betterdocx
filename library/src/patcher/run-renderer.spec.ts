import { describe, expect, it } from "vitest";

import { renderParagraphNode } from "./run-renderer";

describe("run-renderer", () => {
    describe("renderParagraphNode", () => {
        it("should return a rendered paragraph node if theres no elements", () => {
            const output = renderParagraphNode({
                element: { name: "w:p" },
                index: 0,
                parent: undefined,
            });
            expect(output).to.deep.equal({
                index: -1,
                pathToParagraph: [],
                runs: [],
                text: "",
            });
        });

        it("should return a rendered paragraph node if there are elements", () => {
            const runElement = {
                name: "w:r",
                elements: [
                    {
                        name: "w:t",
                        elements: [
                            {
                                type: "text",
                                text: "hello",
                            },
                        ],
                    },
                ],
            };
            const output = renderParagraphNode({
                element: {
                    name: "w:p",
                    elements: [runElement],
                },
                index: 0,
                parent: undefined,
            });
            expect(output).to.deep.equal({
                index: 0,
                pathToParagraph: [0],
                runs: [
                    {
                        end: 4,
                        index: 0,
                        element: runElement,
                        parts: [
                            {
                                end: 4,
                                index: 0,
                                start: 0,
                                text: "hello",
                            },
                        ],
                        start: 0,
                        text: "hello",
                    },
                ],
                text: "hello",
            });
        });

        it("should render runs nested inside inline wrappers as part of the paragraph text", () => {
            const directRunElement = {
                name: "w:r",
                elements: [
                    {
                        name: "w:t",
                        elements: [
                            {
                                type: "text",
                                text: "See ",
                            },
                        ],
                    },
                ],
            };
            const nestedRunElement = {
                name: "w:r",
                elements: [
                    {
                        name: "w:t",
                        elements: [
                            {
                                type: "text",
                                text: "{{link}}",
                            },
                        ],
                    },
                ],
            };
            const output = renderParagraphNode({
                element: {
                    name: "w:p",
                    elements: [
                        directRunElement,
                        {
                            type: "element",
                            name: "w:hyperlink",
                            elements: [nestedRunElement],
                        },
                    ],
                },
                index: 0,
                parent: undefined,
            });
            expect(output.text).to.equal("See {{link}}");
            expect(output.runs).to.have.length(2);
            expect(output.runs[1].element).to.equal(nestedRunElement);
            expect(output.runs[1].start).to.equal(4);
            expect(output.runs[1].end).to.equal(11);
        });

        it("should throw an error if the element is not a paragraph", () => {
            expect(() =>
                renderParagraphNode({ element: { name: "w:r" }, index: 0, parent: undefined }),
            ).to.throw();
        });

        it("should return blank defaults if run is empty", () => {
            const runElement = {
                name: "w:r",
            };
            const output = renderParagraphNode({
                element: {
                    name: "w:p",
                    elements: [runElement],
                },
                index: 0,
                parent: undefined,
            });
            expect(output).to.deep.equal({
                index: 0,
                pathToParagraph: [0],
                runs: [
                    {
                        end: 0,
                        index: -1,
                        element: runElement,
                        parts: [],
                        start: 0,
                        text: "",
                    },
                ],
                text: "",
            });
        });
    });
});
