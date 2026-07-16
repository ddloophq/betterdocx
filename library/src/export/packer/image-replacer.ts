import { IMediaData, Media } from "@file/media";

export class ImageReplacer {
    public replace(
        xmlData: string,
        mediaData: readonly IMediaData[],
        relationshipIds: readonly number[],
    ): string {
        const relationshipIdsByReference = new Map(
            mediaData.map((image, i) => [
                `rId{${image.fileName}}`,
                `rId${relationshipIds[i].toString()}`,
            ]),
        );

        const jsonResult = transformJsonRelationshipAttributes(xmlData, (value) =>
            relationshipIdsByReference.get(value),
        );
        return (
            jsonResult ??
            xmlData.replace(
                /\br:embed=(['"])(.*?)\1/g,
                (attribute, quote: string, value: string) => {
                    const replacement = relationshipIdsByReference.get(value);
                    return replacement === undefined
                        ? attribute
                        : `r:embed=${quote}${replacement}${quote}`;
                },
            )
        );
    }

    public getMediaData(xmlData: string, media: Media): readonly IMediaData[] {
        const referencedFileNames = new Set<string>();
        const jsonResult = transformJsonRelationshipAttributes(xmlData, (value) => {
            const fileName = getPlaceholderFileName(value);
            if (fileName !== undefined) {
                referencedFileNames.add(fileName);
            }
            return undefined;
        });
        if (jsonResult === undefined) {
            for (const match of xmlData.matchAll(/\br:embed=(['"])(rId\{([^{}]+)\})\1/g)) {
                referencedFileNames.add(match[3]);
            }
        }

        return media.Array.filter((image) => referencedFileNames.has(image.fileName));
    }
}

const getPlaceholderFileName = (value: string): string | undefined =>
    value.startsWith("rId{") && value.endsWith("}") ? value.slice(4, -1) : undefined;

const transformJsonRelationshipAttributes = (
    data: string,
    transform: (value: string) => string | undefined,
): string | undefined => {
    if (!data.trimStart().startsWith("{")) {
        return undefined;
    }
    try {
        const parsed = JSON.parse(data) as unknown;
        visitJsonElements(parsed, (element) => {
            const value = element.attributes?.["r:embed"];
            if (typeof value !== "string") {
                return;
            }
            const replacement = transform(value);
            if (replacement !== undefined) {
                element.attributes!["r:embed"] = replacement;
            }
        });
        return JSON.stringify(parsed);
    } catch {
        return undefined;
    }
};

type JsonElement = {
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
