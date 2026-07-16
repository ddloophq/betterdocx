import { assert, beforeEach, describe, expect, it } from "vitest";

import { Utility } from "@tests/utility";

import { LeaderType, TabStop, TabStopPosition, TabStopType } from "./tab-stop";

describe("TabStop validation", () => {
    it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "rejects non-integral position %s",
        (position) => {
            expect(() => new TabStop([{ type: TabStopType.LEFT, position }])).toThrow(
                /finite integer number of twips/,
            );
        },
    );

    it("accepts the maximum predefined tab stop position", () => {
        expect(
            () => new TabStop([{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]),
        ).not.toThrow();
    });
});

describe("LeftTabStop", () => {
    let tabStop: TabStop;

    beforeEach(() => {
        tabStop = new TabStop([{ type: TabStopType.LEFT, position: 100 }]);
    });

    describe("#constructor()", () => {
        it("should create a Tab Stop with correct attributes", () => {
            const newJson = Utility.jsonify(tabStop);
            const attributes = {
                val: "left",
                pos: 100,
            };
            assert.equal(JSON.stringify(newJson.root[0].root[0].root), JSON.stringify(attributes));
        });

        it("should create a Tab Stop with w:tab", () => {
            const newJson = Utility.jsonify(tabStop);
            assert.equal(newJson.root[0].rootKey, "w:tab");
        });
    });
});

describe("RightTabStop", () => {
    let tabStop: TabStop;

    beforeEach(() => {
        tabStop = new TabStop([{ type: TabStopType.RIGHT, position: 100, leader: LeaderType.DOT }]);
    });

    describe("#constructor()", () => {
        it("should create a Tab Stop with correct attributes", () => {
            const newJson = Utility.jsonify(tabStop);
            const attributes = {
                val: "right",
                pos: 100,
                leader: "dot",
            };
            assert.equal(JSON.stringify(newJson.root[0].root[0].root), JSON.stringify(attributes));
        });

        it("should create a Tab Stop with w:tab", () => {
            const newJson = Utility.jsonify(tabStop);
            assert.equal(newJson.root[0].rootKey, "w:tab");
        });
    });
});
