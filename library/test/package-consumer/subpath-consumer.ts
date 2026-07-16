import { Document, File, Packer, Paragraph, TextRun } from "betterdocx/core";
import type { IPropertiesOptions } from "betterdocx/core";
import {
    PatchType,
    patchDetector,
    patchDocument,
    readStyleIds,
    readStyles,
} from "betterdocx/patcher";
import type {
    PatchDetectorOptions,
    PatchDocumentOptions,
    ReadStylesOptions,
} from "betterdocx/patcher";
import { Formatter, XmlComponent } from "betterdocx/advanced";
import type { IContext, IXmlableObject } from "betterdocx/advanced";

class CustomXmlComponent extends XmlComponent {
    public constructor() {
        super("w:custom");
    }
}

const options: IPropertiesOptions = {
    sections: [
        {
            children: [new Paragraph({ children: [new TextRun("Subpath fixture")] })],
        },
    ],
};
const document: File = new Document(options);
const patchOptions: PatchDocumentOptions<"uint8array"> = {
    outputType: "uint8array",
    data: new Uint8Array(),
    patches: {
        name: { type: PatchType.PARAGRAPH, children: [] },
    },
};
const detectorOptions: PatchDetectorOptions = { data: new Blob() };
const styleOptions: ReadStylesOptions = { data: new ArrayBuffer(0) };
const formatter = new Formatter();
const component = new CustomXmlComponent();
const xml: IXmlableObject | undefined = undefined;
const context: IContext | undefined = undefined;

void document;
void patchOptions;
void detectorOptions;
void styleOptions;
void formatter;
void component;
void xml;
void context;
void patchDocument;
void patchDetector;
void readStyles;
void readStyleIds;
void Packer;
