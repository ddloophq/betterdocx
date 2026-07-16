import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { Numbering } from "./numbering";

describe("Numbering", () => {
    describe("#constructor", () => {
        it("creates a default numbering with one abstract and one concrete instance", () => {
            const numbering = new Numbering({
                config: [],
            });

            const tree = new Formatter().format(numbering);
            expect(Object.keys(tree)).to.deep.equal(["w:numbering"]);

            const abstractNums: readonly any[] = tree["w:numbering"].filter(
                (el: any) => el["w:abstractNum"],
            );
            expect(abstractNums).to.have.lengthOf(1);
            expect(abstractNums[0]["w:abstractNum"]).to.deep.include.members([
                { _attr: { "w:abstractNumId": 1, "w15:restartNumberingAfterBreak": 0 } },
                { "w:multiLevelType": { _attr: { "w:val": "hybridMultilevel" } } },
            ]);

            abstractNums
                .filter((el) => el["w:lvl"])
                .forEach((el, ix) => {
                    expect(Object.keys(el)).to.have.lengthOf(1);
                    expect(Object.keys(el["w:lvl"])).to.deep.equal([
                        "_attr",
                        "w:start",
                        "w:lvlJc",
                        "w:numFmt",
                        "w:pPr",
                        "w:rPr",
                    ]);
                    expect(el["w:lvl"]).to.have.deep.members([
                        { _attr: { "w:ilvl": ix, "w15:tentative": 1 } },
                        { "w:start": [{ _attr: { "w:val": 1 } }] },
                        { "w:lvlJc": [{ _attr: { "w:val": "left" } }] },
                        { "w:numFmt": [{ _attr: { "w:val": "bullet" } }] },
                    ]);
                    // TODO
                    // Once chai 4.0.0 lands and #644 is resolved, we can add the following to the test:
                    // {"w:lvlText": {"_attr": {"w:val": "•"}}},
                    // {"w:rPr": [{"w:rFonts": {"_attr": {"w:ascii": "Symbol", "w:cs": "Symbol", "w:eastAsia": "Symbol", "w:hAnsi": "Symbol", "w:hint": "default"}}}]},
                    // {"w:pPr": [
                    //            {"w:ind": [{"_attr": {"w:left": 720, "w:hanging": 360}}]}]},
                });
        });

        describe("#createConcreteNumberingInstance", () => {
            it("should create a concrete numbering instance", () => {
                const numbering = new Numbering({
                    config: [
                        {
                            reference: "test-reference",
                            levels: [
                                {
                                    level: 0,
                                },
                            ],
                        },
                    ],
                });
                expect(numbering.ConcreteNumbering).to.have.length(1);

                numbering.createConcreteNumberingInstance("test-reference", 0);

                expect(numbering.ConcreteNumbering).to.have.length(2);
            });

            it("should not create a concrete numbering instance if reference is invalid", () => {
                const numbering = new Numbering({
                    config: [
                        {
                            reference: "test-reference",
                            levels: [
                                {
                                    level: 0,
                                },
                            ],
                        },
                    ],
                });
                expect(numbering.ConcreteNumbering).to.have.length(1);

                numbering.createConcreteNumberingInstance("invalid-reference", 0);

                expect(numbering.ConcreteNumbering).to.have.length(1);
            });

            it("should not create a concrete numbering instance if one already exists", () => {
                const numbering = new Numbering({
                    config: [
                        {
                            reference: "test-reference",
                            levels: [
                                {
                                    level: 0,
                                },
                            ],
                        },
                    ],
                });

                expect(numbering.ConcreteNumbering).to.have.length(1);

                numbering.createConcreteNumberingInstance("test-reference", 0);
                numbering.createConcreteNumberingInstance("test-reference", 0);

                expect(numbering.ConcreteNumbering).to.have.length(2);
            });

            it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
                "should reject invalid instance %s",
                (instance) => {
                    const numbering = new Numbering({
                        config: [{ reference: "test-reference", levels: [{ level: 0 }] }],
                    });

                    expect(() =>
                        numbering.createConcreteNumberingInstance("test-reference", instance),
                    ).toThrow(/Invalid numbering instance/);
                },
            );

            it("should preserve a configured start of zero in the concrete override", () => {
                const numbering = new Numbering({
                    config: [{ reference: "zero-start", levels: [{ level: 0, start: 0 }] }],
                });

                numbering.createConcreteNumberingInstance("zero-start", 0);
                const tree = new Formatter().format(numbering);

                expect(JSON.stringify(tree)).toContain('"w:startOverride":{"_attr":{"w:val":0}}');
            });
        });

        it("should reject duplicate references", () => {
            expect(
                () =>
                    new Numbering({
                        config: [
                            { reference: "duplicate", levels: [{ level: 0 }] },
                            { reference: "duplicate", levels: [{ level: 1 }] },
                        ],
                    }),
            ).toThrow("Duplicate numbering reference 'duplicate'.");
        });

        it("should reject duplicate levels within a reference", () => {
            expect(
                () =>
                    new Numbering({
                        config: [
                            {
                                reference: "duplicate-level",
                                levels: [{ level: 0 }, { level: 0 }],
                            },
                        ],
                    }),
            ).toThrow("Duplicate numbering level '0'.");
        });
        describe("#idOffsets", () => {
            it("should keep the default bullet numbering at numId 1 when no offsets are given", () => {
                const numbering = new Numbering({ config: [] });

                expect(numbering.ConcreteNumbering[0].numId).to.equal(1);
            });

            it("should generate all ids above the given offsets", () => {
                const numbering = new Numbering(
                    {
                        config: [
                            {
                                reference: "test-reference",
                                levels: [
                                    {
                                        level: 0,
                                    },
                                ],
                            },
                        ],
                    },
                    { abstractNum: 22, num: 41 },
                );

                numbering.createConcreteNumberingInstance("test-reference", 0);
                numbering.createConcreteNumberingInstance("test-reference", 1);

                for (const concreteNumbering of numbering.ConcreteNumbering) {
                    expect(concreteNumbering.numId).to.be.greaterThan(41);
                }
                expect(numbering.getAbstractNumbering("test-reference")?.id).to.be.greaterThan(22);
            });
        });
        describe("#referenceConfigMap", () => {
            it("should store level configs into referenceConfigMap", () => {
                const numbering = new Numbering({
                    config: [
                        {
                            reference: "test-reference",
                            levels: [
                                {
                                    level: 0,
                                    start: 10,
                                },
                            ],
                        },
                    ],
                });
                numbering.createConcreteNumberingInstance("test-reference", 0);
                const referenceConfig = numbering.ReferenceConfig[0];
                const zeroLevelConfig = referenceConfig[0];
                expect(zeroLevelConfig.start).to.be.equal(10);
            });
        });
    });
});
