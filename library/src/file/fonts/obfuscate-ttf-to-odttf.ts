/**
 * ODTTF (Obfuscated Document TTF) font obfuscation for OOXML embedding.
 *
 * Office Open XML uses a simple XOR-based obfuscation when embedding fonts
 * to discourage casual extraction. This is NOT encryption—just obfuscation.
 *
 * Algorithm
 * 1. Extract 16-byte key from GUID (remove hyphens, parse hex pairs, reverse)
 * 2. XOR the first 32 bytes of the font with the key (cycling through 16 bytes)
 * 3. Leave remaining bytes unchanged
 */

const obfuscatedByteCount = 32;
const guidSize = 32;

export const obfuscate = (buf: Uint8Array, fontKey: string): Uint8Array => {
    const guid = fontKey.replace(/-/g, "");
    if (guid.length !== guidSize) {
        throw new Error(`Error: Cannot extract GUID from font filename: ${fontKey}`);
    }

    const hexStrings = guid.replace(/(..)/g, "$1 ").trim().split(" ");
    const hexNumbers = hexStrings.map((hexString) => parseInt(hexString, 16));

    hexNumbers.reverse();

    const out = Uint8Array.from(buf);
    for (let i = 0; i < Math.min(obfuscatedByteCount, out.length); i++) {
        // oxlint-disable-next-line no-bitwise -- font obfuscation xor
        out[i] ^= hexNumbers[i % hexNumbers.length];
    }
    return out;
};
