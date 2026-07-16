import { describe, expect, it } from "vitest";

import { FontWrapper } from "./font-wrapper";

describe("FontWrapper", () => {
    it("deduplicates identical definitions with browser-neutral byte inputs", () => {
        const wrapper = new FontWrapper([
            { name: "Same", data: new Uint8Array([1, 2, 3]) },
            { name: "Same", data: new Uint8Array([1, 2, 3]).buffer },
        ]);

        expect(wrapper.fontOptionsWithKey).toHaveLength(1);
        expect(wrapper.fontOptionsWithKey[0].data).toEqual(new Uint8Array([1, 2, 3]));
    });

    it("rejects duplicate names with different bytes or metadata", () => {
        expect(
            () =>
                new FontWrapper([
                    { name: "Same", data: new Uint8Array([1]) },
                    { name: "Same", data: new Uint8Array([2]) },
                ]),
        ).toThrow("Conflicting embedded font definitions for name 'Same'.");

        expect(
            () =>
                new FontWrapper([
                    { name: "Same", data: new Uint8Array([1]) },
                    { name: "Same", data: new Uint8Array([1]), characterSet: "00" },
                ]),
        ).toThrow("Conflicting embedded font definitions for name 'Same'.");
    });

    it("uses unique safe physical names independent of display names", () => {
        const wrapper = new FontWrapper([
            { name: "../unsafe/name", data: new Uint8Array([1]) },
            { name: "spaces & URI?#", data: new Uint8Array([2]) },
        ]);

        expect(wrapper.fontOptionsWithKey.map((font) => font.fileName)).toEqual([
            "font1.odttf",
            "font2.odttf",
        ]);
    });
});
