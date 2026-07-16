import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import { MathFunction, MathFunctionName, MathFunctionProperties } from "./math-function";

describe("MathFunction", () => {
    describe("#constructor()", () => {
        it("should create a MathFunction with correct root key", () => {
            const mathFunction = new MathFunction({
                name: [new MathRun("sin")],
                children: [new MathRun("60")],
            });

            const tree = new Formatter().format(mathFunction);
            expect(tree).to.deep.equal({
                "m:func": [
                    {
                        "m:funcPr": {},
                    },
                    {
                        "m:fName": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["sin"],
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
                                        "m:t": ["60"],
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

describe("MathFunctionName", () => {
    describe("#constructor()", () => {
        it("should create a MathFunctionName with correct root key", () => {
            const mathFunctionName = new MathFunctionName([new MathRun("2")]);

            const tree = new Formatter().format(mathFunctionName);
            expect(tree).to.deep.equal({
                "m:fName": [
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

describe("MathFunctionProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathFunctionProperties with correct root key", () => {
            const mathFunctionProperties = new MathFunctionProperties();

            const tree = new Formatter().format(mathFunctionProperties);
            expect(tree).to.deep.equal({
                "m:funcPr": {},
            });
        });
    });
});
