import JSZip from "jszip";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LevelFormat } from "@file/numbering";
import { ExternalHyperlink, ImageRun, Paragraph, TextRun } from "@file/paragraph";
import { Table, TableCell, TableRow, WidthType } from "@file/table";

import { PatchType, patchDocument } from "./from-docx";
import { TokenNotFoundError } from "./token-not-found-error";

const MOCK_XML = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
    xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex"
    xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex"
    xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex"
    xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex"
    xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex"
    xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex"
    xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex"
    xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex"
    xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
    xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink"
    xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:oel="http://schemas.microsoft.com/office/2019/extlst"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:w10="urn:schemas-microsoft-com:office:word"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
    xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
    xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex"
    xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid"
    xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml"
    xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash"
    xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex"
    xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
    xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
    xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
    xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
    <w:body>
        <w:p w14:paraId="2499FE9F" w14:textId="0A3D130F" w:rsidR="00B51233"
            w:rsidRDefault="007B52ED" w:rsidP="007B52ED">
            <w:pPr>
                <w:pStyle w:val="Title" />
            </w:pPr>
            <w:r>
                <w:t>Hello World</w:t>
            </w:r>
        </w:p>
        <w:p w14:paraId="6410D9A0" w14:textId="7579AB49" w:rsidR="007B52ED"
            w:rsidRDefault="007B52ED" />
        <w:p w14:paraId="57ACF964" w14:textId="315D7A05" w:rsidR="007B52ED"
            w:rsidRDefault="007B52ED">
            <w:r>
                <w:t>Hello {{name}},</w:t>
            </w:r>
            <w:r w:rsidR="008126CB">
                <w:t xml:space="preserve"> how are you?</w:t>
            </w:r>
        </w:p>
        <w:p w14:paraId="38C7DF4A" w14:textId="66CDEC9A" w:rsidR="007B52ED"
            w:rsidRDefault="007B52ED" />
        <w:p w14:paraId="04FABE2B" w14:textId="3DACA001" w:rsidR="007B52ED"
            w:rsidRDefault="007B52ED">
            <w:r>
                <w:t>{{paragraph_replace}}</w:t>
            </w:r>
        </w:p>
        <w:p w14:paraId="7AD7975D" w14:textId="77777777" w:rsidR="00EF161F"
            w:rsidRDefault="00EF161F" />
        <w:p w14:paraId="3BD6D75A" w14:textId="19AE3121" w:rsidR="00EF161F"
            w:rsidRDefault="00EF161F">
            <w:r>
                <w:t>{{table}}</w:t>
            </w:r>
        </w:p>
        <w:p w14:paraId="76023962" w14:textId="4E606AB9" w:rsidR="007B52ED"
            w:rsidRDefault="007B52ED" />
        <w:tbl>
            <w:tblPr>
                <w:tblStyle w:val="TableGrid" />
                <w:tblW w:w="0" w:type="auto" />
                <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1"
                    w:lastColumn="0" w:noHBand="0" w:noVBand="1" />
            </w:tblPr>
            <w:tblGrid>
                <w:gridCol w:w="3003" />
                <w:gridCol w:w="3003" />
                <w:gridCol w:w="3004" />
            </w:tblGrid>
            <w:tr w:rsidR="00EF161F" w14:paraId="1DEC5955" w14:textId="77777777" w:rsidTr="00EF161F">
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3003" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="54DA5587" w14:textId="625BAC60" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F">
                        <w:r>
                            <w:t>{{table_heading_1}}</w:t>
                        </w:r>
                    </w:p>
                </w:tc>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3003" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="57100910" w14:textId="71FD5616" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F" />
                </w:tc>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3004" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="1D388FAB" w14:textId="77777777" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F" />
                </w:tc>
            </w:tr>
            <w:tr w:rsidR="00EF161F" w14:paraId="0F53D2DC" w14:textId="77777777" w:rsidTr="00EF161F">
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3003" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="0F2BCCED" w14:textId="3C3B6706" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F">
                        <w:r>
                            <w:t>Item: {{item_1}}</w:t>
                        </w:r>
                    </w:p>
                </w:tc>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3003" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="1E6158AC" w14:textId="77777777" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F" />
                </w:tc>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3004" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="17937748" w14:textId="77777777" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F" />
                </w:tc>
            </w:tr>
            <w:tr w:rsidR="00EF161F" w14:paraId="781DAC1A" w14:textId="77777777" w:rsidTr="00EF161F">
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3003" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="1DCD0343" w14:textId="77777777" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F" />
                </w:tc>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3003" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="5D02E3CD" w14:textId="77777777" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F" />
                </w:tc>
                <w:tc>
                    <w:tcPr>
                        <w:tcW w:w="3004" w:type="dxa" />
                    </w:tcPr>
                    <w:p w14:paraId="52EA0DBB" w14:textId="77777777" w:rsidR="00EF161F"
                        w:rsidRDefault="00EF161F" />
                </w:tc>
            </w:tr>
        </w:tbl>
        <w:p w14:paraId="47CD1FBC" w14:textId="23474CBC" w:rsidR="007B52ED"
            w:rsidRDefault="007B52ED" />
        <w:p w14:paraId="0ACCEE90" w14:textId="67907499" w:rsidR="00EF161F"
            w:rsidRDefault="0077578F">
            <w:r>
                <w:t>{{image_test}}</w:t>
            </w:r>
        </w:p>
        <w:p w14:paraId="23FA9862" w14:textId="77777777" w:rsidR="0077578F"
            w:rsidRDefault="0077578F" />
        <w:p w14:paraId="01578F2F" w14:textId="3BDC6C85" w:rsidR="007B52ED"
            w:rsidRDefault="007B52ED">
            <w:r>
                <w:t>Thank you</w:t>
            </w:r>
        </w:p>
        <w:sectPr w:rsidR="007B52ED" w:rsidSect="0072043F">
            <w:headerReference w:type="default" r:id="rId6" />
            <w:footerReference w:type="default" r:id="rId7" />
            <w:pgSz w:w="11900" w:h="16840" />
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708"
                w:footer="708" w:gutter="0" />
            <w:cols w:space="708" />
            <w:docGrid w:linePitch="360" />
        </w:sectPr>
    </w:body>
</w:document>
`;

describe("from-docx", () => {
    it("keeps DOCUMENT/PARAGRAPH as deprecated aliases of BLOCK/INLINE", () => {
        expect(PatchType.BLOCK).toBe(PatchType.DOCUMENT);
        expect(PatchType.INLINE).toBe(PatchType.PARAGRAPH);
    });

    describe("patchDocument", () => {
        describe("document.xml and [Content_Types].xml", () => {
            beforeEach(() => {
                const zip = new JSZip();

                zip.file("word/document.xml", MOCK_XML);
                zip.file(
                    "[Content_Types].xml",
                    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml" />
</Types>`,
                );
                vi.spyOn(JSZip, "loadAsync").mockResolvedValue(zip);
            });

            afterEach(() => {
                vi.restoreAllMocks();
            });

            it("should patch the document", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: Buffer.from(""),
                    patches: {
                        name: {
                            type: PatchType.PARAGRAPH,
                            children: [
                                new TextRun("Sir. "),
                                new TextRun("John Doe"),
                                new TextRun("(The Conqueror)"),
                            ],
                        },
                        item_1: {
                            type: PatchType.PARAGRAPH,
                            children: [
                                new TextRun("#657"),
                                new ExternalHyperlink({
                                    children: [
                                        new TextRun({
                                            text: "BBC News Link",
                                        }),
                                    ],
                                    link: "https://www.bbc.co.uk/news",
                                }),
                            ],
                        },

                        paragraph_replace: {
                            type: PatchType.DOCUMENT,
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun("This is a "),
                                        new ExternalHyperlink({
                                            children: [
                                                new TextRun({
                                                    text: "Google Link",
                                                }),
                                            ],
                                            link: "https://www.google.co.uk",
                                        }),
                                        new ImageRun({
                                            type: "png",
                                            data: Buffer.from(""),
                                            transformation: { width: 100, height: 100 },
                                        }),
                                    ],
                                }),
                            ],
                        },

                        image_test: {
                            type: PatchType.PARAGRAPH,
                            children: [
                                new ImageRun({
                                    type: "png",
                                    data: Buffer.from(""),
                                    transformation: { width: 100, height: 100 },
                                }),
                            ],
                        },
                    },
                });

                vi.restoreAllMocks();
                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                const contentTypesXml = await outputZip.file("[Content_Types].xml")!.async("text");

                // placeholders are replaced with the patch content
                expect(documentXml).not.toContain("{{name}}");
                expect(documentXml).not.toContain("{{paragraph_replace}}");
                expect(documentXml).toContain("John Doe");
                expect(documentXml).toContain("Google Link");
                // surrounding text of paragraph patches survives
                expect(documentXml).toContain("Hello ");
                expect(documentXml).toContain(" how are you?");
                // the inserted image gets a relationship id and a content type
                expect(documentXml).toMatch(/r:embed="rId\d+"/);
                expect(contentTypesXml).toContain('Extension="png"');
                // untouched placeholders remain for patches that were not given
                expect(documentXml).toContain("{{table_heading_1}}");
            });

            it("should return the document content unchanged with no patches", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: Buffer.from(""),
                    patches: {},
                });

                vi.restoreAllMocks();
                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                expect(documentXml).toContain("Hello World");
                expect(documentXml).toContain("{{name}}");
            });

            it("should work with the raw JSZip type", async () => {
                const zip = new JSZip();

                zip.file("word/document.xml", MOCK_XML);
                zip.file(
                    "[Content_Types].xml",
                    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
                );
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    patches: {
                        name: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("John Doe")],
                        },
                    },
                });

                vi.restoreAllMocks();
                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                expect(documentXml).toContain("John Doe");
                expect(documentXml).not.toContain("{{name}}");
            });

            it("should pass UTF-16 (BOM) entries through as binary", async () => {
                const zip = new JSZip();

                zip.file("word/document.xml", MOCK_XML);
                zip.file("[Content_Types].xml", Buffer.from([0xff, 0xfe]));
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    patches: {},
                });

                vi.restoreAllMocks();
                const outputZip = await JSZip.loadAsync(output);
                const contentTypes = await outputZip
                    .file("[Content_Types].xml")!
                    .async("uint8array");
                expect([...contentTypes]).to.deep.equal([0xff, 0xfe]);
            });

            it("should throw TokenNotFoundError when a patch token is not in the document", async () => {
                const patch = () =>
                    patchDocument({
                        outputType: "uint8array",
                        data: Buffer.from(""),
                        patches: {
                            name: {
                                type: PatchType.PARAGRAPH,
                                children: [new TextRun("John Doe")],
                            },

                            does_not_exist: {
                                type: PatchType.PARAGRAPH,
                                children: [new TextRun("Jane Doe")],
                            },
                        },
                    });

                await expect(patch()).rejects.toThrowError(TokenNotFoundError);
                await expect(patch()).rejects.toMatchObject({
                    name: "TokenNotFoundError",
                    token: "does_not_exist",
                    message: 'Token "does_not_exist" was not found in the document.',
                });
            });

            it('skips absent tokens when onMissingToken is "skip"', async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: Buffer.from(""),
                    onMissingToken: "skip",
                    patches: {
                        name: {
                            type: PatchType.INLINE,
                            children: [new TextRun("John Doe")],
                        },
                        does_not_exist: {
                            type: PatchType.INLINE,
                            children: [new TextRun("Jane Doe")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                // The present token is still patched; the absent one is a no-op.
                expect(documentXml).toContain("John Doe");
                expect(documentXml).not.toContain("{{name}}");
                expect(documentXml).not.toContain("Jane Doe");
            });

            it("throws error with empty delimiters", async () => {
                await expect(() =>
                    patchDocument({
                        outputType: "uint8array",
                        data: Buffer.from(""),
                        patches: {},
                        placeholderDelimiters: { start: "", end: "" },
                    }),
                ).rejects.toThrow();
            });

            it("throws error with whitespace-only delimiters", async () => {
                await expect(() =>
                    patchDocument({
                        outputType: "uint8array",
                        data: Buffer.from(""),
                        patches: {},
                        placeholderDelimiters: { start: " ", end: " " },
                    }),
                ).rejects.toThrowError();
            });
        });

        describe("document.xml and [Content_Types].xml with relationships", () => {
            beforeEach(() => {
                vi.spyOn(JSZip, "loadAsync").mockReturnValue(
                    new Promise<JSZip>((resolve) => {
                        const zip = new JSZip();

                        zip.file("word/document.xml", MOCK_XML);
                        zip.file(
                            "word/_rels/document.xml.rels",
                            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />
</Relationships>`,
                        );
                        zip.file(
                            "[Content_Types].xml",
                            `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml" />
</Types>`,
                        );
                        resolve(zip);
                    }),
                );
            });

            afterEach(() => {
                vi.restoreAllMocks();
            });

            it("should use the relationships file rather than create one", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: Buffer.from(""),
                    patches: {
                        image_test: {
                            type: PatchType.PARAGRAPH,
                            children: [
                                new ImageRun({
                                    type: "png",
                                    data: Buffer.from(""),
                                    transformation: { width: 100, height: 100 },
                                }),
                                new ExternalHyperlink({
                                    children: [
                                        new TextRun({
                                            text: "Google Link",
                                        }),
                                    ],
                                    link: "https://www.google.co.uk",
                                }),
                            ],
                        },
                    },
                });

                vi.restoreAllMocks();
                const outputZip = await JSZip.loadAsync(output);
                const relsXml = await outputZip.file("word/_rels/document.xml.rels")!.async("text");
                expect(relsXml).toContain('Target="https://www.google.co.uk"');
                expect(relsXml).toContain(
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
                );
            });
        });

        describe("document.xml", () => {
            beforeEach(() => {
                vi.spyOn(JSZip, "loadAsync").mockReturnValue(
                    new Promise<JSZip>((resolve) => {
                        const zip = new JSZip();

                        zip.file("word/document.xml", MOCK_XML);
                        resolve(zip);
                    }),
                );
            });

            afterEach(() => {
                vi.restoreAllMocks();
            });

            it("should throw an error if the content types is not found", () =>
                expect(
                    patchDocument({
                        outputType: "uint8array",
                        data: Buffer.from(""),
                        patches: {
                            image_test: {
                                type: PatchType.PARAGRAPH,
                                children: [
                                    new ImageRun({
                                        type: "png",
                                        data: Buffer.from(""),
                                        transformation: { width: 100, height: 100 },
                                    }),
                                ],
                            },
                        },
                    }),
                ).rejects.toThrowError());
        });

        describe("numbering", () => {
            const TEMPLATE_NUMBERING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:abstractNum w:abstractNumId="0">
        <w:lvl w:ilvl="0">
            <w:start w:val="1" />
            <w:numFmt w:val="decimal" />
            <w:lvlText w:val="%1." />
        </w:lvl>
    </w:abstractNum>
    <w:abstractNum w:abstractNumId="3">
        <w:lvl w:ilvl="0">
            <w:start w:val="1" />
            <w:numFmt w:val="bullet" />
            <w:lvlText w:val="" />
        </w:lvl>
    </w:abstractNum>
    <w:num w:numId="1">
        <w:abstractNumId w:val="0" />
    </w:num>
    <w:num w:numId="5">
        <w:abstractNumId w:val="3" />
    </w:num>
</w:numbering>`;

            const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml" />
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" />
</Types>`;

            const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />
</Relationships>`;

            const HEADER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:p>
        <w:r>
            <w:t>{{header_note}}</w:t>
        </w:r>
    </w:p>
</w:hdr>`;

            const numberedCell = (instance: number): TableCell =>
                new TableCell({
                    children: [
                        new Paragraph({
                            numbering: { reference: "patch-numbering", level: 0, instance },
                        }),
                    ],
                });

            const numberedTable = (instance: number): Table =>
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: ["a", "b", "c"].map(
                        (text) =>
                            new TableRow({
                                children: [
                                    numberedCell(instance),
                                    new TableCell({
                                        children: [
                                            new Paragraph({ children: [new TextRun(text)] }),
                                        ],
                                    }),
                                ],
                            }),
                    ),
                });

            const NUMBERING_OPTIONS = {
                config: [
                    {
                        reference: "patch-numbering",
                        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1." }],
                    },
                ],
            };

            const getUsedNumIds = (documentXml: string): readonly number[] =>
                [...documentXml.matchAll(/<w:numId w:val="(\d+)"\s*\/>/g)].map((match) =>
                    Number(match[1]),
                );

            const getDefinedNumIds = (numberingXml: string): readonly number[] =>
                [...numberingXml.matchAll(/<w:num w:numId="(\d+)"/g)].map((match) =>
                    Number(match[1]),
                );

            const getDefinedAbstractNumIds = (numberingXml: string): readonly number[] =>
                [...numberingXml.matchAll(/<w:abstractNum w:abstractNumId="(\d+)"/g)].map((match) =>
                    Number(match[1]),
                );

            it("should merge new numberings into an existing numbering.xml without id collisions", async () => {
                const zip = new JSZip();
                zip.file("word/document.xml", MOCK_XML);
                zip.file("word/numbering.xml", TEMPLATE_NUMBERING_XML);
                zip.file("word/_rels/document.xml.rels", RELS_XML);
                zip.file("[Content_Types].xml", CONTENT_TYPES_XML);

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    numbering: NUMBERING_OPTIONS,
                    patches: {
                        table: {
                            type: PatchType.DOCUMENT,
                            children: [numberedTable(1), numberedTable(2)],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                const numberingXml = await outputZip.file("word/numbering.xml")!.async("text");

                // placeholders are fully resolved to integer ids
                expect(documentXml).not.toContain("{patch-numbering-");
                const usedNumIds = getUsedNumIds(documentXml);
                expect(usedNumIds).toHaveLength(6);
                // distinct instances get independent concrete numberings
                expect(new Set(usedNumIds).size).toBe(2);

                const definedNumIds = getDefinedNumIds(numberingXml);
                const definedAbstractNumIds = getDefinedAbstractNumIds(numberingXml);

                // template entries are preserved
                expect(definedNumIds).toContain(1);
                expect(definedNumIds).toContain(5);
                expect(definedAbstractNumIds).toContain(0);
                expect(definedAbstractNumIds).toContain(3);

                // no id collisions
                expect(new Set(definedNumIds).size).toBe(definedNumIds.length);
                expect(new Set(definedAbstractNumIds).size).toBe(definedAbstractNumIds.length);

                // every used id resolves to a definition above the template's maxima
                for (const numId of new Set(usedNumIds)) {
                    expect(definedNumIds).toContain(numId);
                    expect(numId).toBeGreaterThan(5);
                }
            });

            it("should create numbering.xml with content type and relationship when the template has none", async () => {
                const zip = new JSZip();
                zip.file("word/document.xml", MOCK_XML);
                zip.file("word/_rels/document.xml.rels", RELS_XML);
                zip.file("[Content_Types].xml", CONTENT_TYPES_XML);

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    numbering: NUMBERING_OPTIONS,
                    patches: {
                        paragraph_replace: {
                            type: PatchType.DOCUMENT,
                            children: [
                                new Paragraph({
                                    numbering: {
                                        reference: "patch-numbering",
                                        level: 0,
                                        instance: 0,
                                    },
                                }),
                                new Paragraph({
                                    numbering: {
                                        reference: "patch-numbering",
                                        level: 0,
                                        instance: 1,
                                    },
                                }),
                            ],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                const numberingXml = await outputZip.file("word/numbering.xml")!.async("text");
                const contentTypesXml = await outputZip.file("[Content_Types].xml")!.async("text");
                const relsXml = await outputZip.file("word/_rels/document.xml.rels")!.async("text");

                expect(contentTypesXml).toContain('PartName="/word/numbering.xml"');
                expect(contentTypesXml).toContain(
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
                );
                expect(relsXml).toContain(
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering",
                );
                expect(relsXml).toContain('Target="numbering.xml"');

                expect(documentXml).not.toContain("{patch-numbering-");
                const usedNumIds = getUsedNumIds(documentXml);
                expect(new Set(usedNumIds).size).toBe(2);

                const definedNumIds = getDefinedNumIds(numberingXml);
                for (const numId of usedNumIds) {
                    expect(definedNumIds).toContain(numId);
                }
            });

            it("should merge the default bullet numbering when a patch uses bullets", async () => {
                const zip = new JSZip();
                zip.file("word/document.xml", MOCK_XML);
                zip.file("word/numbering.xml", TEMPLATE_NUMBERING_XML);
                zip.file("word/_rels/document.xml.rels", RELS_XML);
                zip.file("[Content_Types].xml", CONTENT_TYPES_XML);

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    patches: {
                        paragraph_replace: {
                            type: PatchType.DOCUMENT,
                            children: [new Paragraph({ text: "bullet", bullet: { level: 0 } })],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                const numberingXml = await outputZip.file("word/numbering.xml")!.async("text");

                expect(documentXml).not.toContain("{default-bullet-numbering");
                const usedNumIds = getUsedNumIds(documentXml);
                expect(usedNumIds).toHaveLength(1);
                // resolves above the template's existing ids and is defined in numbering.xml
                expect(usedNumIds[0]).toBeGreaterThan(5);
                expect(getDefinedNumIds(numberingXml)).toContain(usedNumIds[0]);
                expect(getDefinedAbstractNumIds(numberingXml).length).toBeGreaterThan(2);
            });

            it("should resolve numbering placeholders in patched headers", async () => {
                const zip = new JSZip();
                zip.file("word/document.xml", MOCK_XML);
                zip.file("word/header1.xml", HEADER_XML);
                zip.file("word/_rels/document.xml.rels", RELS_XML);
                zip.file("[Content_Types].xml", CONTENT_TYPES_XML);

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    numbering: NUMBERING_OPTIONS,
                    patches: {
                        header_note: {
                            type: PatchType.DOCUMENT,
                            children: [
                                new Paragraph({
                                    numbering: { reference: "patch-numbering", level: 0 },
                                }),
                            ],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const headerXml = await outputZip.file("word/header1.xml")!.async("text");
                const numberingXml = await outputZip.file("word/numbering.xml")!.async("text");

                expect(headerXml).not.toContain("{patch-numbering-");
                const usedNumIds = getUsedNumIds(headerXml);
                expect(usedNumIds).toHaveLength(1);
                expect(getDefinedNumIds(numberingXml)).toContain(usedNumIds[0]);
            });

            it("should not add numbering parts when no numbering option is given", async () => {
                const zip = new JSZip();
                zip.file("word/document.xml", MOCK_XML);
                zip.file("word/_rels/document.xml.rels", RELS_XML);
                zip.file("[Content_Types].xml", CONTENT_TYPES_XML);

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    patches: {
                        name: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("John Doe")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                expect(outputZip.file("word/numbering.xml")).toBeNull();
                const contentTypesXml = await outputZip.file("[Content_Types].xml")!.async("text");
                const relsXml = await outputZip.file("word/_rels/document.xml.rels")!.async("text");
                expect(contentTypesXml).not.toContain("numbering");
                expect(relsXml).not.toContain("numbering");
            });

            it("should not add numbering parts for an empty numbering config", async () => {
                const zip = new JSZip();
                zip.file("word/document.xml", MOCK_XML);
                zip.file("word/_rels/document.xml.rels", RELS_XML);
                zip.file("[Content_Types].xml", CONTENT_TYPES_XML);

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    numbering: { config: [] },
                    patches: {},
                });

                const outputZip = await JSZip.loadAsync(output);
                expect(outputZip.file("word/numbering.xml")).toBeNull();
            });
        });

        describe("Images", () => {
            beforeEach(() => {
                vi.spyOn(JSZip, "loadAsync").mockReturnValue(
                    new Promise<JSZip>((resolve) => {
                        const zip = new JSZip();

                        zip.file("word/document.xml", MOCK_XML);
                        zip.file("word/document.bmp", "");

                        resolve(zip);
                    }),
                );
            });

            afterEach(() => {
                vi.restoreAllMocks();
            });

            it("should throw an error if the content types is not found", () =>
                expect(
                    patchDocument({
                        outputType: "uint8array",
                        data: Buffer.from(""),
                        patches: {
                            image_test: {
                                type: PatchType.PARAGRAPH,
                                children: [
                                    new ImageRun({
                                        type: "png",
                                        data: Buffer.from(""),
                                        transformation: { width: 100, height: 100 },
                                    }),
                                ],
                            },
                        },
                    }),
                ).rejects.toThrowError());
        });

        describe("regressions", () => {
            const MINIMAL_CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml" />
</Types>`;

            const documentWithBody = (
                body: string,
            ): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:body>${body}</w:body>
</w:document>`;

            const makeZip = (body: string): JSZip => {
                const zip = new JSZip();
                zip.file("word/document.xml", documentWithBody(body));
                zip.file("[Content_Types].xml", MINIMAL_CONTENT_TYPES);
                return zip;
            };

            const getRenderedText = (xmlString: string): string =>
                [...xmlString.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
                    .map((match) => match[1])
                    .join("");

            it("should keep text order when the patched run has multiple w:t parts", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: makeZip(
                        `<w:p><w:r><w:t>Hello {{name}}</w:t><w:t xml:space="preserve"> and goodbye</w:t></w:r></w:p>`,
                    ),
                    patches: {
                        name: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("John")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                expect(getRenderedText(documentXml)).toBe("Hello John and goodbye");
            });

            it("should not corrupt document text containing the letter ɵ", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: makeZip(`<w:p><w:r><w:t>Аты ɵмір {{name}}</w:t></w:r></w:p>`),
                    patches: {
                        name: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("John")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                expect(getRenderedText(documentXml)).toBe("Аты ɵмір John");
            });

            it("should throw instead of looping forever when a patch contains its own placeholder", async () => {
                await expect(
                    patchDocument({
                        outputType: "uint8array",
                        data: makeZip(`<w:p><w:r><w:t>{{loop}}</w:t></w:r></w:p>`),
                        patches: {
                            loop: {
                                type: PatchType.PARAGRAPH,
                                children: [new TextRun("stay {{loop}} forever")],
                            },
                        },
                    }),
                ).rejects.toThrowError(/does not converge/);
            });

            it("should replace repeated occurrences without rescanning absent patch keys", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: makeZip(
                        `<w:p><w:r><w:t>{{name}}/{{name}}</w:t></w:r></w:p><w:p><w:r><w:t>{{name}}</w:t></w:r></w:p>`,
                    ),
                    patches: {
                        name: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("X")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                expect(documentXml).not.toContain("{{name}}");
                expect(getRenderedText(documentXml)).toBe("X/XX");
            });

            it("should rebuild token paths after document patches shift sibling indices", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: makeZip(
                        `<w:p><w:r><w:t>{{first}}</w:t></w:r></w:p><w:p><w:r><w:t>{{second}}</w:t></w:r></w:p><w:p><w:r><w:t>{{first}}</w:t></w:r></w:p>`,
                    ),
                    patches: {
                        first: {
                            type: PatchType.DOCUMENT,
                            children: [new Paragraph("A"), new Paragraph("B")],
                        },
                        second: {
                            type: PatchType.DOCUMENT,
                            children: [new Paragraph("C")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                expect(getRenderedText(documentXml)).toBe("ABCAB");
            });

            it("should preserve untouched XML and binary parts", async () => {
                const zip = makeZip(`<w:p><w:r><w:t>{{name}}</w:t></w:r></w:p>`);
                const customXml = `<?xml version="1.0"?><custom   value="kept" >\n  raw spacing\n</custom>`;
                const binary = Uint8Array.from({ length: 64 * 1024 }, (_, index) => index % 251);
                zip.file("customXml/item1.xml", customXml);
                zip.file("word/media/existing.bin", binary);

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    patches: {
                        name: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("kept")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                await expect(outputZip.file("customXml/item1.xml")!.async("text")).resolves.toBe(
                    customXml,
                );
                expect(
                    await outputZip.file("word/media/existing.bin")!.async("uint8array"),
                ).toEqual(binary);
            });

            it("should patch placeholders inside hyperlinks", async () => {
                const output = await patchDocument({
                    outputType: "uint8array",
                    data: makeZip(
                        `<w:p><w:r><w:t>See </w:t></w:r><w:hyperlink r:id="rId5"><w:r><w:t>{{link_text}}</w:t></w:r></w:hyperlink></w:p>`,
                    ),
                    patches: {
                        link_text: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("Click here")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const documentXml = await outputZip.file("word/document.xml")!.async("text");
                expect(documentXml).not.toContain("{{link_text}}");
                // the replacement stays inside the hyperlink element
                expect(documentXml).toMatch(
                    /<w:hyperlink[^>]*>[\s\S]*Click here[\s\S]*<\/w:hyperlink>/,
                );
                expect(getRenderedText(documentXml)).toBe("See Click here");
            });

            it("should throw when a patch uses a numbering reference that is not configured", async () => {
                await expect(
                    patchDocument({
                        outputType: "uint8array",
                        data: makeZip(`<w:p><w:r><w:t>{{list}}</w:t></w:r></w:p>`),
                        patches: {
                            list: {
                                type: PatchType.DOCUMENT,
                                children: [
                                    new Paragraph({
                                        text: "item",
                                        numbering: { reference: "unconfigured-ref", level: 0 },
                                    }),
                                ],
                            },
                        },
                    }),
                ).rejects.toThrowError(/Could not resolve numbering reference/);
            });

            it("should declare required namespaces on patched header parts", async () => {
                const zip = makeZip(`<w:p><w:r><w:t>body</w:t></w:r></w:p>`);
                zip.file(
                    "word/header1.xml",
                    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:p><w:r><w:t>{{header_note}}</w:t></w:r></w:p>
</w:hdr>`,
                );

                const output = await patchDocument({
                    outputType: "uint8array",
                    data: zip,
                    patches: {
                        header_note: {
                            type: PatchType.PARAGRAPH,
                            children: [new TextRun("A note")],
                        },
                    },
                });

                const outputZip = await JSZip.loadAsync(output);
                const headerXml = await outputZip.file("word/header1.xml")!.async("text");
                expect(headerXml).toContain("A note");
                expect(headerXml).toContain('xmlns:wp="');
                expect(headerXml).toContain('xmlns:r="');
                expect(headerXml).toMatch(/mc:Ignorable="[^"]*w15/);
            });
        });
    });
});
