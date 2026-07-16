import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { BorderStyle } from "../border";
import { AlignmentType, Paragraph } from "../paragraph";
import { ITableOptions, Table } from "./table";
import { TableCell } from "./table-cell";
import {
    RelativeHorizontalPosition,
    RelativeVerticalPosition,
    TableAnchorType,
} from "./table-properties";
import { TableLayoutType } from "./table-properties/table-layout";
import { DEFAULT_TABLE_STYLE_OPTIONS, ITableStyleOptions } from "./table-properties/table-look";
import { TableRow } from "./table-row";
import { WidthType } from "./table-width";

const BORDERS = {
    "w:tblBorders": [
        { "w:top": { _attr: { "w:val": "single", "w:sz": 4, "w:color": "auto" } } },
        { "w:left": { _attr: { "w:val": "single", "w:sz": 4, "w:color": "auto" } } },
        { "w:bottom": { _attr: { "w:val": "single", "w:sz": 4, "w:color": "auto" } } },
        { "w:right": { _attr: { "w:val": "single", "w:sz": 4, "w:color": "auto" } } },
        { "w:insideH": { _attr: { "w:val": "single", "w:sz": 4, "w:color": "auto" } } },
        { "w:insideV": { _attr: { "w:val": "single", "w:sz": 4, "w:color": "auto" } } },
    ],
};

const WIDTHS = {
    "w:tblW": {
        _attr: {
            "w:type": "auto",
            "w:w": 100,
        },
    },
};

// Word's implied default, written out explicitly. See DEFAULT_TABLE_STYLE_OPTIONS.
const TABLE_LOOK = {
    "w:tblLook": {
        _attr: {
            "w:firstRow": true,
            "w:lastRow": false,
            "w:firstColumn": true,
            "w:lastColumn": false,
            "w:noHBand": false,
            "w:noVBand": true,
        },
    },
};

// const f = {
//     "w:tbl": [
//         {
//             "w:tblPr": [
//                 {
//                     "w:tblCellMar": [
//                         { "w:bottom": { _attr: { "w:type": "auto", "w:w": 0 } } },
//                         { "w:top": { _attr: { "w:type": "auto", "w:w": 0 } } },
//                         { "w:left": { _attr: { "w:type": "auto", "w:w": 0 } } },
//                         { "w:right": { _attr: { "w:type": "auto", "w:w": 0 } } },
//                     ],
//                 },
//                 {
//                     "w:tblBorders": [
//                         { "w:top": { _attr: { "w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "auto" } } },
//                         { "w:left": { _attr: { "w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "auto" } } },
//                         { "w:bottom": { _attr: { "w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "auto" } } },
//                         { "w:right": { _attr: { "w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "auto" } } },
//                         { "w:insideH": { _attr: { "w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "auto" } } },
//                         { "w:insideV": { _attr: { "w:val": "single", "w:sz": 4, "w:space": 0, "w:color": "auto" } } },
//                     ],
//                 },
//                 { "w:tblW": { _attr: { "w:type": "auto", "w:w": 100 } } },
//                 {
//                     "w:tblpPr": {
//                         _attr: {
//                             "w:horzAnchor": "margin",
//                             "w:vertAnchor": "page",
//                             "w:tblpX": 10,
//                             "w:tblpXSpec": "center",
//                             "w:tblpY": 20,
//                             "w:tblpYSpec": "bottom",
//                             "w:bottomFromText": 30,
//                             "w:topFromText": 40,
//                             "w:leftFromText": 50,
//                             "w:rightFromText": 60,
//                         },
//                     },
//                 },
//             ],
//         },
//         { "w:tblGrid": [{ "w:gridCol": { _attr: { "w:w": 100 } } }] },
//         { "w:tr": [{ "w:tc": [{ "w:p": EMPTY_OBJECT }] }] },
//     ],
// };

describe("Table", () => {
    describe("#constructor", () => {
        it("creates a table with the correct number of rows and columns", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
            });
            const tree = new Formatter().format(table);
            const cell = {
                "w:tc": [
                    {
                        "w:p": [
                            {
                                "w:r": [
                                    {
                                        "w:t": [
                                            {
                                                _attr: {
                                                    "xml:space": "preserve",
                                                },
                                            },
                                            "hello",
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            expect(tree).to.deep.equal({
                "w:tbl": [
                    { "w:tblPr": [WIDTHS, BORDERS, TABLE_LOOK] },
                    {
                        "w:tblGrid": [
                            { "w:gridCol": { _attr: { "w:w": 100 } } },
                            { "w:gridCol": { _attr: { "w:w": 100 } } },
                        ],
                    },
                    { "w:tr": [cell, cell] },
                    { "w:tr": [cell, cell] },
                    { "w:tr": [cell, cell] },
                ],
            });
        });

        it("creates a table with the correct columnSpan and rowSpan", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                                columnSpan: 2,
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                                rowSpan: 2,
                            }),
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
            });
            const tree = new Formatter().format(table);
            const cellP = {
                "w:p": [{ "w:r": [{ "w:t": [{ _attr: { "xml:space": "preserve" } }, "hello"] }] }],
            };
            expect(tree).to.deep.equal({
                "w:tbl": [
                    { "w:tblPr": [WIDTHS, BORDERS, TABLE_LOOK] },
                    {
                        "w:tblGrid": [
                            { "w:gridCol": { _attr: { "w:w": 100 } } },
                            { "w:gridCol": { _attr: { "w:w": 100 } } },
                        ],
                    },
                    {
                        "w:tr": [
                            {
                                "w:tc": [
                                    { "w:tcPr": [{ "w:gridSpan": { _attr: { "w:val": 2 } } }] },
                                    cellP,
                                ],
                            },
                        ],
                    },
                    {
                        "w:tr": [
                            {
                                "w:tc": [
                                    {
                                        "w:tcPr": [
                                            { "w:vMerge": { _attr: { "w:val": "restart" } } },
                                        ],
                                    },
                                    cellP,
                                ],
                            },
                            { "w:tc": [cellP] },
                        ],
                    },
                    {
                        "w:tr": [
                            {
                                "w:tc": [
                                    {
                                        "w:tcPr": [
                                            { "w:vMerge": { _attr: { "w:val": "continue" } } },
                                        ],
                                    },
                                    { "w:p": {} },
                                ],
                            },
                            { "w:tc": [cellP] },
                        ],
                    },
                ],
            });
        });

        it("does not mutate rows while expanding row spans", () => {
            const firstRow = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph("spanning")],
                        rowSpan: 2,
                    }),
                ],
            });
            const secondRow = new TableRow({
                children: [new TableCell({ children: [new Paragraph("second")] })],
            });

            const firstTable = new Table({ rows: [firstRow, secondRow] });
            const secondTable = new Table({ rows: [firstRow, secondRow] });

            expect(firstRow.CellCount).to.equal(1);
            expect(secondRow.CellCount).to.equal(1);
            expect(firstRow.cells).to.have.length(1);
            expect(secondRow.cells).to.have.length(1);
            expect(new Formatter().format(firstTable)).to.deep.equal(
                new Formatter().format(secondTable),
            );
        });

        it("creates an empty table without throwing", () => {
            const table = new Table({ rows: [] });
            const tree = new Formatter().format(table);

            expect(tree).to.deep.equal({
                "w:tbl": [{ "w:tblPr": [WIDTHS, BORDERS, TABLE_LOOK] }, { "w:tblGrid": {} }],
            });
        });

        it("sizes the default grid by columnSpan, not cell count", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                                columnSpan: 3,
                            }),
                        ],
                    }),
                ],
            });
            const tree = new Formatter().format(table);

            expect(tree["w:tbl"][1]).to.deep.equal({
                "w:tblGrid": [
                    { "w:gridCol": { _attr: { "w:w": 100 } } },
                    { "w:gridCol": { _attr: { "w:w": 100 } } },
                    { "w:gridCol": { _attr: { "w:w": 100 } } },
                ],
            });
        });

        it("sets the table to fixed width layout", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
                layout: TableLayoutType.FIXED,
            });
            const tree = new Formatter().format(table);
            expect(tree).to.have.property("w:tbl").which.is.an("array").with.has.length.at.least(1);
            expect(tree["w:tbl"][0]).to.deep.equal({
                "w:tblPr": [
                    WIDTHS,
                    BORDERS,
                    { "w:tblLayout": { _attr: { "w:type": "fixed" } } },
                    TABLE_LOOK,
                ],
            });
        });

        it("should set table-level shading", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
                shading: {
                    fill: "b79c2f",
                    color: "auto",
                },
            });
            const tree = new Formatter().format(table);
            expect(tree).to.have.property("w:tbl").which.is.an("array").with.has.length.at.least(1);
            expect(tree["w:tbl"][0]).to.deep.equal({
                "w:tblPr": [
                    WIDTHS,
                    BORDERS,
                    { "w:shd": { _attr: { "w:fill": "b79c2f", "w:color": "auto" } } },
                    TABLE_LOOK,
                ],
            });
        });

        it("should center the table", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
                alignment: AlignmentType.CENTER,
            });
            const tree = new Formatter().format(table);
            expect(tree).to.have.property("w:tbl").which.is.an("array").with.has.length.at.least(1);
            expect(tree["w:tbl"][0]).to.deep.equal({
                "w:tblPr": [
                    WIDTHS,
                    { "w:jc": { _attr: { "w:val": "center" } } },
                    BORDERS,
                    TABLE_LOOK,
                ],
            });
        });

        it("should set the table to provided 100% width", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
                width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                },
                layout: TableLayoutType.FIXED,
            });
            const tree = new Formatter().format(table);
            expect(tree).to.have.property("w:tbl").which.is.an("array").with.has.length.at.least(1);
            expect(tree["w:tbl"][0]).to.deep.equal({
                "w:tblPr": [
                    {
                        "w:tblW": {
                            _attr: {
                                "w:type": "pct",
                                "w:w": "100%",
                            },
                        },
                    },
                    BORDERS,
                    { "w:tblLayout": { _attr: { "w:type": "fixed" } } },
                    TABLE_LOOK,
                ],
            });
        });

        it('expands a "100%" width shorthand to a percentage descriptor', () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [new TableCell({ children: [new Paragraph("hello")] })],
                    }),
                ],
                width: "100%",
            });
            const tree = new Formatter().format(table) as any;
            const tblW = tree["w:tbl"][0]["w:tblPr"].find((el: any) => "w:tblW" in el);
            expect(tblW).to.deep.equal({ "w:tblW": { _attr: { "w:type": "pct", "w:w": "100%" } } });
        });

        it("should set the table to provided 1000 DXA", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
                width: {
                    size: 1000,
                    type: WidthType.DXA,
                },
                layout: TableLayoutType.FIXED,
            });
            const tree = new Formatter().format(table);
            expect(tree).to.have.property("w:tbl").which.is.an("array").with.has.length.at.least(1);
            expect(tree["w:tbl"][0]).to.deep.equal({
                "w:tblPr": [
                    {
                        "w:tblW": {
                            _attr: {
                                "w:type": "dxa",
                                "w:w": 1000,
                            },
                        },
                    },
                    BORDERS,
                    { "w:tblLayout": { _attr: { "w:type": "fixed" } } },
                    TABLE_LOOK,
                ],
            });
        });
    });

    describe("Cell", () => {
        describe("#prepForXml", () => {
            it("inserts a paragraph at the end of the cell if it is empty", () => {
                const table = new Table({
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph("hello")],
                                }),
                            ],
                        }),
                    ],
                });
                const tree = new Formatter().format(table);
                expect(tree).to.have.property("w:tbl").which.is.an("array");
                const row = tree["w:tbl"].find((x: any) => x["w:tr"]);
                expect(row).not.to.be.undefined;
                expect(row["w:tr"]).to.be.an("array").which.has.length.at.least(1);
                expect(row["w:tr"].find((x: any) => x["w:tc"])).to.deep.equal({
                    "w:tc": [
                        {
                            "w:p": [
                                {
                                    "w:r": [
                                        {
                                            "w:t": [
                                                {
                                                    _attr: {
                                                        "xml:space": "preserve",
                                                    },
                                                },
                                                "hello",
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });
            });

            // it("inserts a paragraph at the end of the cell even if it has a child table", () => {
            //     const table = new Table({
            //         rows: [
            //             new TableRow({
            //                 children: [
            //                     new TableCell({
            //                         children: [new Paragraph("hello")],
            //                     }),
            //                 ],
            //             }),
            //         ],
            //     });
            //     table.getCell(0, 0).add(
            //         new Table({
            //             rows: [
            //                 new TableRow({
            //                     children: [
            //                         new TableCell({
            //                             children: [new Paragraph("hello")],
            //                         }),
            //                     ],
            //                 }),
            //             ],
            //         }),
            //     );
            //     const tree = new Formatter().format(table);
            //     expect(tree)
            //         .to.have.property("w:tbl")
            //         .which.is.an("array");
            //     const row = tree["w:tbl"].find((x) => x["w:tr"]);
            //     expect(row).not.to.be.undefined;
            //     expect(row["w:tr"])
            //         .to.be.an("array")
            //         .which.has.length.at.least(1);
            //     const cell = row["w:tr"].find((x) => x["w:tc"]);
            //     expect(cell).not.to.be.undefined;
            //     expect(cell["w:tc"][cell["w:tc"].length - 1]).to.deep.equal({
            //         "w:p": EMPTY_OBJECT,
            //     });
            // });

            // it("does not insert a paragraph if it already ends with one", () => {
            //     const table = new Table({
            //         rows: [
            //             new TableRow({
            //                 children: [
            //                     new TableCell({
            //                         children: [new Paragraph("hello")],
            //                     }),
            //                 ],
            //             }),
            //         ],
            //     });
            //     table.getCell(0, 0).add(new Paragraph("Hello"));
            //     const tree = new Formatter().format(table);
            //     expect(tree)
            //         .to.have.property("w:tbl")
            //         .which.is.an("array");
            //     const row = tree["w:tbl"].find((x) => x["w:tr"]);
            //     expect(row).not.to.be.undefined;
            //     expect(row["w:tr"])
            //         .to.be.an("array")
            //         .which.has.length.at.least(1);
            //     expect(row["w:tr"].find((x) => x["w:tc"])).to.deep.equal({
            //         "w:tc": [
            //             {
            //                 "w:p": [{ "w:r": [{ "w:t": [{ _attr: { "xml:space": "preserve" } }, "Hello"] }] }],
            //             },
            //         ],
            //     });
            // });
        });
    });

    describe("#float", () => {
        it("sets the table float properties", () => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph("hello")],
                            }),
                        ],
                    }),
                ],
                float: {
                    horizontalAnchor: TableAnchorType.MARGIN,
                    verticalAnchor: TableAnchorType.PAGE,
                    absoluteHorizontalPosition: 10,
                    relativeHorizontalPosition: RelativeHorizontalPosition.CENTER,
                    absoluteVerticalPosition: 20,
                    relativeVerticalPosition: RelativeVerticalPosition.BOTTOM,
                    bottomFromText: 30,
                    topFromText: 40,
                    leftFromText: 50,
                    rightFromText: 60,
                },
            });
            const tree = new Formatter().format(table);
            expect(tree).to.have.property("w:tbl").which.is.an("array").with.has.length.at.least(1);
            expect(tree["w:tbl"][0]).to.deep.equal({
                "w:tblPr": [
                    {
                        "w:tblpPr": {
                            _attr: {
                                "w:horzAnchor": "margin",
                                "w:vertAnchor": "page",
                                "w:tblpX": 10,
                                "w:tblpXSpec": "center",
                                "w:tblpY": 20,
                                "w:tblpYSpec": "bottom",
                                "w:bottomFromText": 30,
                                "w:topFromText": 40,
                                "w:leftFromText": 50,
                                "w:rightFromText": 60,
                            },
                        },
                    },
                    WIDTHS,
                    BORDERS,
                    TABLE_LOOK,
                ],
            });
        });
    });

    describe("#borders", () => {
        const propertiesOf = (
            borders: ITableOptions["borders"],
            style?: string,
        ): readonly any[] => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [new TableCell({ children: [new Paragraph("hello")] })],
                    }),
                ],
                ...(style ? { style } : {}),
                borders,
            });
            return (new Formatter().format(table) as any)["w:tbl"][0]["w:tblPr"];
        };

        const bordersOf = (borders: ITableOptions["borders"], style?: string): any =>
            propertiesOf(borders, style).find((element) => "w:tblBorders" in element);

        const NONE_TOP = { "w:top": { _attr: { "w:val": "none", "w:sz": 0, "w:color": "auto" } } };
        const DEFAULT_SIDE = (side: string): any => ({
            [side]: { _attr: { "w:val": "single", "w:sz": 4, "w:color": "auto" } },
        });

        describe("without a style", () => {
            it("writes the all-sides default when borders is omitted", () => {
                expect(propertiesOf(undefined)).to.deep.include(BORDERS);
            });

            it("writes the all-sides default when given an empty object", () => {
                expect(propertiesOf({})).to.deep.include(BORDERS);
            });

            it("fills unspecified sides with the default when some are given", () => {
                expect(
                    bordersOf({ top: { style: BorderStyle.NONE, size: 0, color: "auto" } }),
                ).to.deep.equal({
                    "w:tblBorders": [
                        NONE_TOP,
                        DEFAULT_SIDE("w:left"),
                        DEFAULT_SIDE("w:bottom"),
                        DEFAULT_SIDE("w:right"),
                        DEFAULT_SIDE("w:insideH"),
                        DEFAULT_SIDE("w:insideV"),
                    ],
                });
            });

            it('omits a side set to "inherit" while defaulting the rest', () => {
                expect(bordersOf({ top: "inherit" })).to.deep.equal({
                    "w:tblBorders": [
                        DEFAULT_SIDE("w:left"),
                        DEFAULT_SIDE("w:bottom"),
                        DEFAULT_SIDE("w:right"),
                        DEFAULT_SIDE("w:insideH"),
                        DEFAULT_SIDE("w:insideV"),
                    ],
                });
            });
        });

        describe("with a style", () => {
            it("defers to the style when borders is omitted (no tblBorders)", () => {
                expect(bordersOf(undefined, "BrandTable1")).to.equal(undefined);
            });

            it("defers to the style when borders is false", () => {
                expect(bordersOf(false, "BrandTable1")).to.equal(undefined);
                expect(propertiesOf(false, "BrandTable1")).to.deep.include({
                    "w:tblStyle": { _attr: { "w:val": "BrandTable1" } },
                });
            });

            it("draws only the specified sides, letting the style own the rest", () => {
                expect(
                    bordersOf(
                        { top: { style: BorderStyle.NONE, size: 0, color: "auto" } },
                        "BrandTable1",
                    ),
                ).to.deep.equal({
                    "w:tblBorders": [NONE_TOP],
                });
            });

            it('treats an explicit "inherit" side the same as omitting it', () => {
                expect(
                    bordersOf(
                        {
                            top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                            bottom: "inherit",
                        },
                        "BrandTable1",
                    ),
                ).to.deep.equal({ "w:tblBorders": [NONE_TOP] });
            });
        });
    });

    describe("#tableStyleOptions", () => {
        const tableLookOf = (options?: ITableStyleOptions): any => {
            const table = new Table({
                rows: [
                    new TableRow({
                        children: [new TableCell({ children: [new Paragraph("hello")] })],
                    }),
                ],
                ...(options ? { tableStyleOptions: options } : {}),
            });
            const properties = (new Formatter().format(table) as any)["w:tbl"][0]["w:tblPr"];
            return properties.find((element: any) => "w:tblLook" in element)["w:tblLook"]._attr;
        };

        it("applies Word's 0x04A0 default when tableStyleOptions is omitted", () => {
            expect(tableLookOf()).to.deep.equal({
                "w:firstRow": true,
                "w:lastRow": false,
                "w:firstColumn": true,
                "w:lastColumn": false,
                "w:noHBand": false,
                "w:noVBand": true,
            });
        });

        it("keeps the defaults for flags the caller does not specify", () => {
            expect(tableLookOf({ totalRow: true })).to.deep.equal({
                "w:firstRow": true,
                "w:lastRow": true,
                "w:firstColumn": true,
                "w:lastColumn": false,
                "w:noHBand": false,
                "w:noVBand": true,
            });
        });

        it("lets the caller turn a default flag off", () => {
            expect(tableLookOf({ headerRow: false })["w:firstRow"]).to.equal(false);
        });

        it("lets the caller turn banding off through the un-inverted option", () => {
            expect(tableLookOf({ bandedRows: false })["w:noHBand"]).to.equal(true);
        });

        it("still writes every flag when given an empty object", () => {
            expect(tableLookOf({})).to.deep.equal(tableLookOf());
        });

        it("does not infer headerRow from a row's tableHeader", () => {
            // "Repeat Header Rows" (w:trPr/w:tblHeader, Layout tab) and the
            // "Header Row" style option (w:tblLook, Design tab) are separate
            // controls in Word; neither implies the other.
            const table = new Table({
                rows: [
                    new TableRow({
                        tableHeader: true,
                        children: [new TableCell({ children: [new Paragraph("hello")] })],
                    }),
                ],
                tableStyleOptions: { headerRow: false },
            });
            const properties = (new Formatter().format(table) as any)["w:tbl"][0]["w:tblPr"];
            const look = properties.find((element: any) => "w:tblLook" in element)["w:tblLook"];

            expect(look._attr["w:firstRow"]).to.equal(false);
        });

        it("matches DEFAULT_TABLE_STYLE_OPTIONS against the 0x04A0 bitmask", () => {
            // MS-OI29500 §17.4.55. Bit values per ECMA-376 §17.4.55. Each flag owns a
            // distinct bit, so summing them is the same as OR-ing them. The banded
            // options are negated here because the bitmask stores noHBand/noVBand.
            const bitmask =
                (DEFAULT_TABLE_STYLE_OPTIONS.headerRow ? 0x0020 : 0) +
                (DEFAULT_TABLE_STYLE_OPTIONS.totalRow ? 0x0040 : 0) +
                (DEFAULT_TABLE_STYLE_OPTIONS.firstColumn ? 0x0080 : 0) +
                (DEFAULT_TABLE_STYLE_OPTIONS.lastColumn ? 0x0100 : 0) +
                (DEFAULT_TABLE_STYLE_OPTIONS.bandedRows ? 0 : 0x0200) +
                (DEFAULT_TABLE_STYLE_OPTIONS.bandedColumns ? 0 : 0x0400);

            expect(bitmask).to.equal(0x04a0);
        });
    });
});
