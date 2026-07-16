import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import { MathLimit, MathLimitLower, MathLimitUpper } from "./math-limit";

describe("MathLimit", () => {
    describe("#constructor()", () => {
        it("should create a MathLimit with correct root key", () => {
            const mathLimit = new MathLimit([new MathRun("x→0")]);

            const tree = new Formatter().format(mathLimit);
            expect(tree).to.deep.equal({
                "m:lim": [
                    {
                        "m:r": [
                            {
                                "m:t": ["x→0"],
                            },
                        ],
                    },
                ],
            });
        });
    });
});

describe("MathLimitUpper", () => {
    describe("#constructor()", () => {
        it("should create a MathLimitUpper with correct root key", () => {
            const mathLimitUpper = new MathLimitUpper({
                children: [new MathRun("x")],
                limit: [new MathRun("-")],
            });

            const tree = new Formatter().format(mathLimitUpper);
            expect(tree).to.deep.equal({
                "m:limUpp": [
                    {
                        "m:e": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["x"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "m:lim": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["-"],
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

describe("MathLimitLower", () => {
    describe("#constructor()", () => {
        it("should create a MathLimitLower with correct root key", () => {
            const mathLimitLower = new MathLimitLower({
                children: [new MathRun("lim")],
                limit: [new MathRun("x→0")],
            });

            const tree = new Formatter().format(mathLimitLower);
            expect(tree).to.deep.equal({
                "m:limLow": [
                    {
                        "m:e": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["lim"],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "m:lim": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["x→0"],
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
