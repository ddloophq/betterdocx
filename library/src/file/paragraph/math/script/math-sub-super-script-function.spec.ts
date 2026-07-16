import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import {
    MathSubSuperScript,
    createMathSubSuperScriptProperties,
} from "./math-sub-super-script-function";

describe("MathSubSuperScript", () => {
    describe("#constructor()", () => {
        it("should create a MathSubSuperScript with correct root key", () => {
            const mathSubScript = new MathSubSuperScript({
                children: [new MathRun("e")],
                subScript: [new MathRun("2")],
                superScript: [new MathRun("5")],
            });

            const tree = new Formatter().format(mathSubScript);
            expect(tree).to.deep.equal({
                "m:sSubSup": [
                    {
                        "m:sSubSupPr": {},
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
                    {
                        "m:sup": [
                            {
                                "m:r": [
                                    {
                                        "m:t": ["5"],
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

describe("createMathSubSuperScriptProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathSubSuperScriptProperties with correct root key", () => {
            const mathSubSuperScriptProperties = createMathSubSuperScriptProperties();

            const tree = new Formatter().format(mathSubSuperScriptProperties);
            expect(tree).to.deep.equal({
                "m:sSubSupPr": {},
            });
        });
    });
});
