import { describe, expect, it } from "vitest";

import * as advanced from "./advanced";
import * as core from "./core";
import * as root from "./index";
import * as patcher from "./patcher";

const keys = (value: object): readonly string[] => Object.keys(value).sort();

describe("public package entries", () => {
    it("keeps File and Document as the same generation class", () => {
        expect(core.Document).toBe(core.File);
        expect(root.Document).toBe(root.File);
        expect(root.Document).toBe(core.Document);
    });

    it("keeps the root as the backwards-compatible union of core and patcher", () => {
        const combined = Object.fromEntries(
            [...keys(core), ...keys(patcher)].map((exportName) => [exportName, true]),
        );
        expect(keys(root)).toEqual(keys(combined));
    });

    it("does not expose template parsing from the generation-only entry", () => {
        expect(core).not.toHaveProperty("patchDocument");
        expect(core).not.toHaveProperty("patchDetector");
        expect(core).not.toHaveProperty("readStyles");
        expect(core).not.toHaveProperty("readStyleIds");
    });

    it("snapshots the root runtime API", () => {
        expect(keys(root)).toMatchSnapshot();
    });

    it("snapshots the core runtime API", () => {
        expect(keys(core)).toMatchSnapshot();
    });

    it("snapshots the patcher runtime API", () => {
        expect(keys(patcher)).toMatchSnapshot();
    });

    it("snapshots the advanced runtime API", () => {
        expect(keys(advanced)).toMatchSnapshot();
    });
});
