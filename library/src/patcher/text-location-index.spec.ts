import { describe, expect, it } from "vitest";

import { TextLocationIndex } from "./text-location-index";
import { toJson } from "./util";

const documentXml = (paragraphs: string): string =>
    `<w:document xmlns:w="urn:w"><w:body>${paragraphs}</w:body></w:document>`;

const paragraph = (text: string): string => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`;

describe("TextLocationIndex", () => {
    it("indexes a large sparse token set in one stable pass", () => {
        const tokens = Array.from({ length: 1_000 }, (_, index) => `{{key-${index}}}`);
        const json = toJson(
            documentXml(`${paragraph("before {{key-7}} after")}${paragraph("{{key-999}}")}`),
        );

        const index = new TextLocationIndex(json, tokens);

        expect(index.locations("{{key-7}}")).toHaveLength(1);
        expect(index.locations("{{key-999}}")).toHaveLength(1);
        expect(index.locations("{{key-99}}")).toHaveLength(0);
    });

    it("refreshes stable paragraph paths and rebuilds after sibling shifts", () => {
        const json = toJson(documentXml(`${paragraph("{{first}}")}${paragraph("{{second}}")}`));
        const index = new TextLocationIndex(json, ["{{first}}", "{{second}}", "{{new}}"]);
        const firstPath = index.locations("{{first}}")[0].pathToParagraph;
        const firstText = json.elements![0].elements![0].elements![0].elements![0].elements![0];
        firstText.elements![0].text = "{{new}}";

        index.refresh([firstPath]);
        expect(index.locations("{{first}}")).toHaveLength(0);
        expect(index.locations("{{new}}")).toHaveLength(1);

        json.elements![0].elements![0].elements!.unshift(
            toJson(paragraph("{{first}}")).elements![0],
        );
        index.rebuild();
        expect(index.locations("{{first}}")).toHaveLength(1);
        expect(index.locations("{{second}}")[0].pathToParagraph.at(-1)).toBe(2);
    });
});
