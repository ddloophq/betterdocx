// http://officeopenxml.com/WPparagraph.php
import { FileChild } from "@file/file-child";
import { FootnoteReferenceRun } from "@file/footnotes";
import { IContext, IXmlableObject } from "@file/xml-components";

import { CheckBox } from "../checkbox";
import { DeletedTextRun, InsertedTextRun } from "../track-revision";
import { ColumnBreak, PageBreak } from "./formatting/break";
import { Bookmark, ConcreteHyperlink, ExternalHyperlink, InternalHyperlink } from "./links";
import { Math } from "./math";
import { IParagraphPropertiesOptions, ParagraphProperties } from "./properties";
import {
    ImageRun,
    Run,
    SequentialIdentifier,
    SimpleField,
    SimpleMailMergeField,
    SymbolRun,
    TextRun,
} from "./run";
import { CommentRangeEnd, CommentRangeStart, CommentReference } from "./run/comment-run";

export type ParagraphChild =
    | TextRun
    | ImageRun
    | SymbolRun
    | Bookmark
    | PageBreak
    | ColumnBreak
    | SequentialIdentifier
    | FootnoteReferenceRun
    | InternalHyperlink
    | ExternalHyperlink
    | InsertedTextRun
    | DeletedTextRun
    | Math
    | SimpleField
    | SimpleMailMergeField
    | CommentRangeStart
    | CommentRangeEnd
    | CommentReference
    | CheckBox;

export type IParagraphOptions = {
    readonly text?: string;
    readonly children?: readonly ParagraphChild[];
} & IParagraphPropertiesOptions;

const createHyperlinkRelationship = (context: IContext, link: string): string => {
    if (!context.session.relationships) {
        throw new Error("External hyperlinks require a render session with relationship services.");
    }
    return context.session.relationships.resolveHyperlink(link).replace(/^rId/, "");
};

export class Paragraph extends FileChild {
    private readonly properties: ParagraphProperties;

    public constructor(options: string | IParagraphOptions) {
        super("w:p");

        if (typeof options === "string") {
            this.properties = new ParagraphProperties({});
            this.root.push(this.properties);
            this.root.push(new TextRun(options));
            return this;
        }

        this.properties = new ParagraphProperties(options);

        this.root.push(this.properties);

        if (options.text) {
            this.root.push(new TextRun(options.text));
        }

        if (options.children) {
            for (const child of options.children) {
                if (child instanceof Bookmark) {
                    this.root.push(child.start);
                    for (const textRun of child.children) {
                        this.root.push(textRun);
                    }
                    this.root.push(child.end);
                    continue;
                }

                this.root.push(child);
            }
        }
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        // Swap ExternalHyperlinks for ConcreteHyperlinks transiently and restore
        // them afterwards, so reusing the same paragraph in another part (or
        // file) registers the relationship in that part's rels as well.
        const externalHyperlinks = this.root.flatMap((element, index) =>
            element instanceof ExternalHyperlink ? [{ index, element }] : [],
        );

        for (const { index, element } of externalHyperlinks) {
            this.root[index] = new ConcreteHyperlink(
                element.options.children,
                createHyperlinkRelationship(context, element.options.link),
            );
        }

        try {
            return super.prepForXml(context);
        } finally {
            for (const { index, element } of externalHyperlinks) {
                this.root[index] = element;
            }
        }
    }

    public addRunToFront(run: Run): Paragraph {
        this.root.splice(1, 0, run);
        return this;
    }
}
