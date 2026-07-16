import xml from "xml";
import { Element, js2xml } from "xml-js";

import { Formatter } from "@export/formatter";
import { ImageReplacer } from "@export/packer/image-replacer";
import { NumberingReplacer } from "@export/packer/numbering-replacer";
import { DocumentAttributeNamespaces } from "@file/document";
import { FileChild } from "@file/file-child";
import { IMediaData, Media } from "@file/media";
import { AbstractNumbering, INumberingOptions, Numbering } from "@file/numbering";
import { ConcreteHyperlink, ExternalHyperlink, ParagraphChild } from "@file/paragraph";
import { TargetModeType } from "@file/relationships/relationship/relationship";
import {
    IContext,
    IRenderIdService,
    XmlComponent,
    createRenderSession,
} from "@file/xml-components";
import { uniqueId } from "@util/convenience-functions";
import { OutputByType, OutputType } from "@util/output-type";

import { appendContentType, appendOverrideContentType } from "./content-types-manager";
import { InputDataType, loadZip } from "./input-normalizer";
import { appendRelationship, getNextRelationshipIndex } from "./relationship-manager";
import { replacer } from "./replacer";
import { TextLocationIndex } from "./text-location-index";
import { TokenNotFoundError } from "./token-not-found-error";
import { getFirstLevelElements, readZipText, toJson, xmlZipKeys } from "./util";

export type { InputDataType } from "./input-normalizer";

export const PatchType = {
    /**
     * Replaces the whole placeholder paragraph with block-level children
     * (paragraphs, tables). Use this when the patch content is one or more
     * blocks that should stand on their own.
     */
    BLOCK: "file",
    /**
     * Replaces the placeholder text in place, keeping its surrounding
     * paragraph. Use this when the patch content is inline runs that flow
     * within existing text.
     */
    INLINE: "paragraph",
    /**
     * @deprecated Renamed to {@link PatchType.BLOCK} for clarity — same value
     * and behavior. `DOCUMENT` will be removed in a future major version.
     */
    DOCUMENT: "file",
    /**
     * @deprecated Renamed to {@link PatchType.INLINE} for clarity — same value
     * and behavior. `PARAGRAPH` will be removed in a future major version.
     */
    PARAGRAPH: "paragraph",
} as const;

type InlinePatch = {
    readonly type: typeof PatchType.INLINE;
    readonly children: readonly ParagraphChild[];
};

type BlockPatch = {
    readonly type: typeof PatchType.BLOCK;
    readonly children: readonly FileChild[];
};

type IImageRelationshipAddition = {
    readonly key: string;
    readonly mediaDatas: readonly IMediaData[];
};

type IHyperlinkRelationshipAddition = {
    readonly key: string;
    readonly hyperlink: { readonly id: string; readonly link: string };
};

export type IPatch = InlinePatch | BlockPatch;

export type PatchDocumentOutputType = OutputType;

export type PatchDocumentOptions<T extends PatchDocumentOutputType = PatchDocumentOutputType> = {
    readonly outputType: T;
    readonly data: InputDataType;
    readonly patches: Readonly<Record<string, IPatch>>;
    readonly keepOriginalStyles?: boolean;
    /**
     * What to do when a configured patch names a placeholder that does not
     * appear anywhere in the template.
     *
     * - `"throw"` (default): raise {@link TokenNotFoundError}, preserving the
     *   historical behavior.
     * - `"skip"`: silently ignore patches whose token is absent, so a single
     *   patch map can target templates that only contain some of its tokens.
     */
    readonly onMissingToken?: "throw" | "skip";
    readonly placeholderDelimiters?: Readonly<{
        readonly start: string;
        readonly end: string;
    }>;
    readonly recursive?: boolean;
    readonly numbering?: INumberingOptions;
};

const imageReplacer = new ImageReplacer();
const numberingReplacer = new NumberingReplacer();
const formatter = new Formatter();

const PATCHABLE_ROOT_NAMES: ReadonlySet<string> = new Set([
    "w:document",
    "w:hdr",
    "w:ftr",
    "w:footnotes",
    "w:endnotes",
    "w:comments",
]);

export const patchDocument = async <T extends PatchDocumentOutputType = PatchDocumentOutputType>({
    outputType,
    data,
    patches,
    keepOriginalStyles,
    onMissingToken = "throw",
    placeholderDelimiters = { start: "{{", end: "}}" } as const,
    /**
     * Search for occurrences over patched document
     */
    recursive = true,
    numbering,
}: PatchDocumentOptions<T>): Promise<OutputByType[T]> => {
    if (!placeholderDelimiters.start.trim() || !placeholderDelimiters.end.trim()) {
        throw new Error("Both start and end delimiters must be non-empty strings.");
    }

    const zipContent = await loadZip(data);
    const patchEntries = Object.entries(patches).map(([key, patch]) => ({
        key,
        patch,
        text: `${placeholderDelimiters.start}${key}${placeholderDelimiters.end}`,
    }));

    // Keys of the parts that went through patching, i.e. candidates for
    // numbering placeholder resolution below.
    const patchedKeys = new Set<string>();

    // Patch keys whose token was found in at least one part; any patch missing
    // from this set at the end means its token is absent from the document.
    const foundTokens = new Set<string>();

    const map = new Map<string, Element>();

    const imageRelationshipAdditions: IImageRelationshipAddition[] = [];

    const hyperlinkRelationshipAdditions: IHyperlinkRelationshipAddition[] = [];
    let hasMedia = false;

    // New numbering ids must not collide with the template's existing ones,
    // so all generated ids start above the maxima found in numbering.xml.
    const existingNumberingText = await readZipText(zipContent, "word/numbering.xml");
    const existingNumberingJson =
        existingNumberingText === undefined ? undefined : toJson(existingNumberingText);
    const numberingIdOffsets = getMaxNumberingIds(existingNumberingJson);

    const media = new Media();
    const numberingRegistry = new Numbering(numbering ?? { config: [] }, numberingIdOffsets);
    const usedNumberingReferences = new Set<string>();
    const candidatePartKeys = xmlZipKeys(zipContent).filter(
        (key) => key.startsWith("word/") && !key.endsWith(".xml.rels"),
    );

    // Drawing and bookmark ids are package-wide. Scan text parts sequentially
    // before rendering so inserted content cannot collide with a later part,
    // without retaining all inflated parts at once.
    let renderIdOffsets = { drawing: 0, bookmark: 0 };
    for (const key of candidatePartKeys) {
        const text = await readZipText(zipContent, key);
        if (text !== undefined) {
            const partOffsets = getMaxRenderIds([text]);
            renderIdOffsets = {
                drawing: Math.max(renderIdOffsets.drawing, partOffsets.drawing),
                bookmark: Math.max(renderIdOffsets.bookmark, partOffsets.bookmark),
            };
        }
    }
    let drawingId = renderIdOffsets.drawing;
    let bookmarkId = renderIdOffsets.bookmark;
    const ids: IRenderIdService = {
        nextDrawingId: () => ++drawingId,
        nextBookmarkId: () => ++bookmarkId,
    };

    // Only XML can contain patch tokens. Inflate one XML part at a time and
    // leave every binary part in JSZip's lazy representation until output.
    for (const key of candidatePartKeys) {
        const text = await readZipText(zipContent, key);
        if (text === undefined) {
            continue;
        }

        const json = toJson(text);
        const root = json.elements?.find(
            (i) => i.type === "element" && PATCHABLE_ROOT_NAMES.has(i.name ?? ""),
        );
        if (root === undefined) {
            continue;
        }

        const context: IContext = {
            session: createRenderSession({
                media,
                numbering: {
                    resolve: (reference, instance) => {
                        usedNumberingReferences.add(reference);
                        return numberingRegistry.getConcreteNumberingId(reference, instance);
                    },
                },
                relationships: {
                    resolveHyperlink: (target) => {
                        const id = uniqueId();
                        hyperlinkRelationshipAdditions.push({
                            key,
                            hyperlink: { id, link: target },
                        });
                        return `rId${id}`;
                    },
                    // Existing image relationships are merged after all patch
                    // fragments are rendered. Keep a narrow placeholder until then.
                    resolveImage: (fileName) => `rId{${fileName}}`,
                },
                ids,
            }),
            stack: [],
        };
        // Index every configured token in one traversal. Paragraph patches
        // refresh only the paragraphs they mutate; document patches rebuild
        // after their reverse-order splice because sibling paths can shift.
        const tokenIndex = new TextLocationIndex(
            json,
            patchEntries.map(({ text: token }) => token),
        );
        let didPatchPart = false;

        for (const { key: patchKey, patch: patchValue, text: patchText } of patchEntries) {
            let previousOccurrenceCount = Number.POSITIVE_INFINITY;
            while (true) {
                const renderedParagraphs = tokenIndex.locations(patchText);
                if (renderedParagraphs.length === 0) {
                    break;
                }
                // Hyperlink relationships are only recorded when this pass
                // actually replaced something, so a pass that finds no
                // occurrence leaves no orphaned relationship entries.
                const pendingHyperlinkAdditions: IHyperlinkRelationshipAddition[] = [];
                const renderedPatch: IPatch =
                    patchValue.type === PatchType.BLOCK
                        ? patchValue
                        : {
                              type: PatchType.INLINE,
                              children: patchValue.children.map((element) => {
                                  if (!(element instanceof ExternalHyperlink)) {
                                      return element;
                                  }
                                  const concreteHyperlink = new ConcreteHyperlink(
                                      element.options.children,
                                      uniqueId(),
                                  );
                                  pendingHyperlinkAdditions.push({
                                      key,
                                      hyperlink: {
                                          id: concreteHyperlink.linkId,
                                          link: element.options.link,
                                      },
                                  });
                                  return concreteHyperlink;
                              }),
                          };
                const { didFindOccurrence, occurrenceCount } = replacer({
                    json,
                    patch: renderedPatch,
                    patchText,
                    context,
                    keepOriginalStyles,
                    renderedParagraphs,
                });
                if (didFindOccurrence) {
                    didPatchPart = true;
                    foundTokens.add(patchKey);

                    hyperlinkRelationshipAdditions.push(...pendingHyperlinkAdditions);
                }
                if (patchValue.type === PatchType.BLOCK) {
                    tokenIndex.rebuild();
                } else {
                    tokenIndex.refresh(
                        renderedParagraphs.map(({ pathToParagraph }) => pathToParagraph),
                    );
                }
                if (!recursive || !didFindOccurrence) {
                    break;
                }
                // Replacing occurrences must reduce their count; a stable
                // or growing count means the patch content re-introduces
                // its own placeholder and the loop would never terminate.
                if (occurrenceCount >= previousOccurrenceCount) {
                    throw new Error(
                        `Recursive patch "${patchKey}" does not converge: its content contains its own placeholder "${patchText}".`,
                    );
                }
                previousOccurrenceCount = occurrenceCount;
            }
        }

        if (!didPatchPart) {
            continue;
        }

        // Patched-in elements may use namespaces the part never declared.
        root.attributes = root.attributes ?? {};
        for (const ns of ["mc", "wp", "r", "w15", "m"] as const) {
            root.attributes[`xmlns:${ns}`] = DocumentAttributeNamespaces[ns];
        }
        root.attributes["mc:Ignorable"] = `${root.attributes["mc:Ignorable"] ?? ""} w15`.trim();

        patchedKeys.add(key);

        const mediaDatas = imageReplacer.getMediaData(JSON.stringify(json), media);
        if (mediaDatas.length > 0) {
            hasMedia = true;
            imageRelationshipAdditions.push({ key, mediaDatas });
        }

        map.set(key, json);
    }

    if (onMissingToken === "throw") {
        const missingToken = Object.keys(patches).find((patchKey) => !foundTokens.has(patchKey));
        if (missingToken !== undefined) {
            throw new TokenNotFoundError(missingToken);
        }
    }

    const loadXmlPart = async (key: string): Promise<Element | undefined> => {
        const loaded = map.get(key);
        if (loaded !== undefined) {
            return loaded;
        }
        const text = await readZipText(zipContent, key);
        if (text === undefined) {
            return undefined;
        }
        const json = toJson(text);
        map.set(key, json);
        return json;
    };

    for (const { key, mediaDatas } of imageRelationshipAdditions) {
        const relationshipKey = `word/_rels/${key.split("/").pop()}.rels`;

        const relationshipsJson = (await loadXmlPart(relationshipKey)) ?? createRelationshipFile();
        map.set(relationshipKey, relationshipsJson);

        const index = getNextRelationshipIndex(relationshipsJson);
        const newJson = imageReplacer.replace(
            JSON.stringify(map.get(key)),
            mediaDatas,
            mediaDatas.map((_, i) => index + i),
        );

        map.set(key, JSON.parse(newJson) as Element);

        mediaDatas.forEach(({ fileName }, i) => {
            appendRelationship(
                relationshipsJson,
                index + i,
                "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
                `media/${fileName}`,
            );
        });
    }

    for (const { key, hyperlink } of hyperlinkRelationshipAdditions) {
        const relationshipKey = `word/_rels/${key.split("/").pop()}.rels`;

        const relationshipsJson = (await loadXmlPart(relationshipKey)) ?? createRelationshipFile();
        map.set(relationshipKey, relationshipsJson);

        appendRelationship(
            relationshipsJson,
            hyperlink.id,
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
            hyperlink.link,
            TargetModeType.EXTERNAL,
        );
    }

    if (hasMedia) {
        const contentTypesJson = await loadXmlPart("[Content_Types].xml");

        if (!contentTypesJson) {
            throw new Error("Could not find content types file");
        }

        appendContentType(contentTypesJson, "image/png", "png");
        appendContentType(contentTypesJson, "image/jpeg", "jpeg");
        appendContentType(contentTypesJson, "image/jpeg", "jpg");
        appendContentType(contentTypesJson, "image/bmp", "bmp");
        appendContentType(contentTypesJson, "image/gif", "gif");
        appendContentType(contentTypesJson, "image/svg+xml", "svg");
    }

    // ParagraphProperties registers concrete numbering instances while patch
    // content is formatted, but numbering placeholders can also survive in
    // parts from earlier patch runs — recreate them from the placeholders
    // found in the patched parts (idempotent for already-registered ones).
    const numberingReferences = (numbering?.config ?? []).map((config) => config.reference);
    if (numberingReferences.length > 0) {
        for (const key of patchedKeys) {
            const json = map.get(key);
            if (!json) {
                continue;
            }
            // Stringify each part once; doing it per reference re-serializes
            // multi-megabyte parts for every configured numbering.
            const stringifiedJson = JSON.stringify(json);
            for (const reference of numberingReferences) {
                const escapedReference = reference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const placeholderPattern = new RegExp(`\\{${escapedReference}-(\\d+)\\}`, "g");
                for (const match of stringifiedJson.matchAll(placeholderPattern)) {
                    usedNumberingReferences.add(reference);
                    numberingRegistry.createConcreteNumberingInstance(
                        reference,
                        parseInt(match[1], 10),
                    );
                }
            }
        }
    }

    // The built-in "default-bullet-numbering" is only emitted when a patched
    // part references it (i.e. a patch contains a bullet paragraph);
    // unconditionally merging it into an existing template would add entries
    // nothing references.
    const newConcreteNumberings = numberingRegistry.ConcreteNumbering.filter((concrete) =>
        usedNumberingReferences.has(concrete.reference),
    );
    const newAbstractNumberings = [...usedNumberingReferences]
        .map((reference) => numberingRegistry.getAbstractNumbering(reference))
        .filter(
            (abstractNumbering): abstractNumbering is AbstractNumbering =>
                abstractNumbering !== undefined,
        );

    if (newConcreteNumberings.length > 0) {
        for (const key of patchedKeys) {
            const json = map.get(key);
            if (!json) {
                continue;
            }
            const stringifiedJson = JSON.stringify(json);
            const replacedJson = numberingReplacer.replace(stringifiedJson, newConcreteNumberings);
            if (replacedJson !== stringifiedJson) {
                map.set(key, JSON.parse(replacedJson) as Element);
            }
        }
    }

    // A numbering reference used by a patch but missing from options.numbering
    // leaves its placeholder as the w:numId value — an invalid document that
    // Word reports as corrupt. Fail loudly instead.
    const unresolvedNumberingPlaceholders = new Set<string>();
    for (const key of patchedKeys) {
        const json = map.get(key);
        if (json) {
            collectUnresolvedNumIdPlaceholders(json, unresolvedNumberingPlaceholders);
        }
    }
    if (unresolvedNumberingPlaceholders.size > 0) {
        throw new Error(
            `Could not resolve numbering reference(s) ${[...unresolvedNumberingPlaceholders].join(
                ", ",
            )}. Every numbering reference used by a patch must be configured via the "numbering" option of patchDocument.`,
        );
    }

    if (newConcreteNumberings.length > 0 || newAbstractNumberings.length > 0) {
        const numberingContext: IContext = {
            session: createRenderSession({
                numbering: {
                    resolve: (reference, instance) =>
                        numberingRegistry.getConcreteNumberingId(reference, instance),
                },
                ids,
            }),
            stack: [],
        };
        if (existingNumberingJson) {
            map.set("word/numbering.xml", existingNumberingJson);
            mergeNumberingPart(
                existingNumberingJson,
                newAbstractNumberings,
                newConcreteNumberings,
                numberingContext,
            );
        } else {
            const numberingXml = xml(
                formatter.format(numberingRegistry as XmlComponent, numberingContext),
                {
                    declaration: {
                        standalone: "yes",
                        encoding: "UTF-8",
                    },
                },
            );

            map.set("word/numbering.xml", toJson(numberingXml));

            const contentTypesJson = await loadXmlPart("[Content_Types].xml");
            if (!contentTypesJson) {
                throw new Error("Could not find content types file");
            }
            appendOverrideContentType(
                contentTypesJson,
                "/word/numbering.xml",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
            );

            const relationshipsJson =
                (await loadXmlPart("word/_rels/document.xml.rels")) ?? createRelationshipFile();
            map.set("word/_rels/document.xml.rels", relationshipsJson);

            const hasNumberingRelationship = getFirstLevelElements(
                relationshipsJson,
                "Relationships",
            ).some(
                (el) =>
                    el.attributes?.Type ===
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering",
            );
            if (!hasNumberingRelationship) {
                appendRelationship(
                    relationshipsJson,
                    getNextRelationshipIndex(relationshipsJson),
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering",
                    "numbering.xml",
                );
            }
        }
    }

    for (const [key, value] of map) {
        const output = toXml(value);

        zipContent.file(key, output);
    }

    for (const { data: stream, fileName } of media.Array) {
        zipContent.file(
            `word/media/${fileName}`,
            stream instanceof ArrayBuffer ? new Uint8Array(stream) : stream,
        );
    }

    return zipContent.generateAsync({
        type: outputType,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        compression: "DEFLATE",
    });
};

const toXml = (jsonObj: Element): string => {
    const output = js2xml(jsonObj, {
        attributeValueFn: (str) =>
            String(str)
                .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;"), // cspell:words apos
    });
    return output;
};

const collectUnresolvedNumIdPlaceholders = (element: Element, found: Set<string>): void => {
    if (element.name === "w:numId") {
        const value = element.attributes?.["w:val"];
        if (typeof value === "string" && /^\{.+-\d+\}$/.test(value)) {
            found.add(value);
        }
    }
    for (const child of element.elements ?? []) {
        collectUnresolvedNumIdPlaceholders(child, found);
    }
};

const getMaxNumberingIds = (
    numberingJson: Element | undefined,
): { readonly abstractNum: number; readonly num: number } => {
    const rootElements =
        numberingJson?.elements?.find((el) => el.name === "w:numbering")?.elements ?? [];

    let maxAbstractNumId = 0;
    let maxNumId = 0;
    for (const element of rootElements) {
        if (element.type !== "element") {
            continue;
        }
        if (element.name === "w:abstractNum") {
            maxAbstractNumId = Math.max(
                maxAbstractNumId,
                parseInt(String(element.attributes?.["w:abstractNumId"] ?? ""), 10) || 0,
            );
        } else if (element.name === "w:num") {
            maxNumId = Math.max(
                maxNumId,
                parseInt(String(element.attributes?.["w:numId"] ?? ""), 10) || 0,
            );
        }
    }

    return { abstractNum: maxAbstractNumId, num: maxNumId };
};

const getMaxRenderIds = (
    xmlParts: readonly string[],
): { readonly drawing: number; readonly bookmark: number } => {
    let drawing = 0;
    let bookmark = 0;

    for (const xmlPart of xmlParts) {
        for (const match of xmlPart.matchAll(/<wp:docPr\b[^>]*\bid=["'](\d+)["']/g)) {
            drawing = Math.max(drawing, Number(match[1]));
        }
        for (const match of xmlPart.matchAll(/<w:bookmarkStart\b[^>]*\bw:id=["'](\d+)["']/g)) {
            bookmark = Math.max(bookmark, Number(match[1]));
        }
    }

    return { drawing, bookmark };
};

const mergeNumberingPart = (
    numberingJson: Element,
    abstractNumberings: readonly AbstractNumbering[],
    concreteNumberings: readonly XmlComponent[],
    context: IContext,
): void => {
    const rootElement = numberingJson.elements?.find((el) => el.name === "w:numbering");

    if (!rootElement) {
        throw new Error("Could not find w:numbering element in existing numbering file");
    }

    // The new w:abstractNum elements carry a w15 attribute, which the
    // template's numbering part may not declare.

    rootElement.attributes = rootElement.attributes ?? {};
    for (const ns of ["mc", "w15"] as const) {
        rootElement.attributes[`xmlns:${ns}`] =
            rootElement.attributes[`xmlns:${ns}`] ?? DocumentAttributeNamespaces[ns];
    }
    const ignorable = String(rootElement.attributes["mc:Ignorable"] ?? "");
    if (!ignorable.split(/\s+/).includes("w15")) {
        rootElement.attributes["mc:Ignorable"] = `${ignorable} w15`.trim();
    }
    rootElement.elements = rootElement.elements ?? [];

    const rootChildren = rootElement.elements;

    const toElement = (component: XmlComponent): Element =>
        toJson(xml(formatter.format(component, context))).elements![0];

    // CT_Numbering is a sequence: w:abstractNum entries must precede w:num
    // entries, and w:numIdMacAtCleanup must stay last.
    const lastAbstractNumIndex = rootChildren.reduce(
        (acc, el, index) => (el.name === "w:abstractNum" ? index : acc),
        -1,
    );
    const firstNumIndex = rootChildren.findIndex((el) => el.name === "w:num");
    const abstractNumInsertIndex =
        lastAbstractNumIndex >= 0
            ? lastAbstractNumIndex + 1
            : firstNumIndex >= 0
              ? firstNumIndex
              : rootChildren.length;

    rootChildren.splice(abstractNumInsertIndex, 0, ...abstractNumberings.map(toElement));

    const numIdMacAtCleanupIndex = rootChildren.findIndex(
        (el) => el.name === "w:numIdMacAtCleanup",
    );
    const numInsertIndex =
        numIdMacAtCleanupIndex >= 0 ? numIdMacAtCleanupIndex : rootChildren.length;

    rootChildren.splice(numInsertIndex, 0, ...concreteNumberings.map(toElement));
};

const createRelationshipFile = (): Element => ({
    declaration: {
        attributes: {
            version: "1.0",
            encoding: "UTF-8",
            standalone: "yes",
        },
    },
    elements: [
        {
            type: "element",
            name: "Relationships",
            attributes: {
                xmlns: "http://schemas.openxmlformats.org/package/2006/relationships",
            },
            elements: [],
        },
    ],
});
