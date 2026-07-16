import { describe, expect, it, vi } from "vitest";

import { Paragraph, TextRun } from "@file/paragraph";
import { Table } from "@file/table";
import { createRenderSession } from "@file/xml-components";

import { PatchType } from "./from-docx";
import { replacer } from "./replacer";

const createContext = () => ({ session: createRenderSession(), stack: [] });

export const MOCK_JSON = {
    elements: [
        {
            type: "element",
            name: "w:hdr",
            elements: [
                {
                    type: "element",
                    name: "w:p",
                    attributes: {
                        "w14:paraId": "3BE1A671",
                        "w14:textId": "74E856C4",
                        "w:rsidR": "000D38A7",
                        "w:rsidRDefault": "000D38A7",
                    },
                    elements: [
                        {
                            type: "element",
                            name: "w:pPr",
                            elements: [
                                {
                                    type: "element",
                                    name: "w:pStyle",
                                    attributes: { "w:val": "Header" },
                                },
                            ],
                        },
                        {
                            type: "element",
                            name: "w:r",
                            elements: [
                                {
                                    type: "element",
                                    name: "w:t",
                                    elements: [{ type: "text", text: "This is a {{head" }],
                                },
                            ],
                        },
                        {
                            type: "element",
                            name: "w:r",
                            attributes: { "w:rsidR": "004A3A99" },
                            elements: [
                                {
                                    type: "element",
                                    name: "w:t",
                                    elements: [{ type: "text", text: "er" }],
                                },
                            ],
                        },
                        {
                            type: "element",
                            name: "w:r",
                            elements: [
                                {
                                    type: "element",
                                    name: "w:t",
                                    elements: [
                                        { type: "text", text: "_adjective}} don’t you think?" },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    type: "element",
                    name: "w:p",
                    elements: [
                        {
                            type: "element",
                            name: "w:r",
                            elements: [
                                {
                                    type: "element",
                                    name: "w:rPr",
                                    elements: [
                                        {
                                            type: "element",
                                            name: "w:b",
                                            attributes: { "w:val": "1" },
                                        },
                                    ],
                                },
                                {
                                    type: "element",
                                    name: "w:t",
                                    elements: [{ type: "text", text: "What a {{bold}} text!" }],
                                },
                                {
                                    type: "element",
                                    name: "w:br",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

describe("replacer", () => {
    describe("replacer", () => {
        it("should return { didFindOccurrence: false } if nothing is added", () => {
            const { didFindOccurrence } = replacer({
                json: {
                    elements: [],
                },
                patch: {
                    type: PatchType.PARAGRAPH,
                    children: [],
                },
                patchText: "hello",
                context: vi.fn()(),
            });
            expect(didFindOccurrence).toBe(false);
        });

        it("should replace paragraph type", () => {
            const { element, didFindOccurrence } = replacer({
                json: JSON.parse(JSON.stringify(MOCK_JSON)),
                patch: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("Delightful Header")],
                },
                patchText: "{{header_adjective}}",
                context: createContext(),
            });

            expect(JSON.stringify(element)).to.contain("Delightful Header");
            expect(didFindOccurrence).toBe(true);
        });

        it("should replace paragraph type keeping original styling if keepOriginalStyles is true", () => {
            const { element, didFindOccurrence } = replacer({
                json: JSON.parse(JSON.stringify(MOCK_JSON)),
                patch: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("sweet")],
                },
                patchText: "{{bold}}",
                context: createContext(),
                keepOriginalStyles: true,
            });

            expect(JSON.stringify(element)).to.contain("sweet");
            expect(element.elements![0].elements![1].elements).toMatchObject([
                {
                    type: "element",
                    name: "w:r",
                    elements: [
                        {
                            type: "element",
                            name: "w:rPr",
                            elements: [
                                { type: "element", name: "w:b", attributes: { "w:val": "1" } },
                            ],
                        },
                        {
                            type: "element",
                            name: "w:t",
                            elements: [{ type: "text", text: "What a " }],
                        },
                    ],
                },
                {
                    type: "element",
                    name: "w:r",
                    elements: [
                        {
                            type: "element",
                            name: "w:rPr",
                            elements: [
                                { type: "element", name: "w:b", attributes: { "w:val": "1" } },
                            ],
                        },
                        {
                            type: "element",
                            name: "w:t",
                            elements: [{ type: "text", text: "sweet" }],
                        },
                    ],
                },
                {
                    type: "element",
                    name: "w:r",
                    elements: [
                        {
                            type: "element",
                            name: "w:rPr",
                            elements: [
                                { type: "element", name: "w:b", attributes: { "w:val": "1" } },
                            ],
                        },
                        {
                            type: "element",
                            name: "w:t",
                            elements: [{ type: "text", text: " text!" }],
                        },
                        {
                            name: "w:br",
                            type: "element",
                        },
                    ],
                },
            ]);
            expect(didFindOccurrence).toBe(true);
        });

        it("merges inherited and explicit run properties with explicit values taking precedence", () => {
            const { element } = replacer({
                json: JSON.parse(JSON.stringify(MOCK_JSON)),
                patch: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun({ text: "sweet", bold: false, italics: true })],
                },
                patchText: "{{bold}}",
                context: createContext(),
                keepOriginalStyles: true,
            });

            const replacementRun = element.elements![0].elements![1].elements![1];
            const properties = replacementRun.elements!.filter((child) => child.name === "w:rPr");
            expect(properties).toHaveLength(1);
            expect(properties[0].elements).toContainEqual({
                type: "element",
                name: "w:b",
                attributes: { "w:val": "false" },
            });
            expect(properties[0].elements).toContainEqual({
                type: "element",
                name: "w:i",
            });
            expect(properties[0].elements?.filter((child) => child.name === "w:b")).toHaveLength(1);
        });

        it("should replace document type", () => {
            const { element, didFindOccurrence } = replacer({
                json: JSON.parse(JSON.stringify(MOCK_JSON)),
                patch: {
                    type: PatchType.DOCUMENT,
                    children: [new Paragraph("Lorem ipsum paragraph")],
                },
                patchText: "{{header_adjective}}",
                context: createContext(),
            });

            expect(JSON.stringify(element)).to.contain("Lorem ipsum paragraph");
            expect(didFindOccurrence).toBe(true);
        });

        it("adds a terminal paragraph when a table replaces the last paragraph in a cell", () => {
            const cell = {
                type: "element",
                name: "w:tc",
                elements: [
                    {
                        type: "element",
                        name: "w:p",
                        elements: [
                            {
                                type: "element",
                                name: "w:r",
                                elements: [
                                    {
                                        type: "element",
                                        name: "w:t",
                                        elements: [{ type: "text", text: "{{table}}" }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const { element } = replacer({
                json: { elements: [cell] },
                patch: { type: PatchType.DOCUMENT, children: [new Table({ rows: [] })] },
                patchText: "{{table}}",
                context: createContext(),
            });

            expect(element.elements![0].elements?.map((child) => child.name)).toEqual([
                "w:tbl",
                "w:p",
            ]);
        });

        it("keeps exactly one existing terminal paragraph after a cell document patch", () => {
            const paragraph = (text: string) => ({
                type: "element",
                name: "w:p",
                elements: [
                    {
                        type: "element",
                        name: "w:r",
                        elements: [
                            {
                                type: "element",
                                name: "w:t",
                                elements: [{ type: "text", text }],
                            },
                        ],
                    },
                ],
            });
            const cell = {
                type: "element",
                name: "w:tc",
                elements: [paragraph("{{remove}}"), paragraph("terminal")],
            };
            const { element } = replacer({
                json: { elements: [cell] },
                patch: { type: PatchType.DOCUMENT, children: [] },
                patchText: "{{remove}}",
                context: createContext(),
            });

            expect(element.elements![0].elements).toHaveLength(1);
            expect(element.elements![0].elements![0].name).toBe("w:p");
            expect(JSON.stringify(element)).toContain("terminal");
        });

        it("adds a terminal paragraph when an empty patch removes a cell's only paragraph", () => {
            const cell = {
                type: "element",
                name: "w:tc",
                elements: [
                    {
                        type: "element",
                        name: "w:p",
                        elements: [
                            {
                                type: "element",
                                name: "w:r",
                                elements: [
                                    {
                                        type: "element",
                                        name: "w:t",
                                        elements: [{ type: "text", text: "{{empty}}" }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const { element } = replacer({
                json: { elements: [cell] },
                patch: { type: PatchType.DOCUMENT, children: [] },
                patchText: "{{empty}}",
                context: createContext(),
            });

            expect(element.elements![0].elements).toEqual([{ type: "element", name: "w:p" }]);
        });

        it("should replace", () => {
            // cspell:disable
            const { element, didFindOccurrence } = replacer({
                json: {
                    elements: [
                        {
                            type: "element",
                            name: "w:hdr",
                            elements: [
                                {
                                    type: "element",
                                    name: "w:p",
                                    elements: [
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "{{" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n                    " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        { type: "text", text: "\n          " },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "s" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n  " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        { type: "text", text: "\n    " },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                { type: "text", text: "\n      " },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "chool_" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n                    " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "n" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n                    " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "{{" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n                    " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "a" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n                    " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        { type: "text", text: "\n            " },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "ddr" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n                    " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "ess" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                        { type: "text", text: "\n                    " },
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                { type: "text", text: "\n      " },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:kern",
                                                            attributes: { "w:val": "0" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:sz",
                                                            attributes: { "w:val": "20" },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:lang",
                                                            attributes: {
                                                                "w:val": "en-US",
                                                                "w:eastAsia": "en-US",
                                                                "w:bidi": "ar-SA",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "}}" }],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                // cspell:enable
                patch: {
                    type: PatchType.PARAGRAPH,
                    children: [new Paragraph("Lorem ipsum paragraph")],
                },
                patchText: "{{address}}",
                context: createContext(),
            });

            expect(JSON.stringify(element)).to.contain("Lorem ipsum paragraph");
            expect(didFindOccurrence).toBe(true);
        });

        it("should replace a token spanning multiple w:t elements within one run", () => {
            const { element, didFindOccurrence } = replacer({
                json: {
                    elements: [
                        {
                            type: "element",
                            name: "w:hdr",
                            elements: [
                                {
                                    type: "element",
                                    name: "w:p",
                                    elements: [
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [
                                                        { type: "text", text: "Hello {{na" },
                                                    ],
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [
                                                        { type: "text", text: "me}} world" },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                patch: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun("John")],
                },
                patchText: "{{name}}",
                context: createContext(),
            });

            const stringified = JSON.stringify(element);
            expect(didFindOccurrence).toBe(true);
            expect(stringified).to.contain("John");
            expect(stringified).to.contain("Hello ");
            expect(stringified).to.contain(" world");
            expect(stringified).not.to.contain("{{na");
            expect(stringified).not.to.contain("me}}");
        });

        it("should replace every occurrence of a repeated placeholder under one parent (document type)", () => {
            const paragraphWithPlaceholder = () => ({
                type: "element",
                name: "w:p",
                elements: [
                    {
                        type: "element",
                        name: "w:r",
                        elements: [
                            {
                                type: "element",
                                name: "w:t",
                                elements: [{ type: "text", text: "{{item}}" }],
                            },
                        ],
                    },
                ],
            });

            const { element, didFindOccurrence } = replacer({
                json: {
                    elements: [
                        {
                            type: "element",
                            name: "w:hdr",
                            elements: [paragraphWithPlaceholder(), paragraphWithPlaceholder()],
                        },
                    ],
                },
                patch: {
                    type: PatchType.DOCUMENT,
                    children: [new Paragraph("First inserted"), new Paragraph("Second inserted")],
                },
                patchText: "{{item}}",
                context: createContext(),
            });

            const stringified = JSON.stringify(element);
            expect(didFindOccurrence).toBe(true);
            expect(stringified).not.to.contain("{{item}}");
            // Each of the two occurrences expands to both patch paragraphs.
            expect(stringified.match(/First inserted/g)).toHaveLength(2);
            expect(stringified.match(/Second inserted/g)).toHaveLength(2);
            expect(element.elements![0].elements).toHaveLength(4);
        });

        it("should handle empty runs in patches", () => {
            // cspell:disable
            const { element, didFindOccurrence } = replacer({
                json: {
                    elements: [
                        {
                            type: "element",
                            name: "w:hdr",
                            elements: [
                                {
                                    type: "element",
                                    name: "w:p",
                                    elements: [
                                        {
                                            type: "element",
                                            name: "w:r",
                                            elements: [
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:rPr",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "\n                            ",
                                                        },
                                                        {
                                                            type: "element",
                                                            name: "w:rFonts",
                                                            attributes: {
                                                                "w:eastAsia": "Times New Roman",
                                                            },
                                                        },
                                                        {
                                                            type: "text",
                                                            text: "\n                        ",
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: "text",
                                                    text: "\n                        ",
                                                },
                                                {
                                                    type: "element",
                                                    name: "w:t",
                                                    elements: [{ type: "text", text: "{{empty}}" }],
                                                },
                                                { type: "text", text: "\n                    " },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                // cspell:enable
                patch: {
                    type: PatchType.PARAGRAPH,
                    children: [new TextRun({})],
                },
                patchText: "{{empty}}",
                context: createContext(),
                keepOriginalStyles: true,
            });

            expect(JSON.stringify(element)).not.to.contain("{{empty}}");
            expect(didFindOccurrence).toBe(true);
        });
    });
});
