import { IViewWrapper } from "@file/document-wrapper";
import { Relationships } from "@file/relationships";
import { XmlComponent } from "@file/xml-components";
import { uniqueId } from "@util/convenience-functions";

import { FontOptions, createFontTable } from "./font-table";

export type FontOptionsWithKey = FontOptions & {
    readonly data: Uint8Array;
    readonly fontKey: string;
    readonly fileName: string;
};

type NormalizedFontOptions = Omit<FontOptions, "data"> & { readonly data: Uint8Array };

const toBytes = (data: Uint8Array | ArrayBuffer): Uint8Array =>
    data instanceof Uint8Array ? Uint8Array.from(data) : new Uint8Array(data.slice(0));

const bytesEqual = (first: Uint8Array, second: Uint8Array): boolean =>
    first.length === second.length && first.every((value, index) => value === second[index]);

export class FontWrapper implements IViewWrapper {
    private readonly fontTable: XmlComponent;
    private readonly relationships: Relationships;
    public readonly options: readonly FontOptions[];
    public readonly fontOptionsWithKey: readonly FontOptionsWithKey[];

    public constructor(options: readonly FontOptions[]) {
        const uniqueFonts: NormalizedFontOptions[] = [];
        const fontsByName = new Map<string, NormalizedFontOptions>();

        for (const option of options) {
            const normalizedOption = { ...option, data: toBytes(option.data) };
            const existing = fontsByName.get(option.name);
            if (existing) {
                if (
                    !bytesEqual(existing.data, normalizedOption.data) ||
                    existing.characterSet !== normalizedOption.characterSet
                ) {
                    throw new Error(
                        `Conflicting embedded font definitions for name '${option.name}'.`,
                    );
                }
                continue;
            }

            fontsByName.set(option.name, normalizedOption);
            uniqueFonts.push(normalizedOption);
        }

        this.options = uniqueFonts;
        this.fontOptionsWithKey = uniqueFonts.map((option, index) => {
            const { name, data, characterSet } = option;
            return {
                name,
                data: toBytes(data),
                characterSet,
                fontKey: uniqueId(),
                fileName: `font${index + 1}.odttf`,
            };
        });
        this.fontTable = createFontTable(this.fontOptionsWithKey);
        this.relationships = new Relationships();

        this.fontOptionsWithKey.forEach((option, i) => {
            this.relationships.createRelationship(
                i + 1,
                "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font",
                `fonts/${option.fileName}`,
            );
        });
    }

    public get View(): XmlComponent {
        return this.fontTable;
    }

    public get Relationships(): Relationships {
        return this.relationships;
    }
}
