// Exporting the document as a stream

import * as fs from "node:fs";
import { Writable } from "node:stream";
import { Document, Packer, Paragraph, Tab, TextRun } from "betterdocx";

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun("Hello World"),
                        new TextRun({
                            text: "Foo Bar",
                            bold: true,
                        }),
                        new TextRun({
                            children: [new Tab(), "Github is the best"],
                            bold: true,
                        }),
                    ],
                }),
            ],
        },
    ],
});

const stream = Packer.toReadableStream(doc);
await stream.pipeTo(Writable.toWeb(fs.createWriteStream("My Document.docx")));
