import { Document, ExternalHyperlink, Packer, Paragraph, TextRun } from "betterdocx";
import {
    Document as CoreDocument,
    ExternalHyperlink as CoreExternalHyperlink,
    Packer as CorePacker,
    Paragraph as CoreParagraph,
    TextRun as CoreTextRun,
} from "betterdocx/core";
import { patchDetector, patchDocument, readStyleIds, readStyles } from "betterdocx/patcher";
import { Formatter, XmlComponent } from "betterdocx/advanced";

const bytes = await Packer.toUint8Array(
    new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: [
                            new ExternalHyperlink({
                                link: "https://example.com",
                                children: [new TextRun("link")],
                            }),
                        ],
                    }),
                ],
            },
        ],
    }),
);
if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) {
    throw new Error("ES module consumer did not receive portable document bytes.");
}

const coreBytes = await CorePacker.toUint8Array(
    new CoreDocument({
        sections: [
            {
                children: [
                    new CoreParagraph({
                        children: [
                            new CoreExternalHyperlink({
                                link: "https://example.com",
                                children: [new CoreTextRun("link")],
                            }),
                        ],
                    }),
                ],
            },
        ],
    }),
);
if (!(coreBytes instanceof Uint8Array) || coreBytes.byteLength === 0) {
    throw new Error("ES module core subpath did not generate portable document bytes.");
}

if (
    typeof patchDocument !== "function" ||
    typeof patchDetector !== "function" ||
    typeof readStyles !== "function" ||
    typeof readStyleIds !== "function"
) {
    throw new Error("ES module patcher subpath is incomplete.");
}

if (typeof Formatter !== "function" || typeof XmlComponent !== "function") {
    throw new Error("ES module advanced subpath is incomplete.");
}
