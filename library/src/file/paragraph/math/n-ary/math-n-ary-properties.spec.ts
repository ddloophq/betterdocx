import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import {
    createMathAccentCharacter,
    createMathLimitLocation,
    createMathNAryProperties,
} from "./math-n-ary-properties";

describe("createMathNAryProperties", () => {
    describe("#constructor()", () => {
        it("should create a MathNAryProperties with correct root key", () => {
            const mathNAryProperties = createMathNAryProperties({
                accent: "∑",
                hasSuperScript: true,
                hasSubScript: true,
            });

            const tree = new Formatter().format(mathNAryProperties);
            expect(tree).to.deep.equal({
                "m:naryPr": [
                    {
                        "m:chr": {
                            _attr: {
                                "m:val": "∑",
                            },
                        },
                    },
                    {
                        "m:limLoc": {
                            _attr: {
                                "m:val": "undOvr",
                            },
                        },
                    },
                ],
            });
        });

        it("should add super-script hide attributes", () => {
            const mathNAryProperties = createMathNAryProperties({
                accent: "∑",
                hasSuperScript: false,
                hasSubScript: true,
            });

            const tree = new Formatter().format(mathNAryProperties);
            expect(tree).to.deep.equal({
                "m:naryPr": [
                    {
                        "m:chr": {
                            _attr: {
                                "m:val": "∑",
                            },
                        },
                    },
                    {
                        "m:limLoc": {
                            _attr: {
                                "m:val": "undOvr",
                            },
                        },
                    },
                    {
                        "m:supHide": {
                            _attr: {
                                "m:val": 1,
                            },
                        },
                    },
                ],
            });
        });

        it("should add sub-script hide attributes", () => {
            const mathNAryProperties = createMathNAryProperties({
                accent: "∑",
                hasSuperScript: true,
                hasSubScript: false,
            });

            const tree = new Formatter().format(mathNAryProperties);
            expect(tree).to.deep.equal({
                "m:naryPr": [
                    {
                        "m:chr": {
                            _attr: {
                                "m:val": "∑",
                            },
                        },
                    },
                    {
                        "m:limLoc": {
                            _attr: {
                                "m:val": "undOvr",
                            },
                        },
                    },
                    {
                        "m:subHide": {
                            _attr: {
                                "m:val": 1,
                            },
                        },
                    },
                ],
            });
        });

        it("should add both super-script and sub-script hide attributes", () => {
            const mathNAryProperties = createMathNAryProperties({
                accent: "∑",
                hasSuperScript: false,
                hasSubScript: false,
            });

            const tree = new Formatter().format(mathNAryProperties);
            expect(tree).to.deep.equal({
                "m:naryPr": [
                    {
                        "m:chr": {
                            _attr: {
                                "m:val": "∑",
                            },
                        },
                    },
                    {
                        "m:limLoc": {
                            _attr: {
                                "m:val": "undOvr",
                            },
                        },
                    },
                    {
                        "m:supHide": {
                            _attr: {
                                "m:val": 1,
                            },
                        },
                    },
                    {
                        "m:subHide": {
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

describe("createMathAccentCharacter", () => {
    describe("#constructor()", () => {
        it("should create a MathAccentCharacter with correct root key", () => {
            const mathAccentCharacter = createMathAccentCharacter({ accent: "∑" });

            const tree = new Formatter().format(mathAccentCharacter);
            expect(tree).to.deep.equal({
                "m:chr": {
                    _attr: {
                        "m:val": "∑",
                    },
                },
            });
        });
    });
});

describe("createMathLimitLocation", () => {
    describe("#constructor()", () => {
        it("should create a MathLimitLocation with correct root key", () => {
            const mathLimitLocation = createMathLimitLocation({});

            const tree = new Formatter().format(mathLimitLocation);
            expect(tree).to.deep.equal({
                "m:limLoc": {
                    _attr: {
                        "m:val": "undOvr",
                    },
                },
            });
        });
    });
});
