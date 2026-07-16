import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { MathRun } from "../math-run";
import {
    MathAngledBrackets,
    MathCurlyBrackets,
    MathRoundBrackets,
    MathSquareBrackets,
    createMathBracketProperties,
} from "./math-brackets";

describe("createMathBracketProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathBracketProperties with correct root key", () => {
            const mathBracketProperties = createMathBracketProperties({});

            const tree = new Formatter().format(mathBracketProperties);
            expect(tree).to.deep.equal({
                "m:dPr": {},
            });
        });

        it("should create a MathBracketProperties with correct root key and add brackets", () => {
            const mathBracketProperties = createMathBracketProperties({
                characters: {
                    beginningCharacter: "[",
                    endingCharacter: "]",
                },
            });

            const tree = new Formatter().format(mathBracketProperties);
            expect(tree).to.deep.equal({
                "m:dPr": [
                    {
                        "m:begChr": {
                            _attr: {
                                "m:val": "[",
                            },
                        },
                    },
                    {
                        "m:endChr": {
                            _attr: {
                                "m:val": "]",
                            },
                        },
                    },
                ],
            });
        });
    });
});

describe("MathRoundBrackets", () => {
    describe("#constructor()", () => {
        it("should create a MathRoundBrackets with correct root key", () => {
            const mathRoundBrackets = new MathRoundBrackets({
                children: [new MathRun("60")],
            });

            const tree = new Formatter().format(mathRoundBrackets);
            expect(tree).to.deep.equal({
                "m:d": [
                    {
                        "m:dPr": {},
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

describe("MathSquareBrackets", () => {
    describe("#constructor()", () => {
        it("should create a MathSquareBrackets with correct root key", () => {
            const mathSquareBrackets = new MathSquareBrackets({
                children: [new MathRun("60")],
            });

            const tree = new Formatter().format(mathSquareBrackets);
            expect(tree).to.deep.equal({
                "m:d": [
                    {
                        "m:dPr": [
                            {
                                "m:begChr": {
                                    _attr: {
                                        "m:val": "[",
                                    },
                                },
                            },
                            {
                                "m:endChr": {
                                    _attr: {
                                        "m:val": "]",
                                    },
                                },
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

describe("MathCurlyBrackets", () => {
    describe("#constructor()", () => {
        it("should create a MathCurlyBrackets with correct root key", () => {
            const mathCurlyBrackets = new MathCurlyBrackets({
                children: [new MathRun("60")],
            });

            const tree = new Formatter().format(mathCurlyBrackets);
            expect(tree).to.deep.equal({
                "m:d": [
                    {
                        "m:dPr": [
                            {
                                "m:begChr": {
                                    _attr: {
                                        "m:val": "{",
                                    },
                                },
                            },
                            {
                                "m:endChr": {
                                    _attr: {
                                        "m:val": "}",
                                    },
                                },
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

describe("MathAngledBrackets", () => {
    describe("#constructor()", () => {
        it("should create a MathAngledBrackets with correct root key", () => {
            const mathAngledBrackets = new MathAngledBrackets({
                children: [new MathRun("60")],
            });

            const tree = new Formatter().format(mathAngledBrackets);
            expect(tree).to.deep.equal({
                "m:d": [
                    {
                        "m:dPr": [
                            {
                                "m:begChr": {
                                    _attr: {
                                        "m:val": "〈",
                                    },
                                },
                            },
                            {
                                "m:endChr": {
                                    _attr: {
                                        "m:val": "〉",
                                    },
                                },
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
