import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import { MathSuperScript, createMathSuperScriptProperties } from "./math-super-script-function";

describe("MathSuperScript", () => {
    describe("#constructor()", () => {
        it("should create a MathSuperScript with correct root key", () => {
            const mathSuperScript = new MathSuperScript({
                children: [new MathRun("e")],
                superScript: [new MathRun("2")],
            });

            const tree = new Formatter().format(mathSuperScript);
            expect(tree).to.deep.equal({
                "m:sSup": [
                    {
                        "m:sSupPr": {},
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
                    {
                        "m:sup": [
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

describe("createMathSuperScriptProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathSuperScriptProperties with correct root key", () => {
            const mathSuperScriptProperties = createMathSuperScriptProperties();

            const tree = new Formatter().format(mathSuperScriptProperties);
            expect(tree).to.deep.equal({
                "m:sSupPr": {},
            });
        });
    });
});
