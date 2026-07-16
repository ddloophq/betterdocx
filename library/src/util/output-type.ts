/* v8 ignore start */
// Simply type definitions. Can ignore testing and coverage
// From JSZip
export type OutputByType = {
    readonly base64: string;

    readonly string: string;
    readonly binarystring: string;
    readonly array: readonly number[];
    readonly uint8array: Uint8Array;
    readonly arraybuffer: ArrayBuffer;
    readonly blob: Blob;
};

export type OutputType = keyof OutputByType;
/* v8 ignore stop */
