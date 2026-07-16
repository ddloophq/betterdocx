import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { File } from "@file/file";
import { Footer, Header } from "@file/header";
import { LevelFormat } from "@file/numbering";
import { Bookmark, ExternalHyperlink, ImageRun, Paragraph, TextRun } from "@file/paragraph";
import * as convenienceFunctions from "@util/convenience-functions";

import { Compiler } from "./next-compiler";

describe("Compiler", () => {
    let compiler: Compiler;

    beforeEach(() => {
        compiler = new Compiler();
    });

    beforeAll(() => {
        vi.spyOn(convenienceFunctions, "uniqueId").mockReturnValue("test");
    });

    afterAll(() => {
        vi.resetAllMocks();
    });

    describe("#compile()", () => {
        it("should pack all the content", { timeout: 99999999 }, () => {
            const file = new File({
                sections: [],
                comments: {
                    children: [],
                },
            });
            const zipFile = compiler.compile(file);
            const fileNames = Object.values(zipFile.files).map((f) => f.name);

            expect(fileNames).is.an.instanceof(Array);
            expect(fileNames).has.length(20);
            expect(fileNames).to.include("word/document.xml");
            expect(fileNames).to.include("word/styles.xml");
            expect(fileNames).to.include("docProps/core.xml");
            expect(fileNames).to.include("docProps/custom.xml");
            expect(fileNames).to.include("docProps/app.xml");
            expect(fileNames).to.include("word/numbering.xml");
            expect(fileNames).to.include("word/footnotes.xml");
            expect(fileNames).to.include("word/_rels/footnotes.xml.rels");
            expect(fileNames).to.include("word/settings.xml");
            expect(fileNames).to.include("word/comments.xml");
            expect(fileNames).to.include("word/fontTable.xml");
            expect(fileNames).to.include("word/_rels/document.xml.rels");
            expect(fileNames).to.include("word/_rels/fontTable.xml.rels");
            expect(fileNames).to.include("[Content_Types].xml");
            expect(fileNames).to.include("_rels/.rels");
        });

        it("should pack all additional headers and footers", { timeout: 99999999 }, () => {
            const file = new File({
                sections: [
                    {
                        headers: {
                            default: new Header({
                                children: [new Paragraph("test")],
                            }),
                        },
                        footers: {
                            default: new Footer({
                                children: [new Paragraph("test")],
                            }),
                        },
                        children: [],
                    },
                    {
                        headers: {
                            default: new Header({
                                children: [new Paragraph("test")],
                            }),
                        },
                        footers: {
                            default: new Footer({
                                children: [new Paragraph("test")],
                            }),
                        },
                        children: [],
                    },
                ],
            });

            const zipFile = compiler.compile(file);
            const fileNames = Object.values(zipFile.files).map((f) => f.name);

            expect(fileNames).is.an.instanceof(Array);
            expect(fileNames).has.length(28);

            expect(fileNames).to.include("word/header1.xml");
            expect(fileNames).to.include("word/_rels/header1.xml.rels");
            expect(fileNames).to.include("word/header2.xml");
            expect(fileNames).to.include("word/_rels/header2.xml.rels");
            expect(fileNames).to.include("word/footer1.xml");
            expect(fileNames).to.include("word/_rels/footer1.xml.rels");
            expect(fileNames).to.include("word/footer2.xml");
            expect(fileNames).to.include("word/_rels/footer2.xml.rels");
        });

        it("should pack subfile overrides", { timeout: 99999999 }, async () => {
            const file = new File({
                sections: [],
                comments: {
                    children: [],
                },
            });
            const subfileData1 = "comments";
            const subfileData2 = "commentsExtended";
            const overrides = [
                { path: "word/comments.xml", data: subfileData1 },
                { path: "word/commentsExtended.xml", data: subfileData2 },
            ];
            const zipFile = compiler.compile(file, "", overrides);
            const fileNames = Object.values(zipFile.files).map((f) => f.name);

            expect(fileNames).is.an.instanceof(Array);
            expect(fileNames).has.length(21);

            expect(fileNames).to.include("word/comments.xml");
            expect(fileNames).to.include("word/commentsExtended.xml");

            const commentsText = await zipFile.file("word/comments.xml")?.async("text");
            const commentsExtendedText = await zipFile
                .file("word/commentsExtended.xml")
                ?.async("text");

            expect(commentsText).toBe(subfileData1);
            expect(commentsExtendedText).toBe(subfileData2);
        });

        it("should call the format method X times equalling X files to be formatted", () => {
            // This test is required because before, there was a case where Document was formatted twice, which was inefficient
            // This also caused issues such as running prepForXml multiple times as format() was ran multiple times.
            const paragraph = new Paragraph("");
            const file = new File({
                sections: [
                    {
                        properties: {},
                        children: [paragraph],
                    },
                ],
            });

            const spy = vi.spyOn(compiler["formatter"], "format");

            compiler.compile(file);
            expect(spy).toBeCalledTimes(16);
        });

        it("should work with media datas", () => {
            const file = new File({
                sections: [
                    {
                        headers: {
                            default: new Header({
                                children: [new Paragraph("test")],
                            }),
                        },
                        footers: {
                            default: new Footer({
                                children: [new Paragraph("test")],
                            }),
                        },
                        children: [
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        type: "png",
                                        data: Buffer.from("", "base64"),
                                        transformation: {
                                            width: 100,
                                            height: 100,
                                        },
                                    }),
                                    new ImageRun({
                                        type: "svg",
                                        data: Buffer.from("", "base64"),
                                        transformation: {
                                            width: 100,
                                            height: 100,
                                        },
                                        fallback: {
                                            type: "png",
                                            data: Buffer.from("", "base64"),
                                        },
                                    }),
                                ],
                            }),
                        ],
                    },
                ],
            });

            compiler.compile(file);
        });

        // A hyperlinked image legitimately carries two hlinkClick elements (one
        // in wp:docPr, one in pic:cNvPr). The old double-serialization of header
        // views emitted four, corrupting the document.
        it("should not duplicate hlinkClick elements for hyperlinked images in headers", async () => {
            const file = new File({
                sections: [
                    {
                        headers: {
                            default: new Header({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new ExternalHyperlink({
                                                link: "https://example.com",
                                                children: [
                                                    new ImageRun({
                                                        type: "png",
                                                        data: Buffer.from("", "base64"),
                                                        transformation: {
                                                            width: 100,
                                                            height: 100,
                                                        },
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        },
                        children: [],
                    },
                ],
            });

            const zipFile = compiler.compile(file);
            const headerText = await zipFile.file("word/header1.xml")?.async("text");

            expect(headerText?.match(/<a:hlinkClick/g)).toHaveLength(2);
        });

        it("should produce identical output when compiling the same document twice", async () => {
            const file = new File({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                text: "test",
                                bullet: { level: 0 },
                            }),
                        ],
                    },
                ],
            });

            const readEntries = async (zip: ReturnType<Compiler["compile"]>) => ({
                numbering: await zip.file("word/numbering.xml")?.async("text"),
                relationships: await zip.file("word/_rels/document.xml.rels")?.async("text"),
                document: await zip.file("word/document.xml")?.async("text"),
            });

            const first = await readEntries(compiler.compile(file));
            const second = await readEntries(compiler.compile(file));

            expect(second.numbering).toBe(first.numbering);
            expect(second.relationships).toBe(first.relationships);
            expect(second.document).toBe(first.document);
        });

        it("isolates concurrent compilations which reuse the same components", async () => {
            const bookmark = new Bookmark({
                id: "shared",
                children: [new TextRun("shared")],
            });
            const paragraph = new Paragraph({ children: [bookmark] });
            const file = new File({ sections: [{ children: [paragraph] }] });
            const readDocument = async (zip: ReturnType<Compiler["compile"]>) =>
                zip.file("word/document.xml")!.async("text");

            const [first, second] = await Promise.all([
                readDocument(compiler.compile(file)),
                readDocument(compiler.compile(file)),
            ]);

            expect(second).toBe(first);
            expect(first).toContain('<w:bookmarkStart w:name="shared" w:id="1"/>');
            expect(first).toContain('<w:bookmarkEnd w:id="1"/>');
        });

        it("should replace numbering placeholders for references containing regex metacharacters", async () => {
            const file = new File({
                numbering: {
                    config: [
                        {
                            reference: "notes (draft)",
                            levels: [
                                {
                                    level: 0,
                                    format: LevelFormat.DECIMAL,
                                    text: "%1.",
                                },
                            ],
                        },
                    ],
                },
                sections: [
                    {
                        children: [
                            new Paragraph({
                                text: "test",
                                numbering: {
                                    reference: "notes (draft)",
                                    level: 0,
                                },
                            }),
                        ],
                    },
                ],
            });

            const zipFile = compiler.compile(file);
            const documentText = await zipFile.file("word/document.xml")?.async("text");

            expect(documentText).not.toContain("{notes (draft)-0}");
            expect(documentText).toMatch(/<w:numId w:val="\d+"\/>/);
        });

        it("should preserve visible text that looks like a numbering placeholder", async () => {
            const file = new File({
                numbering: {
                    config: [
                        {
                            reference: "items",
                            levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1." }],
                        },
                    ],
                },
                sections: [
                    {
                        children: [
                            new Paragraph("Literal {items-0}"),
                            new Paragraph({
                                text: "numbered",
                                numbering: { reference: "items", level: 0 },
                            }),
                        ],
                    },
                ],
            });

            const documentText = await compiler
                .compile(file)
                .file("word/document.xml")
                ?.async("text");

            expect(documentText).toContain("Literal {items-0}");
            expect(documentText).toMatch(/<w:numId w:val="\d+"\/>/);
        });

        it("should reject unknown numbering references instead of packing invalid OOXML", () => {
            const file = new File({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                text: "numbered",
                                numbering: { reference: "missing", level: 0 },
                            }),
                        ],
                    },
                ],
            });

            expect(() => compiler.compile(file)).toThrow(
                'Could not resolve numbering reference "missing"',
            );
        });

        it("should resolve image placeholders and relationships in footnotes", async () => {
            const file = new File({
                sections: [],
                footnotes: {
                    1: {
                        children: [
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        type: "png",
                                        data: Buffer.from("", "base64"),
                                        transformation: {
                                            width: 100,
                                            height: 100,
                                        },
                                    }),
                                ],
                            }),
                        ],
                    },
                },
            });

            const zipFile = compiler.compile(file);
            const footnotesText = await zipFile.file("word/footnotes.xml")?.async("text");
            const footnotesRelationshipsText = await zipFile
                .file("word/_rels/footnotes.xml.rels")
                ?.async("text");

            expect(footnotesText).not.toMatch(/\{[^}]+\}/);
            expect(footnotesRelationshipsText).toContain(
                "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
            );
            expect(footnotesRelationshipsText).toContain("media/");
        });

        it("should register concrete numbering for numbered paragraphs in headers", async () => {
            const file = new File({
                numbering: {
                    config: [
                        {
                            reference: "header-numbering",
                            levels: [
                                {
                                    level: 0,
                                    format: LevelFormat.DECIMAL,
                                    text: "%1.",
                                },
                            ],
                        },
                    ],
                },
                sections: [
                    {
                        headers: {
                            default: new Header({
                                children: [
                                    new Paragraph({
                                        text: "test",
                                        numbering: {
                                            reference: "header-numbering",
                                            level: 0,
                                        },
                                    }),
                                ],
                            }),
                        },
                        children: [],
                    },
                ],
            });

            const zipFile = compiler.compile(file);
            const headerText = await zipFile.file("word/header1.xml")?.async("text");
            const numberingText = await zipFile.file("word/numbering.xml")?.async("text");

            expect(headerText).not.toContain("{header-numbering-0}");
            const numId = headerText?.match(/<w:numId w:val="(\d+)"\/>/)?.[1];
            expect(numId).toBeDefined();
            expect(numberingText).toContain(`<w:num w:numId="${numId}">`);
        });

        it("resolves one reused numbered paragraph in each owning part", async () => {
            const paragraph = new Paragraph({
                text: "numbered",
                numbering: { reference: "shared-numbering", level: 0 },
            });
            const file = new File({
                numbering: {
                    config: [
                        {
                            reference: "shared-numbering",
                            levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1." }],
                        },
                    ],
                },
                sections: [
                    {
                        headers: { default: new Header({ children: [paragraph] }) },
                        children: [paragraph],
                    },
                ],
            });
            const zip = compiler.compile(file);
            const [documentXml, headerXml, numberingXml] = await Promise.all([
                zip.file("word/document.xml")!.async("text"),
                zip.file("word/header1.xml")!.async("text"),
                zip.file("word/numbering.xml")!.async("text"),
            ]);
            const documentNumId = documentXml.match(/<w:numId w:val="(\d+)"\/>/)?.[1];
            const headerNumId = headerXml.match(/<w:numId w:val="(\d+)"\/>/)?.[1];

            expect(documentNumId).toBeDefined();
            expect(headerNumId).toBe(documentNumId);
            expect(numberingXml).toContain(`<w:num w:numId="${documentNumId}">`);
        });

        it("should resolve bullet paragraphs to the default bullet numbering", async () => {
            const file = new File({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                text: "test",
                                bullet: { level: 0 },
                            }),
                        ],
                    },
                ],
            });

            const zipFile = compiler.compile(file);
            const documentText = await zipFile.file("word/document.xml")?.async("text");
            const numberingText = await zipFile.file("word/numbering.xml")?.async("text");

            expect(documentText).not.toContain("{default-bullet-numbering");
            const numId = documentText?.match(/<w:numId w:val="(\d+)"\/>/)?.[1];
            expect(numId).toBeDefined();
            expect(numberingText).toContain(`<w:num w:numId="${numId}">`);
        });

        it("should give each drawing a distinct docPr id", async () => {
            const image = {
                type: "png",
                data: Buffer.from("", "base64"),
                transformation: {
                    width: 100,
                    height: 100,
                },
            } as const;
            const file = new File({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                children: [new ImageRun(image), new ImageRun(image)],
                            }),
                        ],
                    },
                ],
            });

            const zipFile = compiler.compile(file);
            const documentText = await zipFile.file("word/document.xml")?.async("text");

            const ids = [...(documentText?.matchAll(/<wp:docPr id="(\d+)"/g) ?? [])].map(
                (match) => match[1],
            );
            expect(ids).toHaveLength(2);
            expect(new Set(ids).size).toBe(2);
        });

        it("should register hyperlink relationships in every part reusing a paragraph", async () => {
            const paragraph = new Paragraph({
                children: [
                    new ExternalHyperlink({
                        link: "https://example.com",
                        children: [new TextRun("link")],
                    }),
                ],
            });
            const file = new File({
                sections: [
                    {
                        headers: {
                            default: new Header({ children: [paragraph] }),
                        },
                        children: [paragraph],
                    },
                ],
            });

            const zipFile = compiler.compile(file);
            const readRelationshipId = async (partPath: string, relsPath: string) => {
                const partText = await zipFile.file(partPath)?.async("text");
                const relsText = await zipFile.file(relsPath)?.async("text");
                const relationshipId = partText?.match(/<w:hyperlink[^>]* r:id="([^"]+)"/)?.[1];

                expect(relationshipId).toBeDefined();
                expect(relsText).toContain(
                    `Id="${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com"`,
                );
            };

            await readRelationshipId("word/document.xml", "word/_rels/document.xml.rels");
            await readRelationshipId("word/header1.xml", "word/_rels/header1.xml.rels");
        });

        it("registers a reused image independently in every owning part", async () => {
            const image = new ImageRun({
                type: "png",
                data: new Uint8Array([1, 2, 3]),
                transformation: { width: 1, height: 1 },
            });
            const paragraph = new Paragraph({ children: [image] });
            const file = new File({
                sections: [
                    {
                        headers: { default: new Header({ children: [paragraph] }) },
                        children: [paragraph],
                    },
                ],
            });
            const zip = compiler.compile(file);

            await Promise.all(
                (
                    [
                        ["word/document.xml", "word/_rels/document.xml.rels"],
                        ["word/header1.xml", "word/_rels/header1.xml.rels"],
                    ] as const
                ).map(async ([part, relationships]) => {
                    const partXml = await zip.file(part)!.async("text");
                    const relationshipXml = await zip.file(relationships)!.async("text");
                    const relationshipId = partXml.match(/r:embed="(rId\d+)"/)?.[1];

                    expect(relationshipId).toBeDefined();
                    expect(relationshipXml).toContain(`Id="${relationshipId}"`);
                    expect(relationshipXml).toContain("/relationships/image");
                }),
            );
        });

        it("allocates a fresh bookmark id when the same bookmark object is reused", async () => {
            const bookmark = new Bookmark({
                id: "reused",
                children: [new TextRun("bookmark")],
            });
            const documentXml = await compiler
                .compile(
                    new File({
                        sections: [
                            {
                                children: [
                                    new Paragraph({ children: [bookmark] }),
                                    new Paragraph({ children: [bookmark] }),
                                ],
                            },
                        ],
                    }),
                )
                .file("word/document.xml")!
                .async("text");

            const startIds = [...documentXml.matchAll(/w:bookmarkStart[^>]*w:id="(\d+)"/g)].map(
                (match) => match[1],
            );
            const endIds = [...documentXml.matchAll(/w:bookmarkEnd w:id="(\d+)"/g)].map(
                (match) => match[1],
            );
            expect(startIds).toEqual(["1", "2"]);
            expect(endIds).toEqual(startIds);
        });

        it("should produce identical bookmark ids across sequentially created files", async () => {
            const createFile = () =>
                new File({
                    sections: [
                        {
                            children: [
                                new Paragraph({
                                    children: [
                                        new Bookmark({
                                            id: "first-anchor",
                                            children: [new TextRun("first")],
                                        }),
                                    ],
                                }),
                                new Paragraph({
                                    children: [
                                        new Bookmark({
                                            id: "second-anchor",
                                            children: [new TextRun("second")],
                                        }),
                                    ],
                                }),
                            ],
                        },
                    ],
                });

            const first = await compiler
                .compile(createFile())
                .file("word/document.xml")
                ?.async("text");
            const second = await compiler
                .compile(createFile())
                .file("word/document.xml")
                ?.async("text");

            expect(first).toMatch(/<w:bookmarkStart w:name="first-anchor" w:id="\d+"\/>/);
            expect(second).toBe(first);
        });

        it("should allocate reused bookmark ids independently in each file", async () => {
            const sharedBookmark = new Bookmark({
                id: "shared-anchor",
                children: [new TextRun("shared")],
            });
            const fileWith = (bookmarks: readonly Bookmark[]) =>
                new File({
                    sections: [
                        {
                            children: bookmarks.map(
                                (bookmark) => new Paragraph({ children: [bookmark] }),
                            ),
                        },
                    ],
                });

            const first = await compiler
                .compile(fileWith([sharedBookmark]))
                .file("word/document.xml")
                ?.async("text");
            const second = await compiler
                .compile(
                    fileWith([
                        new Bookmark({ id: "new-anchor", children: [new TextRun("new")] }),
                        sharedBookmark,
                    ]),
                )
                .file("word/document.xml")
                ?.async("text");

            expect(first).toContain('<w:bookmarkStart w:name="shared-anchor" w:id="1"/>');
            expect(second).toContain('<w:bookmarkStart w:name="new-anchor" w:id="1"/>');
            expect(second).toContain('<w:bookmarkStart w:name="shared-anchor" w:id="2"/>');
            expect(second).toContain('<w:bookmarkEnd w:id="2"/>');
        });

        it("should write embedded fonts to safe physical package paths", async () => {
            // The font key must be GUID-shaped for ODTTF obfuscation.
            vi.spyOn(convenienceFunctions, "uniqueId").mockReturnValue(
                "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            );

            const file = new File({
                sections: [],
                fonts: [
                    { name: "../Pacifico unsafe", data: new Uint8Array() },
                    { name: "../Pacifico unsafe", data: new ArrayBuffer(0) },
                ],
            });

            const zip = compiler.compile(file);
            const fontTable = await zip.file("word/fontTable.xml")?.async("text");
            const relationships = await zip.file("word/_rels/fontTable.xml.rels")?.async("text");

            expect(zip.file("word/fonts/font1.odttf")).not.toBeNull();
            expect(zip.file("word/fonts/font2.odttf")).toBeNull();
            expect(zip.file("word/fonts/Pacifico unsafe.odttf")).toBeNull();
            expect(fontTable).toContain('w:name="../Pacifico unsafe"');
            expect(relationships).toContain('Target="fonts/font1.odttf"');
        });
    });
});
