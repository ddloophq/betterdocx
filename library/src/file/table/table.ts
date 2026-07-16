// http://officeopenxml.com/WPtableGrid.php
import { FileChild } from "@file/file-child";
import { PositivePercentage } from "@util/values";

import { AlignmentType } from "../paragraph";
import { IShadingAttributesProperties } from "../shading";
import { TableGrid } from "./grid";
import { TableCell, VerticalMergeType } from "./table-cell";
import { ITableCellSpacingProperties } from "./table-cell-spacing";
import { ITableBordersOptions, ITableFloatOptions, TableProperties } from "./table-properties";
import { ITableCellMarginOptions } from "./table-properties/table-cell-margin";
import { TableLayoutType } from "./table-properties/table-layout";
import { DEFAULT_TABLE_STYLE_OPTIONS, ITableStyleOptions } from "./table-properties/table-look";
import { TableRow } from "./table-row";
import { ITableWidthProperties, WidthType } from "./table-width";

// Percentage shorthand, e.g. `"100%"`, expands to a full width descriptor so
// callers don't have to spell out `{ size: 100, type: WidthType.PERCENTAGE }`.
const toWidth = (
    value: ITableWidthProperties | PositivePercentage | undefined,
): ITableWidthProperties | undefined =>
    typeof value === "string"
        ? { size: Number(value.slice(0, -1)), type: WidthType.PERCENTAGE }
        : value;

/*
    0-width columns don't get rendered correctly, so we need
    to give them some value. A reasonable default would be
    ~6in / numCols, but if we do that it becomes very hard
    to resize the table using setWidth, unless the layout
    algorithm is set to 'fixed'. Instead, the approach here
    means even in 'auto' layout, setting a width on the
    table will make it look reasonable, as the layout
    algorithm will expand columns to fit its content
 */
export type ITableOptions = {
    readonly rows: readonly TableRow[];
    /**
     * Table width. Accepts a full {@link ITableWidthProperties} descriptor or a
     * percentage shorthand string like `"100%"` (equivalent to
     * `{ size: 100, type: WidthType.PERCENTAGE }`).
     */
    readonly width?: ITableWidthProperties | PositivePercentage;
    readonly columnWidths?: readonly number[];
    readonly margins?: ITableCellMarginOptions;
    /** Table indent. Also accepts a percentage shorthand string like `"5%"`. */
    readonly indent?: ITableWidthProperties | PositivePercentage;
    readonly float?: ITableFloatOptions;
    readonly layout?: (typeof TableLayoutType)[keyof typeof TableLayoutType];
    readonly style?: string;
    /**
     * Direct table borders.
     *
     * - Omitted **with** a `style`: the style owns every border (no `tblBorders`
     *   is emitted).
     * - Omitted **without** a `style`: every side falls back to a single default
     *   border, so an unstyled table stays visible.
     * - An object: each named side is drawn explicitly. When a `style` is set,
     *   sides you leave out defer to the style; set a side to `"inherit"` to
     *   defer to the style for that side even on an otherwise unstyled table.
     * - `false`: emit no `tblBorders` at all, letting the `style` own the
     *   borders (equivalent to omitting `borders` when a `style` is set).
     */
    readonly borders?: ITableBordersOptions | false;
    readonly alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    readonly visuallyRightToLeft?: boolean;
    /**
     * Which of the referenced `style`'s conditional formatting to apply. Anything
     * left out keeps Word's default — see {@link DEFAULT_TABLE_STYLE_OPTIONS}.
     */
    readonly tableStyleOptions?: ITableStyleOptions;
    readonly cellSpacing?: ITableCellSpacingProperties;
    readonly shading?: IShadingAttributesProperties;
};

export class Table extends FileChild {
    public constructor({
        rows,
        width,
        // The default grid needs one column per grid column, so count cells by
        // their columnSpan. Math.max(0, ...) keeps empty tables from throwing.

        columnWidths = Array<number>(
            Math.max(
                0,
                ...rows.map((row) =>
                    row.cells.reduce((count, cell) => count + (cell.options.columnSpan ?? 1), 0),
                ),
            ),
        ).fill(100),
        margins,
        indent,
        float,
        layout,
        style,
        borders,
        alignment,
        visuallyRightToLeft,
        tableStyleOptions,
        cellSpacing,
        shading,
    }: ITableOptions) {
        super("w:tbl");

        // Vertical-merge continuation cells belong to this table's normalized
        // representation. Never add them to rows supplied (and possibly reused)
        // by the caller.
        const tableRows = rows.map((row) => row.clone());

        this.root.push(
            new TableProperties({
                // Omit tblBorders when the style should own the borders — either
                // `false`, or `borders` unset while a `style` is referenced.
                // Unset with no style keeps the all-sides default (`{}`); an
                // object is passed through for per-side resolution.
                borders:
                    borders === false || (borders === undefined && style !== undefined)
                        ? undefined
                        : (borders ?? {}),
                width: toWidth(width) ?? { size: 100 },
                indent: toWidth(indent),
                float,
                layout,
                style,
                alignment,
                cellMargin: margins,
                visuallyRightToLeft,
                // Merged rather than replaced, so setting one flag keeps Word's
                // defaults for the other five.
                tableStyleOptions: { ...DEFAULT_TABLE_STYLE_OPTIONS, ...tableStyleOptions },
                cellSpacing,
                shading,
            }),
        );

        this.root.push(new TableGrid(columnWidths));

        for (const row of tableRows) {
            this.root.push(row);
        }

        tableRows.forEach((row, rowIndex) => {
            if (rowIndex === tableRows.length - 1) {
                // don't process the end row
                return;
            }
            let columnIndex = 0;
            row.cells.forEach((cell) => {
                // Row Span has to be added in this method and not the constructor because it needs to know information about the column which happens after Table Cell construction
                // Row Span of 1 will crash word as it will add RESTART and not a corresponding CONTINUE
                if (cell.options.rowSpan && cell.options.rowSpan > 1) {
                    const continueCell = new TableCell({
                        // the inserted CONTINUE cell has rowSpan, and will be handled when process the next row
                        rowSpan: cell.options.rowSpan - 1,
                        columnSpan: cell.options.columnSpan,
                        borders: cell.options.borders,
                        children: [],
                        verticalMerge: VerticalMergeType.CONTINUE,
                    });
                    tableRows[rowIndex + 1].addCellToColumnIndex(continueCell, columnIndex);
                }
                columnIndex += cell.options.columnSpan ?? 1;
            });
        });
    }
}
