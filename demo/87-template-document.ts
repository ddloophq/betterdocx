// Patch a document with patches

import * as fs from "fs";
import { patchDocument, PatchType, TextRun } from "betterdocx";

patchDocument({
    outputType: "nodebuffer",
    data: fs.readFileSync("demo/assets/simple-template-2.docx"),
    patches: {
        name: {
            type: PatchType.PARAGRAPH,
            children: [new TextRun("Max")],
        },
    },
}).then((doc) => {
    fs.writeFileSync("My Document.docx", doc);
});
