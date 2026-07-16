import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@util/": `${resolve(import.meta.dirname, "src/util")}/`,
            "@export/": `${resolve(import.meta.dirname, "src/export")}/`,
            "@file/": `${resolve(import.meta.dirname, "src/file")}/`,
            "@shared": `${resolve(import.meta.dirname, "src/shared")}`,
            "@tests/": `${resolve(import.meta.dirname, "src/tests")}/`,
        },
    },
    test: {
        environment: "jsdom",
        dir: "./src",
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            thresholds: {
                statements: 99,
                branches: 96,
                functions: 99,
                lines: 99,
            },
            include: ["src/**/*.ts"],
            exclude: ["**/index.ts", "**/types.ts", "**/*.spec.ts"],
        },
        include: ["**/*.spec.ts"],
    },
});
