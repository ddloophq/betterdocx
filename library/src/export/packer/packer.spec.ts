import { afterEach, assert, beforeEach, describe, expect, it, vi } from "vitest";

import { File } from "@file/file";
import { HeadingLevel, Paragraph } from "@file/paragraph";

import { Packer, PrettifyType } from "./packer";

describe("Packer", () => {
    let file: File;

    beforeEach(() => {
        file = new File({
            creator: "Dolan Miu",
            revision: 1,
            lastModifiedBy: "Dolan Miu",
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: "title",
                            heading: HeadingLevel.TITLE,
                        }),
                        new Paragraph({
                            text: "Hello world",
                            heading: HeadingLevel.HEADING_1,
                        }),
                        new Paragraph({
                            text: "heading 2",
                            heading: HeadingLevel.HEADING_2,
                        }),
                        new Paragraph("test text"),
                    ],
                },
            ],
        });
    });

    describe("prettify", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should use a default prettify value", async () => {
            const spy = vi.spyOn((Packer as any).compiler, "compile");

            await Packer.toString(file, true);

            expect(spy).toBeCalledWith(
                expect.anything(),
                PrettifyType.WITH_2_BLANKS,
                expect.anything(),
            );
        });

        it("should use a prettify value", async () => {
            const spy = vi.spyOn((Packer as any).compiler, "compile");

            await Packer.toString(file, PrettifyType.WITH_4_BLANKS);

            expect(spy).toBeCalledWith(
                expect.anything(),
                PrettifyType.WITH_4_BLANKS,
                expect.anything(),
            );
        });

        it("should use an undefined prettify value", async () => {
            const spy = vi.spyOn((Packer as any).compiler, "compile");

            await Packer.toString(file, false);

            expect(spy).toBeCalledWith(expect.anything(), undefined, expect.anything());
        });
    });

    describe("overrides", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should use an overrides value", async () => {
            const spy = vi.spyOn((Packer as any).compiler, "compile");
            const overrides = [{ path: "word/comments.xml", data: "comments" }];

            await Packer.toString(file, true, overrides);

            expect(spy).toBeCalledWith(expect.anything(), expect.anything(), overrides);
        });

        it("should use a default overrides value", async () => {
            const spy = vi.spyOn((Packer as any).compiler, "compile");

            await Packer.toString(file);

            expect(spy).toBeCalledWith(expect.anything(), undefined, []);
        });
    });

    describe("#toString()", () => {
        it("should return a non-empty string", async () => {
            const result = await Packer.toString(file);

            assert.isAbove(result.length, 0);
        });
    });

    describe("#toBuffer()", () => {
        it("should create a standard docx file", { timeout: 99999999 }, async () => {
            const buffer = await Packer.toBuffer(file);

            assert.isDefined(buffer);
            assert.isTrue(buffer.byteLength > 0);
        });

        it("should handle exception if it throws any", () => {
            vi.spyOn((Packer as any).compiler, "compile").mockImplementation(() => {
                throw new Error();
            });

            return Packer.toBuffer(file).catch((error) => {
                assert.isDefined(error);
            });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });
    });

    describe("#toUint8Array()", () => {
        it("should create portable document bytes", async () => {
            const bytes = await Packer.toUint8Array(file);

            expect(bytes).toBeInstanceOf(Uint8Array);
            expect(bytes.byteLength).toBeGreaterThan(0);
        });

        it("should be the implementation used by the deprecated buffer alias", async () => {
            const spy = vi.spyOn(Packer, "toUint8Array");

            await Packer.toBuffer(file);

            expect(spy).toHaveBeenCalledWith(file, undefined, []);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });
    });

    describe("#toBase64String()", () => {
        it("should create a standard docx file", { timeout: 99999999 }, async () => {
            const str = await Packer.toBase64String(file);
            expect(str).toBeDefined();
            expect(str.length).toBeGreaterThan(0);
        });

        it("should handle exception if it throws any", () => {
            vi.spyOn((Packer as any).compiler, "compile").mockImplementation(() => {
                throw new Error();
            });

            return Packer.toBase64String(file).catch((error) => {
                assert.isDefined(error);
            });
        });

        afterEach(() => {
            vi.resetAllMocks();
        });
    });

    describe("#toBlob()", () => {
        it("should create a standard docx file", async () => {
            vi.spyOn((Packer as any).compiler, "compile").mockReturnValue({
                generateAsync: () => vi.fn(),
            });
            const str = await Packer.toBlob(file);

            assert.isDefined(str);
        });

        it("should handle exception if it throws any", () => {
            vi.spyOn((Packer as any).compiler, "compile").mockImplementation(() => {
                throw new Error();
            });

            return Packer.toBlob(file).catch((error) => {
                assert.isDefined(error);
            });
        });

        afterEach(() => {
            vi.resetAllMocks();
        });
    });

    describe("#toArrayBuffer()", () => {
        it("should create a standard docx file", async () => {
            vi.spyOn((Packer as any).compiler, "compile").mockReturnValue({
                generateAsync: () => vi.fn(),
            });
            const str = await Packer.toArrayBuffer(file);

            assert.isDefined(str);
        });

        it("should handle exception if it throws any", () => {
            vi.spyOn((Packer as any).compiler, "compile").mockImplementation(() => {
                throw new Error();
            });

            return Packer.toArrayBuffer(file).catch((error) => {
                assert.isDefined(error);
            });
        });

        afterEach(() => {
            vi.resetAllMocks();
        });
    });

    describe("#toReadableStream()", () => {
        it("should create a standard docx file", async () => {
            vi.spyOn((Packer as any).compiler, "compile").mockReturnValue({
                generateAsync: () => Promise.resolve(new Uint8Array([1, 2, 3])),
            });
            const stream = Packer.toReadableStream(file);

            const chunks: Uint8Array[] = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            expect(chunks).toEqual([new Uint8Array([1, 2, 3])]);
        });

        it("should error the stream if packing fails", async () => {
            vi.spyOn((Packer as any).compiler, "compile").mockImplementation(() => {
                throw new Error("boom");
            });

            const stream = Packer.toReadableStream(file);

            await expect(stream.getReader().read()).rejects.toThrow("boom");
        });

        afterEach(() => {
            vi.resetAllMocks();
        });
    });
});
