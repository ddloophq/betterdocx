import JSZip from "jszip";
import xml from "xml";

import { IViewWrapper } from "@file/document-wrapper";
import { File } from "@file/file";
import { obfuscate } from "@file/fonts/obfuscate-ttf-to-odttf";
import { BaseXmlComponent, IRenderIdService, createRenderSession } from "@file/xml-components";
import { OutputByType, OutputType } from "@util/output-type";

import { Formatter } from "../formatter";
import { PrettifyType } from "./packer";

export type IXmlifyedFile = {
    readonly data: string;
    readonly path: string;
};

export type IXmlifyedFileMapping = {
    readonly Document: IXmlifyedFile;
    readonly Styles: IXmlifyedFile;
    readonly Properties: IXmlifyedFile;
    readonly Numbering: IXmlifyedFile;
    readonly Relationships: IXmlifyedFile;
    readonly FileRelationships: IXmlifyedFile;
    readonly Headers: readonly IXmlifyedFile[];
    readonly Footers: readonly IXmlifyedFile[];
    readonly HeaderRelationships: readonly IXmlifyedFile[];
    readonly FooterRelationships: readonly IXmlifyedFile[];
    readonly ContentTypes: IXmlifyedFile;
    readonly CustomProperties: IXmlifyedFile;
    readonly AppProperties: IXmlifyedFile;
    readonly FootNotes: IXmlifyedFile;
    readonly FootNotesRelationships: IXmlifyedFile;
    readonly Settings: IXmlifyedFile;
    readonly Comments: IXmlifyedFile;
    readonly CommentsRelationships: IXmlifyedFile;
    readonly FontTable: IXmlifyedFile;
    readonly FontTableRelationships: IXmlifyedFile;
};

/** Browser-neutral subset of the archive returned by Compiler.compile. */
export type ICompiledArchiveOutputByType = OutputByType & { readonly text: string };

export type ICompiledArchive = {
    readonly files: Readonly<Record<string, { readonly name: string; readonly dir: boolean }>>;
    readonly file: (path: string) => {
        readonly async: <T extends keyof ICompiledArchiveOutputByType>(
            type: T,
        ) => Promise<ICompiledArchiveOutputByType[T]>;
    } | null;
    readonly generateAsync: <T extends OutputType>(options: {
        readonly type: T;
        readonly [key: string]: unknown;
    }) => Promise<OutputByType[T]>;
};

const IMAGE_RELATIONSHIP_TYPE =
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";
const FONT_TABLE_RELATIONSHIP_TYPE =
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable";

export class Compiler {
    private readonly formatter: Formatter;

    public constructor() {
        this.formatter = new Formatter();
    }

    public compile(
        file: File,
        prettifyXml?: (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): ICompiledArchive {
        const zip = new JSZip();
        const xmlifiedFileMapping = this.xmlifyFile(file, prettifyXml);

        for (const obj of Object.values(xmlifiedFileMapping)) {
            const subFiles = Array.isArray(obj)
                ? (obj as readonly IXmlifyedFile[])
                : [obj as IXmlifyedFile];
            for (const subFile of subFiles) {
                zip.file(subFile.path, subFile.data);
            }
        }

        for (const subFile of overrides) {
            zip.file(subFile.path, subFile.data);
        }

        for (const data of file.Media.Array) {
            zip.file(`word/media/${data.fileName}`, data.data);
            if (data.type === "svg") {
                zip.file(`word/media/${data.fallback.fileName}`, data.fallback.data);
            }
        }

        for (const { data: buffer, fileName, fontKey } of file.FontTable.fontOptionsWithKey) {
            zip.file(`word/fonts/${fileName}`, obfuscate(buffer, fontKey));
        }

        return zip as unknown as ICompiledArchive;
    }

    private xmlifyFile(
        file: File,
        prettify?: (typeof PrettifyType)[keyof typeof PrettifyType],
    ): IXmlifyedFileMapping {
        let drawingId = 0;
        let bookmarkId = 0;
        const ids: IRenderIdService = {
            nextDrawingId: () => ++drawingId,
            nextBookmarkId: () => ++bookmarkId,
        };

        const serialize = (
            component: BaseXmlComponent,
            viewWrapper: IViewWrapper,
            standalone = false,
        ): string =>
            xml(
                this.formatter.format(component, {
                    session: createRenderSession({
                        media: file.Media,
                        numbering: {
                            resolve: (reference, instance) =>
                                file.Numbering.getConcreteNumberingId(reference, instance),
                        },
                        relationships: {
                            resolveHyperlink: (target) =>
                                `rId${viewWrapper.Relationships.getOrCreateRelationship(
                                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
                                    target,
                                    "External",
                                )}`,
                            resolveImage: (fileName) =>
                                `rId${viewWrapper.Relationships.getOrCreateRelationship(
                                    IMAGE_RELATIONSHIP_TYPE,
                                    `media/${fileName}`,
                                )}`,
                        },
                        ids,
                    }),
                    stack: [],
                }),
                {
                    indent: prettify,
                    declaration: standalone
                        ? { standalone: "yes", encoding: "UTF-8" }
                        : { encoding: "UTF-8" },
                },
            );

        // Each header/footer view is serialized exactly once. Serializing twice
        // would corrupt hyperlinked images: DocProperties.prepForXml appends an
        // a:hlinkClick element per pass.
        const xmlifySectionViews = (
            wrappers: readonly IViewWrapper[],
            kind: "header" | "footer",
        ): readonly { readonly content: IXmlifyedFile; readonly relationships: IXmlifyedFile }[] =>
            wrappers.map((wrapper, index) => {
                const viewXmlData = serialize(wrapper.View, wrapper);
                const content = {
                    data: viewXmlData,
                    path: `word/${kind}${index + 1}.xml`,
                };
                return {
                    content,
                    relationships: {
                        data: serialize(wrapper.Relationships, wrapper),
                        path: `word/_rels/${kind}${index + 1}.xml.rels`,
                    },
                };
            });

        const documentXmlData = serialize(file.Document.View, file.Document, true);
        const documentData = documentXmlData;
        file.Document.Relationships.getOrCreateRelationship(
            FONT_TABLE_RELATIONSHIP_TYPE,
            "fontTable.xml",
        );

        const commentsViewWrapper = {
            View: file.Comments,
            Relationships: file.Comments.Relationships,
        };
        const commentXmlData = serialize(file.Comments, commentsViewWrapper, true);
        const commentsData = commentXmlData;

        const footNotesXmlData = serialize(file.FootNotes.View, file.FootNotes);
        const footNotesData = footNotesXmlData;

        const headers = xmlifySectionViews(file.Headers, "header");
        const footers = xmlifySectionViews(file.Footers, "footer");

        return {
            Relationships: {
                data: serialize(file.Document.Relationships, file.Document),
                path: "word/_rels/document.xml.rels",
            },
            Document: {
                data: documentData,
                path: "word/document.xml",
            },
            Styles: {
                data: serialize(file.Styles, file.Document, true),
                path: "word/styles.xml",
            },
            Properties: {
                data: serialize(file.CoreProperties, file.Document, true),
                path: "docProps/core.xml",
            },
            Numbering: {
                data: serialize(file.Numbering, file.Document, true),
                path: "word/numbering.xml",
            },
            FileRelationships: {
                data: serialize(file.FileRelationships, file.Document),
                path: "_rels/.rels",
            },
            HeaderRelationships: headers.map((header) => header.relationships),
            FooterRelationships: footers.map((footer) => footer.relationships),
            Headers: headers.map((header) => header.content),
            Footers: footers.map((footer) => footer.content),
            ContentTypes: {
                data: serialize(file.ContentTypes, file.Document),
                path: "[Content_Types].xml",
            },
            CustomProperties: {
                data: serialize(file.CustomProperties, file.Document, true),
                path: "docProps/custom.xml",
            },
            AppProperties: {
                data: serialize(file.AppProperties, file.Document, true),
                path: "docProps/app.xml",
            },
            FootNotes: {
                data: footNotesData,
                path: "word/footnotes.xml",
            },
            FootNotesRelationships: {
                data: serialize(file.FootNotes.Relationships, file.FootNotes),
                path: "word/_rels/footnotes.xml.rels",
            },
            Settings: {
                data: serialize(file.Settings, file.Document, true),
                path: "word/settings.xml",
            },
            Comments: {
                data: commentsData,
                path: "word/comments.xml",
            },
            CommentsRelationships: {
                data: serialize(file.Comments.Relationships, commentsViewWrapper),
                path: "word/_rels/comments.xml.rels",
            },
            FontTable: {
                data: serialize(file.FontTable.View, file.Document, true),
                path: "word/fontTable.xml",
            },
            FontTableRelationships: {
                data: serialize(file.FontTable.Relationships, file.Document),
                path: "word/_rels/fontTable.xml.rels",
            },
        };
    }
}
