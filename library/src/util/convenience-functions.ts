// Twip - twentieths of a point
export const convertMillimetersToTwip = (millimeters: number): number =>
    Math.floor((millimeters / 25.4) * 72 * 20);

export const convertInchesToTwip = (inches: number): number => Math.floor(inches * 72 * 20);

export type UniqueNumericIdCreator = () => number;

export const uniqueNumericIdCreator = (initial = 0): UniqueNumericIdCreator => {
    let currentCount = initial;

    return () => ++currentCount;
};

export const docPropertiesUniqueNumericIdGen = (): UniqueNumericIdCreator =>
    uniqueNumericIdCreator();

export const bookmarkUniqueNumericIdGen = (): UniqueNumericIdCreator => uniqueNumericIdCreator();

export const uniqueId = (): string => {
    const runtimeCrypto = globalThis.crypto;
    if (typeof runtimeCrypto?.randomUUID === "function") {
        return runtimeCrypto.randomUUID();
    }

    // Web Crypto was not globally available in every supported Node 18 release
    // and may be absent in sandboxed runtimes. These IDs identify OOXML parts;
    // they are not security tokens, so a Math.random fallback is sufficient.
    const bytes = new Uint8Array(16);
    if (typeof runtimeCrypto?.getRandomValues === "function") {
        runtimeCrypto.getRandomValues(bytes);
    } else {
        for (let index = 0; index < bytes.length; index++) {
            bytes[index] = Math.floor(Math.random() * 256);
        }
    }

    // oxlint-disable-next-line no-bitwise -- UUID v4 version and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // oxlint-disable-next-line no-bitwise -- UUID v4 version and variant bits
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// FNV-1a 32-bit hash + byte length suffix for internal deduplication.
// Appending the length means a collision requires both the same hash AND the same size,
// sufficiently low collision risk for internal, non-adversarial deduplication.
export const hashedId = (data: string | Uint8Array | ArrayBuffer): string => {
    const bytes =
        typeof data === "string"
            ? new TextEncoder().encode(data)
            : data instanceof ArrayBuffer
              ? new Uint8Array(data)
              : data;

    // oxlint-disable-next-line no-bitwise -- FNV-1a hash
    let h = 0x811c9dc5;
    for (const byte of bytes) {
        // oxlint-disable-next-line no-bitwise -- FNV-1a hash
        h ^= byte;
        h = Math.imul(h, 0x01000193);
    }

    // oxlint-disable-next-line no-bitwise -- unsigned 32-bit coerce
    return `${(h >>> 0).toString(16).padStart(8, "0")}-${bytes.length}`;
};
