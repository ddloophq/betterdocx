import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import { MathDegree, MathRadical, MathRadicalProperties } from "./math-radical";

describe("MathRadical", () => {
    describe("#constructor()", () => {
        it("should create a MathRadical with correct root key", () => {
            const mathRadical = new MathRadical({
                children: [new MathRun("e")],
                degree: [new MathRun("2")],
            });

            const tree = new Formatter().format(mathRadical);
            expect(tree).to.deep.equal({
                "m:rad": [
                    {
                        "m:radPr": {},
                    },
                    {
                        "m:deg": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["2"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "m:e": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["e"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });
    });
});

describe("MathRadicalProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathRadicalProperties with correct root key", () => {
            const mathRadicalProperties = new MathRadicalProperties(true);

            const tree = new Formatter().format(mathRadicalProperties);
            expect(tree).to.deep.equal({
                "m:radPr": {},
            });
        });

        it("should create a MathRadicalProperties with correct root key with degree hide", () => {
            const mathRadicalProperties = new MathRadicalProperties(false);

            const tree = new Formatter().format(mathRadicalProperties);
            expect(tree).to.deep.equal({
                "m:radPr": [
                    {
                        "m:degHide": {
                            _attr: {
                                "m:val": 1,
                            },
                        },
                    },
                ],
            });
        });
    });
});

describe("MathDegree", () => {
    describe("#constructor()", () => {
        it("should create a MathDegree with correct root key", () => {
            const mathDegree = new MathDegree();

            const tree = new Formatter().format(mathDegree);
            expect(tree).to.deep.equal({
                "m:deg": {},
            });
        });

        it("should create a MathDegree with correct root key with child", () => {
            const mathDegree = new MathDegree([new MathRun("2")]);

            const tree = new Formatter().format(mathDegree);
            expect(tree).to.deep.equal({
                "m:deg": [
                    {
                        "m:r": [
                            {
                                "m:t": ["2"],
                            },
                        ],
                    },
                ],
            });
        });
    });
});
