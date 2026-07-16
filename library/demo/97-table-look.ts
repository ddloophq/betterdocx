// Example of using tableStyleOptions to control conditional table formatting —
// the "Table Style Options" group on Word's "Table Design" ribbon tab.
// Table 1 omits tableStyleOptions, so it gets Word's defaults: Header Row, First
// Column and Banded Rows checked (0x04A0). Table 2 checks every box, adding Total
// Row, Last Column and Banded Columns.
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from "betterdocx";
import * as fs from "fs";

const styles = fs.readFileSync("./demo/assets/custom-styles.xml", "utf-8");

const doc = new Document({
    externalStyles: styles,
    sections: [
        {
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Table 1: Table Style Options Default Values",
                            bold: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "" }),
                new Table({
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Header 1")] }),
                                new TableCell({ children: [new Paragraph("Header 2")] }),
                                new TableCell({ children: [new Paragraph("Header 3")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Row 1, Col 1")] }),
                                new TableCell({ children: [new Paragraph("Row 1, Col 2")] }),
                                new TableCell({ children: [new Paragraph("Row 1, Col 3")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Row 2, Col 1")] }),
                                new TableCell({ children: [new Paragraph("Row 2, Col 2")] }),
                                new TableCell({ children: [new Paragraph("Row 2, Col 3")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Row 3, Col 1")] }),
                                new TableCell({ children: [new Paragraph("Row 3, Col 2")] }),
                                new TableCell({ children: [new Paragraph("Row 3, Col 3")] }),
                            ],
                        }),
                    ],
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    style: "GridTable5Dark-Accent1",
                }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Table 2: All Table Style Options Enabled",
                            bold: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "" }),
                new Table({
                    tableStyleOptions: {
                        headerRow: true,
                        totalRow: true,
                        firstColumn: true,
                        lastColumn: true,
                        bandedRows: true,
                        bandedColumns: true,
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Header 1")] }),
                                new TableCell({ children: [new Paragraph("Header 2")] }),
                                new TableCell({ children: [new Paragraph("Header 3")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Row 1, Col 1")] }),
                                new TableCell({ children: [new Paragraph("Row 1, Col 2")] }),
                                new TableCell({ children: [new Paragraph("Row 1, Col 3")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Row 2, Col 1")] }),
                                new TableCell({ children: [new Paragraph("Row 2, Col 2")] }),
                                new TableCell({ children: [new Paragraph("Row 2, Col 3")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Row 3, Col 1")] }),
                                new TableCell({ children: [new Paragraph("Row 3, Col 2")] }),
                                new TableCell({ children: [new Paragraph("Row 3, Col 3")] }),
                            ],
                        }),
                    ],
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    style: "GridTable5Dark-Accent1",
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("97-table-look.docx", buffer);
});
