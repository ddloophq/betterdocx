import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import { MathDenominator, MathFraction, MathNumerator } from "./math-fraction";

describe("MathFraction", () => {
    describe("#constructor()", () => {
        it("should create a MathFraction with correct root key", () => {
            const mathFraction = new MathFraction({
                numerator: [new MathRun("2")],
                denominator: [new MathRun("2")],
            });
            const tree = new Formatter().format(mathFraction);
            expect(tree).to.deep.equal({
                "m:f": [
                    {
                        "m:num": [
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
                        "m:den": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["2"],
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

describe("MathNumerator", () => {
    describe("#constructor()", () => {
        it("should create a MathNumerator with correct root key", () => {
            const mathNumerator = new MathNumerator([new MathRun("2+2")]);
            const tree = new Formatter().format(mathNumerator);
            expect(tree).to.deep.equal({
                "m:num": [
                    {
                        "m:r": [
                            {
                                "m:t": ["2+2"],
                            },
                        ],
                    },
                ],
            });
        });
    });
});

describe("MathDenominator", () => {
    describe("#constructor()", () => {
        it("should create a MathDenominator with correct root key", () => {
            const mathDenominator = new MathDenominator([new MathRun("2+2")]);
            const tree = new Formatter().format(mathDenominator);
            expect(tree).to.deep.equal({
                "m:den": [
                    {
                        "m:r": [
                            {
                                "m:t": ["2+2"],
                            },
                        ],
                    },
                ],
            });
        });
    });
});
