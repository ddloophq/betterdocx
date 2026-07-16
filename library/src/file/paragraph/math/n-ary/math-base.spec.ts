import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import {
    createMathBase,
    createMathSubScriptElement,
    createMathSuperScriptElement,
} from "./math-base";

describe("createMathBase", () => {
    describe("#constructor()", () => {
        it("should create a MathBase with correct root key", () => {
            const mathBase = createMathBase({ children: [new MathRun("2+2")] });

            const tree = new Formatter().format(mathBase);
            expect(tree).to.deep.equal({
                "m:e": [
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

describe("createMathSubScriptElement", () => {
    describe("#constructor()", () => {
        it("should create a MathSubScriptElement with correct root key", () => {
            const mathSubScriptElement = createMathSubScriptElement({
                children: [new MathRun("2+2")],
            });

            const tree = new Formatter().format(mathSubScriptElement);
            expect(tree).to.deep.equal({
                "m:sub": [
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

describe("createMathSuperScriptElement", () => {
    describe("#constructor()", () => {
        it("should create a MathSuperScriptElement with correct root key", () => {
            const mathSuperScriptElement = createMathSuperScriptElement({
                children: [new MathRun("2+2")],
            });

            const tree = new Formatter().format(mathSuperScriptElement);
            expect(tree).to.deep.equal({
                "m:sup": [
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
