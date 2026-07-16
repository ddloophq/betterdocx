import { describe, expect, it } from "vitest";

import { ConcreteNumbering } from "@file/numbering";

import { NumberingReplacer } from "./numbering-replacer";

const createConcreteNumbering = (
    reference: string,
    instance: number,
    numId: number,
): ConcreteNumbering =>
    new ConcreteNumbering({
        numId,
        abstractNumId: 0,
        reference,
        instance,
    });

describe("NumberingReplacer", () => {
    describe("#replace()", () => {
        it("should replace numbering placeholders only in w:numId values", () => {
            const numberingReplacer = new NumberingReplacer();
            const result = numberingReplacer.replace(
                '<w:p><w:r><w:t>literal {my-numbering-0}</w:t></w:r><w:pPr><w:numPr><w:numId w:val="{my-numbering-0}"/></w:numPr></w:pPr></w:p>',
                [createConcreteNumbering("my-numbering", 0, 1)],
            );

            expect(result).to.contain("literal {my-numbering-0}");
            expect(result).to.contain('<w:numId w:val="1"/>');
        });

        it("should replace placeholders for references containing regex metacharacters", () => {
            const numberingReplacer = new NumberingReplacer();
            const result = numberingReplacer.replace(
                '<w:numId w:val="{c++-0}"/><w:numId w:val="{notes (draft)-1}"/>',
                [
                    createConcreteNumbering("c++", 0, 1),
                    createConcreteNumbering("notes (draft)", 1, 2),
                ],
            );

            expect(result).to.equal('<w:numId w:val="1"/><w:numId w:val="2"/>');
        });

        it("should reject unresolved numbering references", () => {
            const numberingReplacer = new NumberingReplacer();
            expect(() =>
                numberingReplacer.replace('<w:numId w:val="{other-numbering-0}"/>', [
                    createConcreteNumbering("my-numbering", 0, 1),
                ]),
            ).to.throw("Could not resolve numbering reference(s) {other-numbering-0}");
        });

        it("should replace references in stringified xml-js JSON without changing text", () => {
            const numberingReplacer = new NumberingReplacer();
            const result = numberingReplacer.replace(
                JSON.stringify({
                    elements: [
                        { name: "w:t", elements: [{ text: "literal {my-numbering-0}" }] },
                        { name: "w:numId", attributes: { "w:val": "{my-numbering-0}" } },
                    ],
                }),
                [createConcreteNumbering("my-numbering", 0, 7)],
            );

            expect(JSON.parse(result)).to.deep.equal({
                elements: [
                    { name: "w:t", elements: [{ text: "literal {my-numbering-0}" }] },
                    { name: "w:numId", attributes: { "w:val": "7" } },
                ],
            });
        });
    });
});
