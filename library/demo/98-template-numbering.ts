// Patch a document with numbered paragraphs — each table restarts its own counter

import * as fs from "fs";
import {
    AlignmentType,
    LevelFormat,
    Paragraph,
    patchDocument,
    PatchType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from "betterdocx";

const numberedCell = (instance: number): TableCell =>
    new TableCell({
        children: [new Paragraph({ numbering: { reference: "row-number", level: 0, instance } })],
    });

const textCell = (text: string): TableCell =>
    new TableCell({ children: [new Paragraph({ children: [new TextRun(text)] })] });

const numberedTable = (instance: number): Table =>
    new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: ["a", "b", "c"].map(
            (text) => new TableRow({ children: [numberedCell(instance), textCell(text)] }),
        ),
    });

patchDocument({
    outputType: "uint8array",
    data: fs.readFileSync("demo/assets/simple-template.docx"),
    numbering: {
        config: [
            {
                reference: "row-number",
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.DECIMAL,
                        text: "%1.",
                        alignment: AlignmentType.START,
                    },
                ],
            },
        ],
    },
    patches: {
        table: {
            type: PatchType.DOCUMENT,
            // Distinct instances -> independent counters, so the second table restarts at 1.
            children: [numberedTable(1), numberedTable(2)],
        },
    },
}).then((doc) => {
    fs.writeFileSync("My Document.docx", doc);
});
