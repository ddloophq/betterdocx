import JSZip from "jszip";
import { Element, xml2js } from "xml-js";

export type PackageValidationIssue = {
    readonly code: string;
    readonly message: string;
    readonly part?: string;
};

type Relationship = {
    readonly id: string;
    readonly target: string;
    readonly external: boolean;
};

const decoder = new TextDecoder();
const localName = (name: string | undefined): string => name?.split(":").at(-1) ?? "";

const childElements = (element: Element): readonly Element[] =>
    element.elements?.filter((child) => child.type === "element") ?? [];

const walk = (element: Element, visitor: (element: Element) => void): void => {
    if (element.type === "element") {
        visitor(element);
    }
    for (const child of element.elements ?? []) {
        walk(child, visitor);
    }
};

const attribute = (element: Element, name: string): string | undefined => {
    const entry = Object.entries(element.attributes ?? {}).find(
        ([key]) => key === name || localName(key) === localName(name),
    );
    return typeof entry?.[1] === "string" || typeof entry?.[1] === "number"
        ? String(entry[1])
        : undefined;
};

const parseXml = (
    part: string,
    data: string,
    issues: PackageValidationIssue[],
): Element | undefined => {
    try {
        return xml2js(data, { compact: false }) as Element;
    } catch (error) {
        issues.push({
            code: "INVALID_XML",
            part,
            message: `XML could not be parsed: ${error instanceof Error ? error.message : String(error)}`,
        });
        return undefined;
    }
};

const uint16 = (bytes: Uint8Array, offset: number): number =>
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(offset, true);
const uint32 = (bytes: Uint8Array, offset: number): number =>
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);

/** Reads central-directory names before JSZip collapses duplicate entries. */
const centralDirectoryNames = (bytes: Uint8Array): readonly string[] => {
    const minimumEndRecordSize = 22;
    const maximumCommentSize = 0xffff;
    let endOfCentralDirectory = -1;
    for (
        let offset = bytes.length - minimumEndRecordSize;
        offset >= Math.max(0, bytes.length - minimumEndRecordSize - maximumCommentSize);
        offset--
    ) {
        if (uint32(bytes, offset) === 0x06054b50) {
            endOfCentralDirectory = offset;
            break;
        }
    }
    if (endOfCentralDirectory < 0) {
        return [];
    }

    const entryCount = uint16(bytes, endOfCentralDirectory + 10);
    let offset = uint32(bytes, endOfCentralDirectory + 16);
    if (entryCount === 0xffff || offset === 0xffffffff) {
        return [];
    }

    const names: string[] = [];
    for (let index = 0; index < entryCount; index++) {
        if (offset + 46 > bytes.length || uint32(bytes, offset) !== 0x02014b50) {
            return [];
        }
        const nameLength = uint16(bytes, offset + 28);
        const extraLength = uint16(bytes, offset + 30);
        const commentLength = uint16(bytes, offset + 32);
        const nameStart = offset + 46;

        names.push(decoder.decode(bytes.slice(nameStart, nameStart + nameLength)));
        offset = nameStart + nameLength + extraLength + commentLength;
    }
    return names;
};

const canonicalPartName = (name: string): string | undefined => {
    if (name.startsWith("/") || name.includes("\\")) {
        return undefined;
    }
    const parts = name.split("/");
    if (parts.some((part) => part === "" || part === "." || part === "..")) {
        return undefined;
    }
    return parts.join("/");
};

const resolveRelationshipTarget = (sourcePart: string, target: string): string | undefined => {
    const withoutQuery = target.split(/[?#]/, 1)[0];
    let decoded: string;
    try {
        decoded = decodeURIComponent(withoutQuery);
    } catch {
        return undefined;
    }
    const base = decoded.startsWith("/") ? [] : sourcePart.split("/").slice(0, -1);
    const output = [...base];
    for (const segment of decoded.replace(/^\/+/, "").split("/")) {
        if (segment === "" || segment === ".") {
            continue;
        }
        if (segment === "..") {
            if (output.length === 0) {
                return undefined;
            }
            output.pop();
        } else {
            output.push(segment);
        }
    }
    return output.join("/");
};

const sourcePartForRelationships = (relationshipsPart: string): string | undefined => {
    if (relationshipsPart === "_rels/.rels") {
        return "";
    }
    const match = /^(.*\/)_rels\/([^/]+)\.rels$/.exec(relationshipsPart);
    return match ? `${match[1]}${match[2]}` : undefined;
};

const relationshipsPartForSource = (sourcePart: string): string => {
    const slash = sourcePart.lastIndexOf("/");
    const directory = slash < 0 ? "" : sourcePart.slice(0, slash + 1);
    const file = sourcePart.slice(slash + 1);
    return `${directory}_rels/${file}.rels`;
};

const validateArchiveNames = (names: readonly string[], issues: PackageValidationIssue[]): void => {
    const exact = new Set<string>();
    const folded = new Map<string, string>();
    for (const name of names.filter((entry) => !entry.endsWith("/"))) {
        if (exact.has(name)) {
            issues.push({
                code: "DUPLICATE_PART",
                part: name,
                message: "ZIP contains this part more than once.",
            });
        }
        exact.add(name);

        const canonical = canonicalPartName(name);
        if (!canonical) {
            issues.push({
                code: "UNSAFE_PART_PATH",
                part: name,
                message: "ZIP part path is not package-relative and canonical.",
            });
            continue;
        }
        const caseFolded = canonical.toLocaleLowerCase("en-US");
        const previous = folded.get(caseFolded);
        if (previous && previous !== canonical) {
            issues.push({
                code: "CASE_COLLIDING_PART",
                part: canonical,
                message: `Part collides case-insensitively with '${previous}'.`,
            });
        } else {
            folded.set(caseFolded, canonical);
        }
    }
};

const validateContentTypes = (
    xml: Element | undefined,
    partNames: ReadonlySet<string>,
    issues: PackageValidationIssue[],
): void => {
    if (!xml) {
        return;
    }
    const defaults = new Set<string>();
    const overrides = new Set<string>();
    walk(xml, (element) => {
        if (localName(element.name) === "Default") {
            const extension = attribute(element, "Extension")?.toLocaleLowerCase("en-US");
            if (extension) {
                if (defaults.has(extension)) {
                    issues.push({
                        code: "DUPLICATE_CONTENT_TYPE",
                        part: "[Content_Types].xml",
                        message: `Duplicate default for '.${extension}'.`,
                    });
                }
                defaults.add(extension);
            }
        }
        if (localName(element.name) === "Override") {
            const target = attribute(element, "PartName")?.replace(/^\//, "");
            if (target) {
                if (overrides.has(target)) {
                    issues.push({
                        code: "DUPLICATE_CONTENT_TYPE",
                        part: "[Content_Types].xml",
                        message: `Duplicate override for '${target}'.`,
                    });
                }
                overrides.add(target);
                if (!partNames.has(target)) {
                    issues.push({
                        code: "CONTENT_TYPE_TARGET_MISSING",
                        part: "[Content_Types].xml",
                        message: `Override targets missing part '${target}'.`,
                    });
                }
            }
        }
    });

    for (const part of partNames) {
        if (part === "[Content_Types].xml") {
            continue;
        }
        const dot = part.lastIndexOf(".");
        const extension = dot < 0 ? "" : part.slice(dot + 1).toLocaleLowerCase("en-US");
        if (!overrides.has(part) && !defaults.has(extension)) {
            issues.push({
                code: "CONTENT_TYPE_MISSING",
                part,
                message: "No content type default or override covers this part.",
            });
        }
    }
};

const collectRelationships = (
    xmlParts: ReadonlyMap<string, Element>,
    partNames: ReadonlySet<string>,
    issues: PackageValidationIssue[],
): ReadonlyMap<string, ReadonlyMap<string, Relationship>> => {
    const bySource = new Map<string, ReadonlyMap<string, Relationship>>();
    for (const [part, xml] of xmlParts) {
        if (!part.endsWith(".rels")) {
            continue;
        }
        const source = sourcePartForRelationships(part);
        if (source === undefined) {
            issues.push({
                code: "INVALID_RELATIONSHIP_PATH",
                part,
                message: "Relationship part is not stored beside a _rels directory.",
            });
            continue;
        }
        if (source && !partNames.has(source)) {
            issues.push({
                code: "RELATIONSHIP_SOURCE_MISSING",
                part,
                message: `Relationship source '${source}' does not exist.`,
            });
        }
        const relationships = new Map<string, Relationship>();
        walk(xml, (element) => {
            if (localName(element.name) !== "Relationship") {
                return;
            }
            const id = attribute(element, "Id");
            const target = attribute(element, "Target");
            if (!id || !target) {
                return;
            }
            if (relationships.has(id)) {
                issues.push({
                    code: "DUPLICATE_RELATIONSHIP_ID",
                    part,
                    message: `Relationship id '${id}' is duplicated.`,
                });
                return;
            }
            const external =
                attribute(element, "TargetMode")?.toLocaleLowerCase("en-US") === "external";
            relationships.set(id, { id, target, external });
            if (!external) {
                const resolved = resolveRelationshipTarget(source, target);
                if (!resolved) {
                    issues.push({
                        code: "UNSAFE_RELATIONSHIP_TARGET",
                        part,
                        message: `Relationship '${id}' has invalid target '${target}'.`,
                    });
                } else if (!partNames.has(resolved)) {
                    issues.push({
                        code: "RELATIONSHIP_TARGET_MISSING",
                        part,
                        message: `Relationship '${id}' targets missing part '${resolved}'.`,
                    });
                }
            }
        });
        bySource.set(source, relationships);
    }
    return bySource;
};

const validateRelationshipReferences = (
    xmlParts: ReadonlyMap<string, Element>,
    relationshipsBySource: ReadonlyMap<string, ReadonlyMap<string, Relationship>>,
    issues: PackageValidationIssue[],
): void => {
    for (const [part, xml] of xmlParts) {
        if (part.endsWith(".rels")) {
            continue;
        }
        const relationshipPrefixes = new Set<string>();
        walk(xml, (element) => {
            for (const [name, rawValue] of Object.entries(element.attributes ?? {})) {
                if (
                    name.startsWith("xmlns:") &&
                    rawValue ===
                        "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                ) {
                    relationshipPrefixes.add(name.slice("xmlns:".length));
                }
            }
        });
        walk(xml, (element) => {
            for (const [name, rawValue] of Object.entries(element.attributes ?? {})) {
                const separator = name.indexOf(":");
                const prefix = separator < 0 ? "" : name.slice(0, separator);
                if (
                    !relationshipPrefixes.has(prefix) ||
                    !["id", "embed", "link"].includes(localName(name))
                ) {
                    continue;
                }
                const id = String(rawValue);
                if (!relationshipsBySource.get(part)?.has(id)) {
                    issues.push({
                        code: "RELATIONSHIP_REFERENCE_MISSING",
                        part,
                        message: `Attribute '${name}' references unknown relationship '${id}' in '${relationshipsPartForSource(part)}'.`,
                    });
                }
            }
        });
    }
};

const validateNumbering = (
    xmlParts: ReadonlyMap<string, Element>,
    issues: PackageValidationIssue[],
): void => {
    const definitions = new Set<string>();
    const numbering = xmlParts.get("word/numbering.xml");
    if (numbering) {
        walk(numbering, (element) => {
            if (localName(element.name) === "num") {
                const id = attribute(element, "w:numId");
                if (id) {
                    definitions.add(id);
                }
            }
        });
    }
    for (const [part, xml] of xmlParts) {
        if (!part.startsWith("word/") || part.endsWith(".rels")) {
            continue;
        }
        walk(xml, (element) => {
            if (localName(element.name) !== "numId") {
                return;
            }
            const id = attribute(element, "w:val");
            if (!id || !/^\d+$/.test(id)) {
                issues.push({
                    code: "INVALID_NUMBERING_ID",
                    part,
                    message: `Numbering reference '${id ?? ""}' is not a non-negative integer.`,
                });
            } else if (id !== "0" && !definitions.has(id)) {
                issues.push({
                    code: "NUMBERING_ID_MISSING",
                    part,
                    message: `Numbering reference '${id}' has no w:num definition.`,
                });
            }
        });
    }
};

const validateBookmarksAndCells = (
    xmlParts: ReadonlyMap<string, Element>,
    issues: PackageValidationIssue[],
): void => {
    for (const [part, xml] of xmlParts) {
        if (!part.startsWith("word/") || part.endsWith(".rels")) {
            continue;
        }
        const starts = new Map<string, number>();
        const ends = new Map<string, number>();
        walk(xml, (element) => {
            const name = localName(element.name);
            if (name === "bookmarkStart" || name === "bookmarkEnd") {
                const id = attribute(element, "w:id");
                if (!id || !/^\d+$/.test(id)) {
                    issues.push({
                        code: "INVALID_BOOKMARK_ID",
                        part,
                        message: `${name} id '${id ?? ""}' is not a non-negative integer.`,
                    });
                } else {
                    const collection = name === "bookmarkStart" ? starts : ends;
                    collection.set(id, (collection.get(id) ?? 0) + 1);
                }
            }
            if (name === "tc") {
                const children = childElements(element);
                if (localName(children.at(-1)?.name) !== "p") {
                    issues.push({
                        code: "TABLE_CELL_TERMINAL_PARAGRAPH",
                        part,
                        message: "A w:tc does not end with a w:p element.",
                    });
                }
            }
        });
        for (const [id, count] of starts) {
            if (count !== 1) {
                issues.push({
                    code: "DUPLICATE_BOOKMARK_ID",
                    part,
                    message: `Bookmark start id '${id}' occurs ${count} times.`,
                });
            }
            if (ends.get(id) !== 1) {
                issues.push({
                    code: "UNMATCHED_BOOKMARK",
                    part,
                    message: `Bookmark start id '${id}' does not have exactly one matching end.`,
                });
            }
        }
        for (const [id, count] of ends) {
            if (count !== 1 || !starts.has(id)) {
                issues.push({
                    code: "UNMATCHED_BOOKMARK",
                    part,
                    message: `Bookmark end id '${id}' does not have exactly one matching start.`,
                });
            }
        }
    }
};

export const validateDocxPackage = async (
    input: Uint8Array | ArrayBuffer,
): Promise<readonly PackageValidationIssue[]> => {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    const issues: PackageValidationIssue[] = [];
    validateArchiveNames(centralDirectoryNames(bytes), issues);

    const zip = await JSZip.loadAsync(bytes);
    const partNames = new Set(
        Object.entries(zip.files)
            .filter(([, entry]) => !entry.dir)
            .map(([name]) => name),
    );
    if (!partNames.has("[Content_Types].xml")) {
        issues.push({
            code: "CONTENT_TYPES_MISSING",
            message: "Package does not contain [Content_Types].xml.",
        });
    }

    const xmlParts = new Map<string, Element>();
    await Promise.all(
        [...partNames]
            .filter((part) => part.endsWith(".xml") || part.endsWith(".rels"))
            .map(async (part) => {
                const text = await zip.file(part)?.async("text");
                if (text === undefined) {
                    return;
                }
                const parsed = parseXml(part, text, issues);
                if (parsed) {
                    xmlParts.set(part, parsed);
                }
            }),
    );

    validateContentTypes(xmlParts.get("[Content_Types].xml"), partNames, issues);
    const relationships = collectRelationships(xmlParts, partNames, issues);
    validateRelationshipReferences(xmlParts, relationships, issues);
    validateNumbering(xmlParts, issues);
    validateBookmarksAndCells(xmlParts, issues);
    return issues;
};

export const assertValidDocxPackage = async (input: Uint8Array | ArrayBuffer): Promise<void> => {
    const issues = await validateDocxPackage(input);
    if (issues.length > 0) {
        throw new Error(
            `DOCX package validation failed:\n${issues
                .map(
                    (issue) =>
                        `- ${issue.code}${issue.part ? ` (${issue.part})` : ""}: ${issue.message}`,
                )
                .join("\n")}`,
        );
    }
};
