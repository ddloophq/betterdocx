import { assert, beforeEach, describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";
import { createRenderSession } from "@file/xml-components";
import { Utility } from "@tests/utility";

import { TextRun } from "../run";
import { Bookmark } from "./bookmark";

describe("Bookmark", () => {
    let bookmark: Bookmark;

    beforeEach(() => {
        bookmark = new Bookmark({
            id: "anchor",
            children: [new TextRun("Internal Link")],
        });
    });

    it("should create a bookmark with three root elements", () => {
        const newJson = Utility.jsonify(bookmark);
        assert.equal(newJson.rootKey, undefined);
        assert.equal(newJson.start.rootKey, "w:bookmarkStart");
        assert.equal(newJson.children[0].rootKey, "w:r");
        assert.equal(newJson.end.rootKey, "w:bookmarkEnd");
    });

    it("should create a bookmark with the correct attributes on the bookmark start element", () => {
        const tree = new Formatter().format(bookmark.start);

        expect(tree["w:bookmarkStart"]._attr["w:name"]).to.equal("anchor");
        expect(tree["w:bookmarkStart"]._attr["w:id"]).to.be.a("number");
    });

    it("should create a bookmark with the correct attributes on the text element", () => {
        const newJson = Utility.jsonify(bookmark);
        assert.equal(
            JSON.stringify(newJson.children[0].root[1].root[1]),
            JSON.stringify("Internal Link"),
        );
    });

    it("should create a bookmark with the correct attributes on the bookmark end element", () => {
        const tree = new Formatter().format(bookmark.end);

        expect(tree["w:bookmarkEnd"]._attr["w:id"]).to.be.a("number");
    });

    it("should give each bookmark a distinct id shared by its start and end elements", () => {
        const other = new Bookmark({
            id: "other-anchor",
            children: [new TextRun("Other Link")],
        });

        const formatter = new Formatter();
        const context = { session: createRenderSession(), stack: [] };
        const firstStartId = formatter.format(bookmark.start, context)["w:bookmarkStart"]._attr[
            "w:id"
        ];
        const firstEndId = formatter.format(bookmark.end, context)["w:bookmarkEnd"]._attr["w:id"];
        const secondStartId = formatter.format(other.start, context)["w:bookmarkStart"]._attr[
            "w:id"
        ];
        const secondEndId = formatter.format(other.end, context)["w:bookmarkEnd"]._attr["w:id"];

        assert.equal(firstStartId, firstEndId);
        assert.equal(secondStartId, secondEndId);
        assert.notEqual(firstStartId, secondStartId);
    });
});
