import { File } from "@file/file";
import { OutputByType, OutputType } from "@util/output-type";

import { Compiler, IXmlifyedFile } from "./next-compiler";

export type { IXmlifyedFile } from "./next-compiler";

/**
 * Use blanks to prettify
 */
export const PrettifyType = {
    NONE: "",
    WITH_2_BLANKS: "  ",
    WITH_4_BLANKS: "    ",

    WITH_TAB: "\t",
} as const;

const convertPrettifyType = (
    prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
): (typeof PrettifyType)[keyof typeof PrettifyType] | undefined =>
    prettify === true ? PrettifyType.WITH_2_BLANKS : prettify === false ? undefined : prettify;

export class Packer {
    public static async pack<T extends OutputType>(
        file: File,
        type: T,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): Promise<OutputByType[T]> {
        const zip = this.compiler.compile(file, convertPrettifyType(prettify), overrides);
        return await zip.generateAsync({
            type,
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            compression: "DEFLATE",
        });
    }

    public static toString(
        file: File,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): Promise<string> {
        return Packer.pack(file, "string", prettify, overrides);
    }

    /** @deprecated Use {@link toUint8Array} for a runtime-neutral byte result. */
    public static toBuffer(
        file: File,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): Promise<Uint8Array> {
        return Packer.toUint8Array(file, prettify, overrides);
    }

    /**
     * Produces portable document bytes in browsers, workers, Node.js, Bun, and Deno.
     */
    public static toUint8Array(
        file: File,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): Promise<Uint8Array> {
        return Packer.pack(file, "uint8array", prettify, overrides);
    }

    public static toBase64String(
        file: File,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): Promise<string> {
        return Packer.pack(file, "base64", prettify, overrides);
    }

    public static toBlob(
        file: File,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): Promise<Blob> {
        return Packer.pack(file, "blob", prettify, overrides);
    }

    public static toArrayBuffer(
        file: File,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): Promise<ArrayBuffer> {
        return Packer.pack(file, "arraybuffer", prettify, overrides);
    }

    public static toReadableStream(
        file: File,
        prettify?: boolean | (typeof PrettifyType)[keyof typeof PrettifyType],
        overrides: readonly IXmlifyedFile[] = [],
    ): ReadableStream<Uint8Array> {
        return new ReadableStream<Uint8Array>({
            start: async (controller) => {
                try {
                    const data = await Packer.pack(file, "uint8array", prettify, overrides);
                    controller.enqueue(data);
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }

    private static readonly compiler = new Compiler();
}
