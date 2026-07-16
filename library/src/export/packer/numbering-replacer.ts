import { ConcreteNumbering } from "@file/numbering";

// cspell:ignore apos

export class NumberingReplacer {
    public replace(xmlData: string, concreteNumberings: readonly ConcreteNumbering[]): string {
        const idsByPlaceholder = new Map(
            concreteNumberings.map((numbering) => [
                `{${numbering.reference}-${numbering.instance}}`,
                numbering.numId.toString(),
            ]),
        );

        const jsonResult = replaceJsonNumberingReferences(xmlData, idsByPlaceholder);
        const result =
            jsonResult ??
            xmlData.replace(/<w:numId\b[^>]*>/g, (tag) =>
                tag.replace(/\bw:val=(['"])(.*?)\1/, (attribute, quote: string, value: string) => {
                    const replacement = idsByPlaceholder.get(decodeXmlAttribute(value));
                    return replacement === undefined
                        ? attribute
                        : `w:val=${quote}${replacement}${quote}`;
                }),
            );

        const unresolved = collectUnresolvedNumberingReferences(result);
        if (unresolved.length > 0) {
            throw new Error(
                `Could not resolve numbering reference(s) ${unresolved.join(", ")}. Every numbering reference must be configured before serialization.`,
            );
        }

        return result;
    }
}

const PLACEHOLDER_PATTERN = /^\{.+-\d+\}$/;

const replaceJsonNumberingReferences = (
    data: string,
    idsByPlaceholder: ReadonlyMap<string, string>,
): string | undefined => {
    if (!data.trimStart().startsWith("{")) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(data) as unknown;
        visitJsonElements(parsed, (element) => {
            if (element.name !== "w:numId" || !element.attributes) {
                return;
            }
            const value = element.attributes["w:val"];
            if (typeof value !== "string") {
                return;
            }
            const replacement = idsByPlaceholder.get(value);
            if (replacement !== undefined) {
                element.attributes["w:val"] = replacement;
            }
        });
        return JSON.stringify(parsed);
    } catch {
        return undefined;
    }
};

const collectUnresolvedNumberingReferences = (data: string): readonly string[] => {
    const found = new Set<string>();
    if (data.trimStart().startsWith("{")) {
        try {
            const parsed = JSON.parse(data) as unknown;
            visitJsonElements(parsed, (element) => {
                const value =
                    element.name === "w:numId" ? element.attributes?.["w:val"] : undefined;
                if (typeof value === "string" && PLACEHOLDER_PATTERN.test(value)) {
                    found.add(value);
                }
            });
            return [...found];
        } catch {
            // Fall through to the XML scanner for malformed/non-JSON input.
        }
    }

    for (const tag of data.match(/<w:numId\b[^>]*>/g) ?? []) {
        const value = tag.match(/\bw:val=(['"])(.*?)\1/)?.[2];
        const decoded = value === undefined ? undefined : decodeXmlAttribute(value);
        if (decoded !== undefined && PLACEHOLDER_PATTERN.test(decoded)) {
            found.add(decoded);
        }
    }
    return [...found];
};

type JsonElement = {
    name?: string;
    attributes?: Record<string, unknown>;
    elements?: unknown[];
};

const visitJsonElements = (value: unknown, visit: (element: JsonElement) => void): void => {
    if (typeof value !== "object" || value === null) {
        return;
    }
    const element = value as JsonElement;
    visit(element);
    for (const child of element.elements ?? []) {
        visitJsonElements(child, visit);
    }
};

const decodeXmlAttribute = (value: string): string =>
    value
        .replaceAll("&quot;", '"')
        .replaceAll("&apos;", "'")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&amp;", "&");
