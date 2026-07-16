import { describe, expect, it } from "vitest";

import { Media } from "@file/media";

import { ImageReplacer } from "./image-replacer";

describe("ImageReplacer", () => {
    describe("#replace()", () => {
        it("should replace properly", () => {
            const imageReplacer = new ImageReplacer();
            const result = imageReplacer.replace(
                '<w:t>literal {test-image.png}</w:t><a:blip r:embed="rId{test-image.png}"/>',
                [
                    {
                        type: "png",
                        data: Buffer.from(""),
                        fileName: "test-image.png",
                        transformation: {
                            pixels: {
                                x: 100,
                                y: 100,
                            },
                            emus: {
                                x: 100,
                                y: 100,
                            },
                        },
                    },
                ],
                [0],
            );

            expect(result).to.equal('<w:t>literal {test-image.png}</w:t><a:blip r:embed="rId0"/>');
        });

        it("should treat file names as literal text, not regular expressions", () => {
            const imageReplacer = new ImageReplacer();
            const result = imageReplacer.replace(
                '<a:blip r:embed="rId{test-image.png}"/>',
                [
                    {
                        type: "png",
                        data: Buffer.from(""),
                        fileName: "test.image-png",
                        transformation: {
                            pixels: {
                                x: 100,
                                y: 100,
                            },
                            emus: {
                                x: 100,
                                y: 100,
                            },
                        },
                    },
                ],
                [5],
            );

            expect(result).to.equal('<a:blip r:embed="rId{test-image.png}"/>');
        });

        it("should leave brace tokens that are not known media file names untouched", () => {
            const imageReplacer = new ImageReplacer();
            const result = imageReplacer.replace(
                '<w:t>{my-ref-0} {test-image.png} {unknown}</w:t><a:blip r:embed="rId{test-image.png}"/>',
                [
                    {
                        type: "png",
                        data: Buffer.from(""),
                        fileName: "test-image.png",
                        transformation: {
                            pixels: {
                                x: 100,
                                y: 100,
                            },
                            emus: {
                                x: 100,
                                y: 100,
                            },
                        },
                    },
                ],
                [7],
            );

            expect(result).to.equal(
                '<w:t>{my-ref-0} {test-image.png} {unknown}</w:t><a:blip r:embed="rId7"/>',
            );
        });
    });

    describe("#getMediaData()", () => {
        it("should get media data", () => {
            const imageReplacer = new ImageReplacer();
            const result = imageReplacer.getMediaData('<a:blip r:embed="rId{test-image}"/>', {
                Array: [
                    {
                        stream: Buffer.from(""),
                        fileName: "test-image",
                        dimensions: {
                            pixels: {
                                x: 100,
                                y: 100,
                            },
                            emus: {
                                x: 100,
                                y: 100,
                            },
                        },
                    },
                ],
            } as unknown as Media);

            expect(result).to.have.length(1);
        });

        it("should find media referenced in stringified xml-js JSON attributes", () => {
            const imageReplacer = new ImageReplacer();
            const result = imageReplacer.getMediaData(
                '{"elements":[{"name":"a:blip","attributes":{"r:embed":"rId{test-image}"}}]}',
                {
                    Array: [
                        {
                            stream: Buffer.from(""),
                            fileName: "test-image",
                            dimensions: {
                                pixels: {
                                    x: 100,
                                    y: 100,
                                },
                                emus: {
                                    x: 100,
                                    y: 100,
                                },
                            },
                        },
                    ],
                } as unknown as Media,
            );

            expect(result).to.have.length(1);
        });

        it("should ignore placeholder-like visible text", () => {
            const imageReplacer = new ImageReplacer();
            const result = imageReplacer.getMediaData("<w:t>{test-image}</w:t>", {
                Array: [
                    {
                        stream: Buffer.from(""),
                        fileName: "test-image",
                        dimensions: {
                            pixels: {
                                x: 100,
                                y: 100,
                            },
                            emus: {
                                x: 100,
                                y: 100,
                            },
                        },
                    },
                ],
            } as unknown as Media);

            expect(result).to.have.length(0);
        });
    });
});
