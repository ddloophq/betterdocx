import JSZip from "jszip";

import { OutputByType, OutputType } from "@util/output-type";

export type BinaryChunk = string | readonly number[] | Uint8Array | ArrayBuffer;

/** A runtime-neutral description of Node-style readable streams. */
export type NodeReadableStreamLike = {
    readonly on: (event: string, listener: (...args: unknown[]) => void) => unknown;
    readonly removeListener?: (event: string, listener: (...args: unknown[]) => void) => unknown;
};

/**
 * Minimal, runtime-neutral shape of an already loaded ZIP archive.
 *
 * This intentionally avoids exposing JSZip's declaration types from the public
 * API. A `JSZip` instance satisfies this shape, while browser-only TypeScript
 * consumers do not need Node declarations merely to import the patcher types.
 */
export type LoadedZipEntry = {
    readonly dir: boolean;
    readonly async: (type: "uint8array") => Promise<Uint8Array>;
};

export type LoadedZipInput = {
    readonly files: Readonly<Record<string, LoadedZipEntry>>;
    readonly file: {
        (path: string): LoadedZipEntry | null;
        (path: string, data: string | Uint8Array | ArrayBuffer): LoadedZipInput;
    };
    readonly generateAsync: <T extends OutputType>(options: {
        readonly type: T;
        readonly mimeType?: string;
        readonly compression?: "STORE" | "DEFLATE";
    }) => Promise<OutputByType[T]>;
};

export type InputDataType =
    | string
    | number[]
    | Uint8Array
    | ArrayBuffer
    | Blob
    | ReadableStream<BinaryChunk>
    | AsyncIterable<BinaryChunk>
    | NodeReadableStreamLike
    | LoadedZipInput;

const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
    typeof value === "object" && value !== null;

const isBlobLike = (value: unknown): value is Blob =>
    isObject(value) && typeof value.arrayBuffer === "function";

const isWebReadableStream = (value: unknown): value is ReadableStream<BinaryChunk> =>
    isObject(value) && typeof value.getReader === "function";

const isAsyncIterable = (value: unknown): value is AsyncIterable<BinaryChunk> =>
    isObject(value) && typeof value[Symbol.asyncIterator] === "function";

const isNodeReadableStream = (value: unknown): value is NodeReadableStreamLike =>
    isObject(value) && typeof value.on === "function";

const isLoadedZip = (value: unknown): value is LoadedZipInput =>
    isObject(value) &&
    isObject(value.files) &&
    typeof value.file === "function" &&
    typeof value.generateAsync === "function";

const toBytes = (chunk: unknown): Uint8Array => {
    if (typeof chunk === "string") {
        // JSZip treats string input as a binary string, so stream chunks must
        // retain each code unit's low byte rather than being UTF-8 encoded.
        return Uint8Array.from(chunk, (character) => character.charCodeAt(0) % 256);
    }
    if (chunk instanceof ArrayBuffer) {
        return new Uint8Array(chunk);
    }
    if (ArrayBuffer.isView(chunk)) {
        return new Uint8Array(
            chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength),
        );
    }
    if (Array.isArray(chunk) && chunk.every((value) => Number.isInteger(value))) {
        return Uint8Array.from(chunk as readonly number[]);
    }
    throw new TypeError(
        "Document streams must yield strings, byte arrays, ArrayBuffers, or typed-array views.",
    );
};

const concatenate = (chunks: readonly Uint8Array[]): Uint8Array => {
    const totalLength = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
    if (!Number.isSafeInteger(totalLength)) {
        throw new RangeError("Document input is too large to load into memory.");
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return result;
};

const readWebStream = async (stream: ReadableStream<BinaryChunk>): Promise<Uint8Array> => {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    try {
        while (true) {
            // Web streams expose one chunk at a time; reads must stay ordered.

            const { done, value } = await reader.read();
            if (done) {
                return concatenate(chunks);
            }
            chunks.push(toBytes(value));
        }
    } finally {
        reader.releaseLock();
    }
};

const readAsyncIterable = async (input: AsyncIterable<BinaryChunk>): Promise<Uint8Array> => {
    const chunks: Uint8Array[] = [];
    for await (const chunk of input) {
        chunks.push(toBytes(chunk));
    }
    return concatenate(chunks);
};

const readNodeStream = (stream: NodeReadableStreamLike): Promise<Uint8Array> =>
    new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];

        const onData = (...args: unknown[]): void => {
            try {
                chunks.push(toBytes(args[0]));
            } catch (error) {
                cleanup();
                reject(error);
            }
        };
        const onEnd = (): void => {
            cleanup();
            resolve(concatenate(chunks));
        };
        const onError = (...args: unknown[]): void => {
            cleanup();
            reject(args[0]);
        };
        const cleanup = (): void => {
            stream.removeListener?.("data", onData);
            stream.removeListener?.("end", onEnd);
            stream.removeListener?.("error", onError);
        };

        stream.on("data", onData);
        stream.on("end", onEnd);
        stream.on("error", onError);
    });

const normalizeInput = (
    data: Exclude<InputDataType, LoadedZipInput>,
): string | number[] | Uint8Array | ArrayBuffer | Promise<Uint8Array | ArrayBuffer> => {
    if (isBlobLike(data)) {
        return data.arrayBuffer();
    }
    if (isWebReadableStream(data)) {
        return readWebStream(data);
    }
    if (isAsyncIterable(data)) {
        return readAsyncIterable(data);
    }
    if (isNodeReadableStream(data)) {
        return readNodeStream(data);
    }
    return data;
};

/** Loads every supported patcher input without relying on Node globals. */
export const loadZip = async (data: InputDataType): Promise<LoadedZipInput> =>
    isLoadedZip(data)
        ? data
        : JSZip.loadAsync(await normalizeInput(data as Exclude<InputDataType, LoadedZipInput>));
