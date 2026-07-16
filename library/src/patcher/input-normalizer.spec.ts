import { Readable } from "node:stream";

import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { TextRun } from "@file/paragraph";

import { patchDocument, PatchType } from "./from-docx";
import { LoadedZipInput, loadZip } from "./input-normalizer";
import { patchDetector } from "./patch-detector";
import { readStyleIds } from "./style-reader";

const createTemplate = async (): Promise<Uint8Array> => {
    const zip = new JSZip();
    zip.file(
        "word/document.xml",
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{{name}}</w:t></w:r></w:p></w:body></w:document>',
    );
    zip.file(
        "word/styles.xml",
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal" /></w:style></w:styles>',
    );
    return zip.generateAsync({ type: "uint8array" });
};

const split = (bytes: Uint8Array): readonly Uint8Array[] => {
    const middle = Math.floor(bytes.byteLength / 2);
    return [bytes.slice(0, middle), bytes.slice(middle)];
};

const asArrayBuffer = (bytes: Uint8Array): ArrayBuffer => Uint8Array.from(bytes).buffer;

describe("portable patcher input normalization", () => {
    it("accepts an already loaded JSZip archive through the structural public type", async () => {
        const zip: LoadedZipInput = new JSZip();
        zip.file("word/document.xml", "<w:document />");

        expect(await loadZip(zip)).toBe(zip);
    });

    it("loads a Blob through its runtime-neutral arrayBuffer API", async () => {
        const zip = await loadZip(new Blob([asArrayBuffer(await createTemplate())]));

        expect(zip.file("word/document.xml")).not.toBeNull();
    });

    it("loads a multi-chunk web ReadableStream", async () => {
        const chunks = split(await createTemplate());
        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                chunks.forEach((chunk) => controller.enqueue(chunk));
                controller.close();
            },
        });

        expect((await loadZip(stream)).file("word/document.xml")).not.toBeNull();
    });

    it("loads a structural async iterable", async () => {
        const chunks = split(await createTemplate());
        const input: AsyncIterable<Uint8Array> = {
            async *[Symbol.asyncIterator]() {
                yield* chunks;
            },
        };

        expect((await loadZip(input)).file("word/document.xml")).not.toBeNull();
    });

    it("preserves binary-string stream chunks without UTF-8 re-encoding", async () => {
        const bytes = await createTemplate();
        const chunks = split(bytes).map((chunk) =>
            Array.from(chunk, (byte) => String.fromCharCode(byte)).join(""),
        );
        const input: AsyncIterable<string> = {
            async *[Symbol.asyncIterator]() {
                yield* chunks;
            },
        };

        expect((await loadZip(input)).file("word/document.xml")).not.toBeNull();
    });

    it("loads a Node readable without exposing Node stream types in the public API", async () => {
        const stream = Readable.from(split(await createTemplate()));

        expect((await loadZip(stream)).file("word/document.xml")).not.toBeNull();
    });

    it("propagates stream failures", async () => {
        const input: AsyncIterable<Uint8Array> = {
            [Symbol.asyncIterator]() {
                return {
                    next: () => Promise.reject(new Error("stream failed")),
                };
            },
        };

        await expect(loadZip(input)).rejects.toThrowError("stream failed");
    });

    it("uses normalized Blob input in patchDocument", async () => {
        const output = await patchDocument({
            outputType: "uint8array",
            data: new Blob([asArrayBuffer(await createTemplate())]),
            patches: {
                name: { type: PatchType.PARAGRAPH, children: [new TextRun("Ada")] },
            },
        });
        const documentXml = await (
            await JSZip.loadAsync(output)
        )
            .file("word/document.xml")!
            .async("text");

        expect(documentXml).toContain("Ada");
        expect(documentXml).not.toContain("{{name}}");
    });

    it("uses normalized web streams in patchDetector", async () => {
        const chunks = split(await createTemplate());
        let index = 0;
        const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
                const chunk = chunks[index++];
                if (chunk === undefined) {
                    controller.close();
                } else {
                    controller.enqueue(chunk);
                }
            },
        });

        expect(await patchDetector({ data: stream })).toEqual(["name"]);
    });

    it("uses normalized async iterables in style readers", async () => {
        const chunks = split(await createTemplate());
        const input: AsyncIterable<Uint8Array> = {
            async *[Symbol.asyncIterator]() {
                yield* chunks;
            },
        };

        expect(await readStyleIds({ data: input })).toEqual(["Normal"]);
    });
});
