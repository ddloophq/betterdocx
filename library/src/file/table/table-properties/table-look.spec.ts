import { describe, expect, it } from "vitest";
import xml from "xml";

import { Formatter } from "@export/formatter";

import { DEFAULT_TABLE_STYLE_OPTIONS, ITableStyleOptions, TableLook } from "./table-look";

const attributesOf = (options: ITableStyleOptions): Record<string, boolean> =>
    (new Formatter().format(new TableLook(options)) as any)["w:tblLook"]._attr;

describe("TableLook", () => {
    describe("#constructor", () => {
        it("maps headerRow to w:firstRow", () => {
            expect(attributesOf({ headerRow: true })).to.deep.equal({ "w:firstRow": true });
        });

        it("maps totalRow to w:lastRow", () => {
            expect(attributesOf({ totalRow: true })).to.deep.equal({ "w:lastRow": true });
        });

        it("maps firstColumn to w:firstColumn", () => {
            expect(attributesOf({ firstColumn: true })).to.deep.equal({ "w:firstColumn": true });
        });

        it("maps lastColumn to w:lastColumn", () => {
            expect(attributesOf({ lastColumn: true })).to.deep.equal({ "w:lastColumn": true });
        });

        it("carries a false through rather than dropping it", () => {
            expect(attributesOf({ headerRow: false })).to.deep.equal({ "w:firstRow": false });
        });

        it("writes every attribute when all options are given", () => {
            expect(attributesOf(DEFAULT_TABLE_STYLE_OPTIONS)).to.deep.equal({
                "w:firstRow": true,
                "w:lastRow": false,
                "w:firstColumn": true,
                "w:lastColumn": false,
                "w:noHBand": false,
                "w:noVBand": true,
            });
        });

        it("writes no attributes for empty options", () => {
            expect(attributesOf({})).to.deep.equal({});
        });
    });

    // The options follow Word's "Banded Rows"/"Banded Columns" checkboxes, but the
    // XML stores the negatives. Getting this backwards silently swaps the banding,
    // so assert both directions explicitly.
    describe("banding inversion", () => {
        it("writes noHBand=false when bandedRows is on", () => {
            expect(attributesOf({ bandedRows: true })).to.deep.equal({ "w:noHBand": false });
        });

        it("writes noHBand=true when bandedRows is off", () => {
            expect(attributesOf({ bandedRows: false })).to.deep.equal({ "w:noHBand": true });
        });

        it("writes noVBand=false when bandedColumns is on", () => {
            expect(attributesOf({ bandedColumns: true })).to.deep.equal({ "w:noVBand": false });
        });

        it("writes noVBand=true when bandedColumns is off", () => {
            expect(attributesOf({ bandedColumns: false })).to.deep.equal({ "w:noVBand": true });
        });

        it("omits the banding attributes entirely when the options are unset", () => {
            expect(attributesOf({ headerRow: true })).to.not.have.any.keys(
                "w:noHBand",
                "w:noVBand",
            );
        });
    });

    describe("serialization", () => {
        // The tests above assert the pre-serialization tree, where the attributes are
        // still JS booleans. This asserts what actually lands in document.xml, using
        // the same serializer the packer uses.
        it("writes booleans as ST_OnOff attributes", () => {
            const tableLook = new TableLook(DEFAULT_TABLE_STYLE_OPTIONS);
            const output = xml(new Formatter().format(tableLook) as xml.XmlObject);

            expect(output).to.equal(
                '<w:tblLook w:firstRow="true" w:lastRow="false" w:firstColumn="true" ' +
                    'w:lastColumn="false" w:noHBand="false" w:noVBand="true"/>',
            );
        });

        it("omits undefined flags rather than writing them as empty", () => {
            const tableLook = new TableLook({ headerRow: true, totalRow: undefined });
            const output = xml(new Formatter().format(tableLook) as xml.XmlObject);

            expect(output).to.equal('<w:tblLook w:firstRow="true"/>');
        });
    });

    describe("DEFAULT_TABLE_STYLE_OPTIONS", () => {
        it("matches Word's 0x04A0 default", () => {
            // Word's Table Style Options panel for a new table: Header Row,
            // First Column and Banded Rows checked, the rest clear.
            expect(DEFAULT_TABLE_STYLE_OPTIONS).to.deep.equal({
                headerRow: true,
                totalRow: false,
                firstColumn: true,
                lastColumn: false,
                bandedRows: true,
                bandedColumns: false,
            });
        });
    });
});
