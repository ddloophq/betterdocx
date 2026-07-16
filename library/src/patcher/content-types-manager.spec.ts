import { describe, expect, it } from "vitest";

import { appendContentType, appendOverrideContentType } from "./content-types-manager";

describe("content-types-manager", () => {
    describe("appendContentType", () => {
        it("should append a content type", () => {
            const element = {
                type: "element",
                name: "xml",
                elements: [
                    {
                        type: "element",
                        name: "Types",
                        elements: [
                            {
                                type: "element",
                                name: "Default",
                            },
                        ],
                    },
                ],
            };
            appendContentType(
                element,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
                "docx",
            );

            expect(element).to.deep.equal({
                elements: [
                    {
                        elements: [
                            {
                                name: "Default",
                                type: "element",
                            },
                            {
                                attributes: {
                                    ContentType:
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
                                    Extension: "docx",
                                },
                                name: "Default",
                                type: "element",
                            },
                        ],
                        name: "Types",
                        type: "element",
                    },
                ],
                name: "xml",
                type: "element",
            });
        });

        it("should not append duplicate content type", () => {
            const element = {
                type: "element",
                name: "xml",
                elements: [
                    {
                        type: "element",
                        name: "Types",
                        elements: [
                            {
                                type: "element",
                                name: "Default",
                                attributes: {
                                    ContentType: "image/png",
                                    Extension: "png",
                                },
                            },
                        ],
                    },
                ],
            };
            appendContentType(element, "image/png", "png");

            expect(element.elements.length).toBe(1);
        });
    });

    describe("appendOverrideContentType", () => {
        it("should append an override content type", () => {
            const element = {
                type: "element",
                name: "xml",
                elements: [
                    {
                        type: "element",
                        name: "Types",
                        elements: [],
                    },
                ],
            };
            appendOverrideContentType(
                element,
                "/word/numbering.xml",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
            );

            expect(element.elements[0].elements).to.deep.equal([
                {
                    attributes: {
                        ContentType:
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
                        PartName: "/word/numbering.xml",
                    },
                    name: "Override",
                    type: "element",
                },
            ]);
        });

        it("should not append a duplicate override for the same part name", () => {
            const element = {
                type: "element",
                name: "xml",
                elements: [
                    {
                        type: "element",
                        name: "Types",
                        elements: [
                            {
                                type: "element",
                                name: "Override",
                                attributes: {
                                    ContentType:
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
                                    PartName: "/word/numbering.xml",
                                },
                            },
                        ],
                    },
                ],
            };
            appendOverrideContentType(
                element,
                "/word/numbering.xml",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
            );

            expect(element.elements[0].elements.length).toBe(1);
        });
    });
});
