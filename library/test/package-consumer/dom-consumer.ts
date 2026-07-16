import { Document, Packer } from "betterdocx";
import type {
    DocPropertiesOptions,
    FontOptions,
    ICompatibilityOptions,
    ICustomPropertyOptions,
    IHyphenationOptions,
    IImageOptions,
    IPropertiesOptions,
    InputDataType,
    OutlineOptions,
    PatchDetectorOptions,
    PatchDocumentOptions,
} from "betterdocx";

const compatibility: ICompatibilityOptions = {};
const hyphenation: IHyphenationOptions = { autoHyphenation: true };
const customProperty: ICustomPropertyOptions = { name: "Status", value: "Ready" };
const font: FontOptions = { name: "Example", data: new Uint8Array() };
const altText: DocPropertiesOptions = {
    title: "Example",
    description: "Example image",
    name: "Example",
};
const outline: OutlineOptions = { type: "noFill" };
const image: IImageOptions = {
    type: "png",
    data: new Uint8Array(),
    transformation: { width: 1, height: 1 },
    altText,
    outline,
};
const properties: IPropertiesOptions = {
    compatibility,
    hyphenation,
    customProperties: [customProperty],
    fonts: [font],
    sections: [],
};
const input: InputDataType = new Blob();
const detector: PatchDetectorOptions = { data: input };
const patch: PatchDocumentOptions<"uint8array"> = {
    outputType: "uint8array",
    data: input,
    patches: {},
};

void image;
void detector;
void patch;
void Packer.toUint8Array(new Document(properties));
