import { Element } from "xml-js";

import { InputDataType, loadZip } from "./input-normalizer";
import { readZipText, toJson } from "./util";

const STYLES_PART = "word/styles.xml";

/** ST_StyleType — the kinds of style `word/styles.xml` can define. */
export const StyleType = {
    PARAGRAPH: "paragraph",
    CHARACTER: "character",
    TABLE: "table",
    NUMBERING: "numbering",
} as const;

export type DocumentStyle = {
    /** The `w:styleId` a `Paragraph`'s or `Table`'s `style` option refers to. */
    readonly id: string;
    /** The human-readable name Word shows in its style gallery, if the style declares one. */
    readonly name?: string;
    /** Absent when the style omits `w:type`, which per ECMA-376 implies a paragraph style. */
    readonly type?: (typeof StyleType)[keyof typeof StyleType];
};

export type ReadStylesOptions = {
    readonly data: InputDataType;
};

const attributeOf = (element: Element, key: string): string | undefined => {
    const value = element.attributes?.[key];
    return typeof value === "string" ? value : undefined;
};

const isStyleType = (value: string | undefined): value is DocumentStyle["type"] =>
    (Object.values(StyleType) as readonly string[]).includes(value ?? "");

const toDocumentStyle = (element: Element): DocumentStyle | undefined => {
    const id = attributeOf(element, "w:styleId");
    if (id === undefined) {
        return undefined;
    }

    const type = attributeOf(element, "w:type");
    const name = element.elements?.find((child) => child.name === "w:name");

    return {
        id,
        name: name === undefined ? undefined : attributeOf(name, "w:val"),
        // An unrecognized w:type is dropped rather than widening the union with
        // a value callers cannot match on.
        type: isStyleType(type) ? type : undefined,
    };
};

/**
 * Reads the styles a `.docx` defines, without unzipping it yourself.
 *
 * Useful on the `patchDocument` path, where the template owns every style and
 * code only references them by id. An id that the target does not define is not
 * an error: Word silently falls back to `Normal` when it opens the file, so a
 * typo ships as an unstyled document. Reading the ids lets you assert up front
 * that the styles you are about to reference actually exist.
 *
 * Returns an empty array for a document with no `word/styles.xml`.
 */
export const readStyles = async ({
    data,
}: ReadStylesOptions): Promise<readonly DocumentStyle[]> => {
    const zipContent = await loadZip(data);
    const stylesPart = await readZipText(zipContent, STYLES_PART);

    if (stylesPart === undefined) {
        return [];
    }

    const root = toJson(stylesPart).elements?.find((element) => element.name === "w:styles");

    return (root?.elements ?? [])
        .filter((element) => element.name === "w:style")
        .map(toDocumentStyle)
        .filter((style): style is DocumentStyle => style !== undefined);
};

/**
 * The `w:styleId`s a `.docx` defines — the ids usable as a `style` option.
 * A convenience over {@link readStyles} for when only the ids matter.
 */
export const readStyleIds = async (options: ReadStylesOptions): Promise<readonly string[]> =>
    (await readStyles(options)).map(({ id }) => id);
