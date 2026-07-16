import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { readStyleIds, readStyles } from "./style-reader";

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:sz w:val="22" />
            </w:rPr>
        </w:rPrDefault>
    </w:docDefaults>
    <w:latentStyles w:defLockedState="0" w:defUIPriority="99">
        <w:lsdException w:name="Normal" w:uiPriority="0" />
    </w:latentStyles>
    <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
        <w:name w:val="Normal" />
        <w:qFormat />
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="heading 1" />
        <w:basedOn w:val="Normal" />
    </w:style>
    <w:style w:type="table" w:styleId="BrandTable1">
        <w:name w:val="Brand Table 1" />
    </w:style>
    <w:style w:type="character" w:styleId="Hyperlink">
        <w:name w:val="Hyperlink" />
    </w:style>
    <w:style w:type="numbering" w:styleId="NoList">
        <w:name w:val="No List" />
    </w:style>
</w:styles>`;

// The docx spec allows w:type to be omitted (implying paragraph), and a style
// with no w:name is legal too.
const SPARSE_STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:style w:styleId="NoTypeOrName" />
    <w:style w:type="paragraph" w:styleId="NoName" />
    <w:style w:type="nonsense" w:styleId="UnknownType">
        <w:name w:val="Unknown Type" />
    </w:style>
    <w:style w:type="paragraph">
        <w:name w:val="Style with no id" />
    </w:style>
</w:styles>`;

const zipWith = (files: Readonly<Record<string, string>>): JSZip => {
    const zip = new JSZip();
    for (const [key, value] of Object.entries(files)) {
        zip.file(key, value);
    }
    return zip;
};

const templateZip = (): JSZip =>
    zipWith({
        "word/document.xml": "<w:document></w:document>",
        "word/styles.xml": STYLES_XML,
    });

describe("style-reader", () => {
    describe("readStyles", () => {
        it("reads every style defined in the document", async () => {
            const styles = await readStyles({ data: templateZip() });

            expect(styles).to.deep.equal([
                { id: "Normal", name: "Normal", type: "paragraph" },
                { id: "Heading1", name: "heading 1", type: "paragraph" },
                { id: "BrandTable1", name: "Brand Table 1", type: "table" },
                { id: "Hyperlink", name: "Hyperlink", type: "character" },
                { id: "NoList", name: "No List", type: "numbering" },
            ]);
        });

        it("ignores docDefaults and latentStyles", async () => {
            const styles = await readStyles({ data: templateZip() });

            expect(styles.map(({ id }) => id)).to.not.include.members(["Normal2", undefined]);
            expect(styles).to.have.lengthOf(5);
        });

        it("accepts a raw buffer as well as a JSZip", async () => {
            const data = await templateZip().generateAsync({ type: "uint8array" });

            expect(await readStyleIds({ data })).to.include("BrandTable1");
        });

        it("returns an empty array when the document defines no styles part", async () => {
            const data = zipWith({ "word/document.xml": "<w:document></w:document>" });

            expect(await readStyles({ data })).to.deep.equal([]);
        });

        it("returns an empty array for a styles part with no styles", async () => {
            const data = zipWith({
                "word/styles.xml":
                    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" />',
            });

            expect(await readStyles({ data })).to.deep.equal([]);
        });

        describe("incomplete style definitions", () => {
            it("leaves name and type undefined when the style omits them", async () => {
                const data = zipWith({ "word/styles.xml": SPARSE_STYLES_XML });
                const styles = await readStyles({ data });

                expect(styles).to.deep.include({
                    id: "NoTypeOrName",
                    name: undefined,
                    type: undefined,
                });
                expect(styles).to.deep.include({
                    id: "NoName",
                    name: undefined,
                    type: "paragraph",
                });
            });

            it("drops an unrecognized type rather than surfacing it", async () => {
                const data = zipWith({ "word/styles.xml": SPARSE_STYLES_XML });
                const styles = await readStyles({ data });

                expect(styles).to.deep.include({
                    id: "UnknownType",
                    name: "Unknown Type",
                    type: undefined,
                });
            });

            it("skips a style with no styleId, since nothing can reference it", async () => {
                const data = zipWith({ "word/styles.xml": SPARSE_STYLES_XML });

                expect(await readStyleIds({ data })).to.deep.equal([
                    "NoTypeOrName",
                    "NoName",
                    "UnknownType",
                ]);
            });
        });
    });

    describe("readStyleIds", () => {
        it("returns just the ids, in document order", async () => {
            expect(await readStyleIds({ data: templateZip() })).to.deep.equal([
                "Normal",
                "Heading1",
                "BrandTable1",
                "Hyperlink",
                "NoList",
            ]);
        });

        it("supports checking a template against the ids code references", async () => {
            // The motivating use case: an undefined style id is silently degraded
            // to Normal by Word, so callers diff their contract up front.
            const defined = new Set(await readStyleIds({ data: templateZip() }));
            const referenced = ["Heading1", "BrandTable1", "Heading9"];

            expect(referenced.filter((id) => !defined.has(id))).to.deep.equal(["Heading9"]);
        });
    });
});
