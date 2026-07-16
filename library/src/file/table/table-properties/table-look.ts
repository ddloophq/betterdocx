// http://officeopenxml.com/WPtblLook.php
// <xsd:complexType name="CT_TblLook">
//     <xsd:attribute name="firstRow" type="s:ST_OnOff"/>
//     <xsd:attribute name="lastRow" type="s:ST_OnOff"/>
//     <xsd:attribute name="firstColumn" type="s:ST_OnOff"/>
//     <xsd:attribute name="lastColumn" type="s:ST_OnOff"/>
//     <xsd:attribute name="noHBand" type="s:ST_OnOff"/>
//     <xsd:attribute name="noVBand" type="s:ST_OnOff"/>
// </xsd:complexType>
import { XmlAttributeComponent, XmlComponent } from "@file/xml-components";

/**
 * Which parts of a table style's conditional formatting to apply — the
 * "Table Style Options" group on Word's "Table Design" ribbon tab. Each option
 * is one checkbox in that group, and `true` always means checked.
 *
 * These only have an effect on tables that reference a `style` defining conditional
 * formatting; on an unstyled table there is nothing for them to switch on or off.
 *
 * Not to be confused with `TableRow`'s `tableHeader`, which is "Repeat Header Rows"
 * on the "Layout" tab — that repeats a row across page breaks and is per-row, whereas
 * `headerRow` below only decides whether the style paints its header band. Word keeps
 * the two apart, so setting one does not imply the other.
 */
export type ITableStyleOptions = {
    /** Word's "Header Row" checkbox. */
    readonly headerRow?: boolean;
    /** Word's "Total Row" checkbox. */
    readonly totalRow?: boolean;
    /** Word's "First Column" checkbox. */
    readonly firstColumn?: boolean;
    /** Word's "Last Column" checkbox. */
    readonly lastColumn?: boolean;
    /** Word's "Banded Rows" checkbox. */
    readonly bandedRows?: boolean;
    /** Word's "Banded Columns" checkbox. */
    readonly bandedColumns?: boolean;
};

/**
 * Word's default: Header Row, First Column and Banded Rows checked; Total Row,
 * Last Column and Banded Columns unchecked.
 *
 * ECMA-376 says a table with no `tblLook` gets a bitmask of `0x0000` (everything off),
 * but Word assumes `0x04A0` instead — `firstRow` + `firstColumn` + `noVBand`
 * (MS-OI29500 §17.4.55). `Table` writes these out explicitly so every renderer agrees
 * with what Word shows.
 */
export const DEFAULT_TABLE_STYLE_OPTIONS: Required<ITableStyleOptions> = {
    headerRow: true,
    totalRow: false,
    firstColumn: true,
    lastColumn: false,
    bandedRows: true,
    bandedColumns: false,
};

// The XML keeps banding as negative attributes (noHBand/noVBand); the options
// above follow Word's checkboxes, so both flip on the way out.
type TableLookAttributeOptions = {
    readonly firstRow?: boolean;
    readonly lastRow?: boolean;
    readonly firstColumn?: boolean;
    readonly lastColumn?: boolean;
    readonly noHBand?: boolean;
    readonly noVBand?: boolean;
};

const negate = (value: boolean | undefined): boolean | undefined =>
    value === undefined ? undefined : !value;

const toAttributes = (options: ITableStyleOptions): TableLookAttributeOptions => ({
    firstRow: options.headerRow,
    lastRow: options.totalRow,
    firstColumn: options.firstColumn,
    lastColumn: options.lastColumn,
    noHBand: negate(options.bandedRows),
    noVBand: negate(options.bandedColumns),
});

class TableLookAttributes extends XmlAttributeComponent<TableLookAttributeOptions> {
    protected readonly xmlKeys = {
        firstRow: "w:firstRow",
        lastRow: "w:lastRow",
        firstColumn: "w:firstColumn",
        lastColumn: "w:lastColumn",
        noHBand: "w:noHBand",
        noVBand: "w:noVBand",
    };
}

export class TableLook extends XmlComponent {
    public constructor(options: ITableStyleOptions) {
        super("w:tblLook");
        this.root.push(new TableLookAttributes(toAttributes(options)));
    }
}
