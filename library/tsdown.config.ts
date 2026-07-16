import { defineConfig } from "tsdown";

export default defineConfig({
    entry: {
        index: "src/index.ts",
        core: "src/core.ts",
        patcher: "src/patcher/index.ts",
        advanced: "src/advanced.ts",
    },
    format: ["esm"],
    platform: "neutral",
    target: "es2022",
    dts: true,
    minify: false,
    clean: true,
    publint: true,
});
