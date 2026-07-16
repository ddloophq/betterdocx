// Exporting the document as a stream

import * as fs from "node:fs";
import { Writable } from "node:stream";
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableBorders,
    TableCell,
    TableRow,
    WidthType,
} from "betterdocx";

const table1 = new Table({
    columnWidths: [3505, 5505],
    rows: [
        new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 3505,
                        type: WidthType.DXA,
                    },
                    children: [new Paragraph("Hello")],
                }),
                new TableCell({
                    width: {
                        size: 5505,
                        type: WidthType.DXA,
                    },
                    children: [],
                }),
            ],
        }),
        new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 3505,
                        type: WidthType.DXA,
                    },
                    children: [],
                }),
                new TableCell({
                    width: {
                        size: 5505,
                        type: WidthType.DXA,
                    },
                    children: [new Paragraph("World")],
                }),
            ],
        }),
    ],
});

const table2 = new Table({
    columnWidths: [3505, 5505],
    rows: [
        new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 3505,
                        type: WidthType.DXA,
                    },
                    children: [new Paragraph("Foo")],
                }),
                new TableCell({
                    width: {
                        size: 5505,
                        type: WidthType.DXA,
                    },
                    children: [],
                }),
            ],
        }),
        new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 3505,
                        type: WidthType.DXA,
                    },
                    children: [],
                }),
                new TableCell({
                    width: {
                        size: 5505,
                        type: WidthType.DXA,
                    },
                    children: [new Paragraph("Bar")],
                }),
            ],
        }),
    ],
});

const noBorderTable = new Table({
    borders: TableBorders.NONE,
    rows: [
        new TableRow({
            children: [
                new TableCell({
                    children: [table1],
                }),
                new TableCell({
                    children: [table2],
                }),
            ],
        }),
    ],
});

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [noBorderTable],
        },
    ],
});

const stream = Packer.toReadableStream(doc);
await stream.pipeTo(Writable.toWeb(fs.createWriteStream("My Document.docx")));
