import { InputDataType, loadZip } from "./input-normalizer";
import { traverse } from "./traverser";
import { readZipText, toJson, xmlZipKeys } from "./util";

export type ListPlaceholdersOptions = {
    readonly data: InputDataType;
    readonly placeholderDelimiters?: Readonly<{
        readonly start: string;
        readonly end: string;
    }>;
};

/**
 * Returns the names of every placeholder token present in a template, e.g.
 * `["clientName", "date"]` for a document containing `{{clientName}}` and
 * `{{date}}`. Use it to discover which slots a template exposes.
 */
export const listPlaceholders = async ({
    data,
    placeholderDelimiters = { start: "{{", end: "}}" } as const,
}: ListPlaceholdersOptions): Promise<readonly string[]> => {
    const zipContent = await loadZip(data);
    const patches = new Set<string>();

    for (const key of xmlZipKeys(zipContent)) {
        if (!key.startsWith("word/") || key.endsWith(".xml.rels")) {
            continue;
        }
        // Keep inflation sequential: detector output is tiny, while templates
        // can contain many large unrelated binary parts.

        const text = await readZipText(zipContent, key);
        if (text === undefined) {
            continue;
        }

        traverse(toJson(text)).forEach((p) =>
            findPatchKeys(p.text, placeholderDelimiters).forEach((patch) => patches.add(patch)),
        );
    }

    return Array.from(patches);
};

/**
 * @deprecated Renamed to {@link listPlaceholders} — it returns the placeholder
 * names present in a template, not "patches". Same behavior; `patchDetector`
 * will be removed in a future major version.
 */
export const patchDetector = listPlaceholders;

/**
 * @deprecated Renamed to {@link ListPlaceholdersOptions}. Same shape;
 * `PatchDetectorOptions` will be removed in a future major version.
 */
export type PatchDetectorOptions = ListPlaceholdersOptions;

const findPatchKeys = (
    text: string,
    delimiters: { readonly start: string; readonly end: string },
): readonly string[] => {
    const { start, end } = delimiters;
    const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<=${escapedStart}).+?(?=${escapedEnd})`, "gs");
    return text.match(pattern) ?? [];
};
