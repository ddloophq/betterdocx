import { DocumentDefaults, IDocumentDefaultsOptions } from "./defaults";
import {
    FootnoteReferenceStyle,
    FootnoteText,
    FootnoteTextChar,
    Heading1Style,
    Heading2Style,
    Heading3Style,
    Heading4Style,
    Heading5Style,
    Heading6Style,
    HyperlinkStyle,
    IBaseCharacterStyleOptions,
    IBaseParagraphStyleOptions,
    ListParagraph,
    StrongStyle,
    TitleStyle,
} from "./style";
import { IStylesOptions } from "./styles";
import { DocumentAttributes, STYLES_ATTRIBUTE_NAMESPACES } from "../document/document-attributes";

export type IDefaultStylesOptions = {
    readonly document?: IDocumentDefaultsOptions;
    readonly title?: IBaseParagraphStyleOptions;
    readonly heading1?: IBaseParagraphStyleOptions;
    readonly heading2?: IBaseParagraphStyleOptions;
    readonly heading3?: IBaseParagraphStyleOptions;
    readonly heading4?: IBaseParagraphStyleOptions;
    readonly heading5?: IBaseParagraphStyleOptions;
    readonly heading6?: IBaseParagraphStyleOptions;
    readonly strong?: IBaseParagraphStyleOptions;
    readonly listParagraph?: IBaseParagraphStyleOptions;
    readonly hyperlink?: IBaseCharacterStyleOptions;
    readonly footnoteReference?: IBaseCharacterStyleOptions;
    readonly footnoteText?: IBaseParagraphStyleOptions;
    readonly footnoteTextChar?: IBaseCharacterStyleOptions;
};

// Merges user overrides into the built-in defaults one level deep, so e.g.
// `heading1: { run: { bold: true } }` keeps the built-in heading color/size.
const mergeStyleOptions = (
    defaults: IBaseParagraphStyleOptions,
    overrides: IBaseParagraphStyleOptions = {},
): IBaseParagraphStyleOptions => ({
    ...defaults,
    ...overrides,
    ...(defaults.run || overrides.run ? { run: { ...defaults.run, ...overrides.run } } : {}),
    ...(defaults.paragraph || overrides.paragraph
        ? { paragraph: { ...defaults.paragraph, ...overrides.paragraph } }
        : {}),
});

export class DefaultStylesFactory {
    public newInstance(options: IDefaultStylesOptions = {}): IStylesOptions {
        const documentAttributes = new DocumentAttributes(STYLES_ATTRIBUTE_NAMESPACES, "w14 w15");
        return {
            initialStyles: documentAttributes,
            importedStyles: [
                new DocumentDefaults(options.document ?? {}),
                new TitleStyle(
                    mergeStyleOptions(
                        {
                            run: {
                                size: 56,
                            },
                        },
                        options.title,
                    ),
                ),
                new Heading1Style(
                    mergeStyleOptions(
                        {
                            run: {
                                color: "2E74B5",
                                size: 32,
                            },
                        },
                        options.heading1,
                    ),
                ),
                new Heading2Style(
                    mergeStyleOptions(
                        {
                            run: {
                                color: "2E74B5",
                                size: 26,
                            },
                        },
                        options.heading2,
                    ),
                ),
                new Heading3Style(
                    mergeStyleOptions(
                        {
                            run: {
                                color: "1F4D78",
                                size: 24,
                            },
                        },
                        options.heading3,
                    ),
                ),
                new Heading4Style(
                    mergeStyleOptions(
                        {
                            run: {
                                color: "2E74B5",
                                italics: true,
                            },
                        },
                        options.heading4,
                    ),
                ),
                new Heading5Style(
                    mergeStyleOptions(
                        {
                            run: {
                                color: "2E74B5",
                            },
                        },
                        options.heading5,
                    ),
                ),
                new Heading6Style(
                    mergeStyleOptions(
                        {
                            run: {
                                color: "1F4D78",
                            },
                        },
                        options.heading6,
                    ),
                ),
                new StrongStyle(
                    mergeStyleOptions(
                        {
                            run: {
                                bold: true,
                            },
                        },
                        options.strong,
                    ),
                ),
                new ListParagraph(options.listParagraph ?? {}),
                new HyperlinkStyle(options.hyperlink ?? {}),
                new FootnoteReferenceStyle(options.footnoteReference ?? {}),
                new FootnoteText(options.footnoteText ?? {}),
                new FootnoteTextChar(options.footnoteTextChar ?? {}),
            ],
        };
    }
}
