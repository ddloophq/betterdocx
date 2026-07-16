import { describe, expect, it } from "vitest";

import { Document, Packer } from "./index";

describe("Index", () => {
    describe("Document", () => {
        it("should instantiate the Document", () => {
            expect(
                new Document({
                    sections: [],
                }),
            ).to.be.ok;
        });

        it.each([new Document(), new Document({}), new Document({ creator: "A creator" })])(
            "should instantiate and pack documented optional forms",
            async (document) => {
                expect(document).to.be.ok;
                await expect(Packer.toArrayBuffer(document)).resolves.toBeInstanceOf(ArrayBuffer);
            },
        );
    });
});
