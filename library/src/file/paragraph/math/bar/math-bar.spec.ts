import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import { createMathBar, createMathBarProperties } from "./math-bar";

describe("MathBar", () => {
    describe("#constructor()", () => {
        it("should create a MathBar with correct root key", () => {
            const mathBar = createMathBar({ type: "top", children: [new MathRun("text")] });
            const tree = new Formatter().format(mathBar);

            expect(tree).to.deep.equal({
                "m:bar": [
                    {
                        "m:barPr": [
                            {
                                "m:pos": {
                                    _attr: {
                                        "m:val": "top",
                                    },
                                },
                            },
                        ],
                    },
                    {
                        "m:e": [
                            {
                                "m:r": [{ "m:t": ["text"] }],
                            },
                        ],
                    },
                ],
            });
        });
    });
});

describe("MathBarProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathBarProperties with top key", () => {
            const mathBarProperties = createMathBarProperties({ type: "top" });

            const tree = new Formatter().format(mathBarProperties);

            expect(tree).to.deep.equal({
                "m:barPr": [
                    {
                        "m:pos": {
                            _attr: {
                                "m:val": "top",
                            },
                        },
                    },
                ],
            });
        });
        it("should create a MathBarProperties with bottom key", () => {
            const mathBarProperties = createMathBarProperties({ type: "bot" });

            const tree = new Formatter().format(mathBarProperties);

            expect(tree).to.deep.equal({
                "m:barPr": [
                    {
                        "m:pos": {
                            _attr: {
                                "m:val": "bot",
                            },
                        },
                    },
                ],
            });
        });
    });
});
