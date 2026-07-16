import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { EmphasisMark, EmphasisMarkType } from "./emphasis-mark";

describe("EmphasisMark", () => {
    describe("#constructor()", () => {
        it("should create a new EmphasisMark object with w:em as the rootKey", () => {
            const emphasisMark = new EmphasisMark();
            const tree = new Formatter().format(emphasisMark);
            expect(tree).to.deep.equal({
                "w:em": { _attr: { "w:val": "dot" } },
            });
        });

        it("should put the given type in the attribute", () => {
            const emphasisMark = new EmphasisMark(EmphasisMarkType.DOT);
            const tree = new Formatter().format(emphasisMark);
            expect(tree).to.deep.equal({
                "w:em": { _attr: { "w:val": "dot" } },
            });
        });
    });
});
