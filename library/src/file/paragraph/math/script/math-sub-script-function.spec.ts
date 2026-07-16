import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import { MathSubScript, createMathSubScriptProperties } from "./math-sub-script-function";

describe("MathSubScript", () => {
    describe("#constructor()", () => {
        it("should create a MathSubScript with correct root key", () => {
            const mathSubScript = new MathSubScript({
                children: [new MathRun("e")],
                subScript: [new MathRun("2")],
            });

            const tree = new Formatter().format(mathSubScript);
            expect(tree).to.deep.equal({
                "m:sSub": [
                    {
                        "m:sSubPr": {},
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
                        "m:sub": [
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

describe("createMathSubScriptProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathSubScriptProperties with correct root key", () => {
            const mathSubScriptProperties = createMathSubScriptProperties();

            const tree = new Formatter().format(mathSubScriptProperties);
            expect(tree).to.deep.equal({
                "m:sSubPr": {},
            });
        });
    });
});
