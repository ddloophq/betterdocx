import { describe, expect, it } from "vitest";

import { Formatter } from "@export/formatter";

import { DefaultStylesFactory } from "./factory";

describe("DefaultStylesFactory", () => {
    describe("#newInstance()", () => {
        it("should merge user overrides with built-in defaults instead of replacing them", () => {
            const factory = new DefaultStylesFactory();
            const styles = factory.newInstance({
                heading1: {
                    run: {
                        bold: true,
                    },
                },
            });

            const heading1 = styles.importedStyles?.find((style) =>
                JSON.stringify(new Formatter().format(style)).includes("Heading1"),
            );
            const tree = JSON.stringify(new Formatter().format(heading1!));

            // built-in defaults survive
            expect(tree).to.contain("2E74B5");
            expect(tree).to.contain('"w:sz"');
            // the override is applied
            expect(tree).to.contain("w:b");
        });
    });
});
