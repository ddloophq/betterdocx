import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { Begin, End, InstructionText, Separate } from "./field";

describe("field characters", () => {
    describe("Begin", () => {
        it("should create a begin field character", () => {
            const tree = new Formatter().format(new Begin());
            expect(tree).to.deep.equal({
                "w:fldChar": { _attr: { "w:fldCharType": "begin" } },
            });
        });

        it("should create a dirty begin field character", () => {
            const tree = new Formatter().format(new Begin(true));
            expect(tree).to.deep.equal({
                "w:fldChar": { _attr: { "w:fldCharType": "begin", "w:dirty": true } },
            });
        });
    });

    describe("Separate", () => {
        it("should create a separate field character", () => {
            const tree = new Formatter().format(new Separate());
            expect(tree).to.deep.equal({
                "w:fldChar": { _attr: { "w:fldCharType": "separate" } },
            });
        });
    });

    describe("End", () => {
        it("should create an end field character", () => {
            const tree = new Formatter().format(new End());
            expect(tree).to.deep.equal({
                "w:fldChar": { _attr: { "w:fldCharType": "end" } },
            });
        });
    });

    describe("InstructionText", () => {
        it("should create instruction text with a preserved-space field code", () => {
            const tree = new Formatter().format(new InstructionText('DATE \\@ "yyyy-MM-dd"'));
            expect(tree).to.deep.equal({
                "w:instrText": [{ _attr: { "xml:space": "preserve" } }, 'DATE \\@ "yyyy-MM-dd"'],
            });
        });
    });
});
