import xml from "xml";
import { Element, xml2js } from "xml-js";

import { Formatter } from "@export/formatter";
import { Text } from "@file/paragraph/run/run-components/text";

import { LoadedZipInput } from "./input-normalizer";

const formatter = new Formatter();

const UTF16LE = new Uint8Array([0xff, 0xfe]);
const UTF16BE = new Uint8Array([0xfe, 0xff]);

const compareByteArrays = (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((byte, i) => byte === b[i]);
};

const textDecoder = new TextDecoder();

/**
 * Inflates one XML ZIP part on demand. Binary and UTF-16 parts are left in
 * JSZip's lazy loaded representation so callers do not retain duplicate media
 * buffers while inspecting a package.
 */
export const readZipText = async (
    zipContent: LoadedZipInput,
    key: string,
): Promise<string | undefined> => {
    if (!key.endsWith(".xml") && !key.endsWith(".rels")) {
        return undefined;
    }
    const value = zipContent.file(key);
    if (value === null) {
        return undefined;
    }
    const bytes = await value.async("uint8array");
    const startBytes = bytes.slice(0, 2);
    if (compareByteArrays(startBytes, UTF16LE) || compareByteArrays(startBytes, UTF16BE)) {
        return undefined;
    }
    return textDecoder.decode(bytes);
};

/** XML part names in archive order, excluding directory entries. */
export const xmlZipKeys = (zipContent: LoadedZipInput): readonly string[] =>
    Object.entries(zipContent.files)
        .filter(([key, value]) => !value.dir && (key.endsWith(".xml") || key.endsWith(".rels")))
        .map(([key]) => key);

export const toJson = (xmlData: string): Element => {
    const xmlObj = xml2js(xmlData, {
        compact: false,
        captureSpacesBetweenElements: true,
    }) as Element;
    return xmlObj;
};

export const createTextElementContents = (text: string): Element[] => {
    const textJson = toJson(xml(formatter.format(new Text({ text }))));

    return textJson.elements![0].elements ?? [];
};

export const patchSpaceAttribute = (element: Element): Element => ({
    ...element,
    attributes: {
        "xml:space": "preserve",
    },
});

export const getFirstLevelElements = (relationships: Element, id: string): Element[] =>
    relationships.elements?.find((e) => e.name === id)?.elements ?? [];
