import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { AlignmentType } from "..";
import { NumberFormat } from "../shared/number-format";
import { Level, LevelFormat, LevelSuffix } from "./level";

describe("Level", () => {
    it("uses the canonical number format table and preserves legacy aliases", () => {
        expect(LevelFormat).toBe(NumberFormat);
        expect(LevelFormat.IDEOGRAPH__DIGITAL).toBe(NumberFormat.IDEOGRAPH_DIGITAL);
        expect(LevelFormat.DECIMAL_FULL_WIDTH2).toBe(NumberFormat.DECIMAL_FULL_WIDTH_2);
        expect(LevelFormat.CUSTOM).toBe("custom");
    });

    describe("#constructor", () => {
        it.each([-1, 9, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
            "should reject invalid level %s",
            (level) => {
                expect(
                    () =>
                        new Level({
                            level,
                            format: LevelFormat.BULLET,
                            text: "test",
                            alignment: AlignmentType.BOTH,
                            start: 3,
                            style: { run: {}, paragraph: {} },
                            suffix: LevelSuffix.SPACE,
                        }),
                ).toThrow(/Invalid numbering level/);
            },
        );

        it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
            "should reject invalid start %s",
            (start) => {
                expect(() => new Level({ level: 0, start })).toThrow(/Invalid numbering start/);
            },
        );
    });

    describe("isLegalNumberingStyle", () => {
        it("should work", () => {
            const concreteNumbering = new Level({
                level: 8,
                isLegalNumberingStyle: true,
            });
            const tree = new Formatter().format(concreteNumbering);
            expect(tree).to.deep.equal({
                "w:lvl": [
                    {
                        "w:start": {
                            _attr: {
                                "w:val": 1,
                            },
                        },
                    },
                    {
                        "w:isLgl": {},
                    },
                    {
                        "w:lvlJc": {
                            _attr: {
                                "w:val": "start",
                            },
                        },
                    },
                    {
                        _attr: {
                            "w15:tentative": 1,
                            "w:ilvl": 8,
                        },
                    },
                ],
            });
        });
    });
});
