import { afterEach, describe, expect, it, vi } from "vitest";

import { Formatter } from "@export/formatter";
import { createRenderSession } from "@file/xml-components";

import { ImageRun } from "./image-run";

describe("ImageRun", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("#constructor()", () => {
        it("should reject an omitted runtime image type", () => {
            expect(
                () =>
                    new ImageRun({
                        data: new Uint8Array(),
                        transformation: { width: 1, height: 1 },
                    } as never),
            ).toThrow("Invalid image type 'undefined'");
        });

        it("should reject unsupported runtime image types", () => {
            expect(
                () =>
                    new ImageRun({
                        type: "webp",
                        data: new Uint8Array(),
                        transformation: { width: 1, height: 1 },
                    } as never),
            ).toThrow("Invalid image type 'webp'");
        });

        it("should reject unsupported SVG fallback image types", () => {
            expect(
                () =>
                    new ImageRun({
                        type: "svg",
                        data: new Uint8Array(),
                        fallback: { type: "webp", data: new Uint8Array() },
                        transformation: { width: 1, height: 1 },
                    } as never),
            ).toThrow("Invalid SVG fallback image type 'webp'");
        });

        it("should create with Buffer", () => {
            const currentImageRun = new ImageRun({
                type: "png",
                data: Buffer.from(""),
                transformation: {
                    width: 200,
                    height: 200,
                    rotation: 45,
                },
                floating: {
                    zIndex: 10,
                    horizontalPosition: {
                        offset: 1014400,
                    },
                    verticalPosition: {
                        offset: 1014400,
                    },
                },
            });

            const tree = new Formatter().format(currentImageRun, {
                session: createRenderSession({ media: { addImage: vi.fn() } }),
                stack: [],
            });
            expect(tree).to.deep.equal({
                "w:r": [
                    {
                        "w:drawing": [
                            {
                                "wp:anchor": [
                                    {
                                        _attr: {
                                            allowOverlap: "1",
                                            behindDoc: "0",
                                            distB: 0,
                                            distL: 0,
                                            distR: 0,
                                            distT: 0,
                                            layoutInCell: "1",
                                            locked: "0",
                                            relativeHeight: 10,
                                            simplePos: "0",
                                        },
                                    },
                                    {
                                        "wp:simplePos": {
                                            _attr: {
                                                x: 0,
                                                y: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:positionH": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:positionV": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:extent": {
                                            _attr: {
                                                cx: 1905000,
                                                cy: 1905000,
                                            },
                                        },
                                    },
                                    {
                                        "wp:effectExtent": {
                                            _attr: {
                                                b: 0,
                                                l: 0,
                                                r: 0,
                                                t: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:wrapNone": {},
                                    },
                                    {
                                        "wp:docPr": {
                                            _attr: {
                                                descr: "",
                                                id: 1,
                                                name: "",
                                                title: "",
                                            },
                                        },
                                    },
                                    {
                                        "wp:cNvGraphicFramePr": [
                                            {
                                                "a:graphicFrameLocks": {
                                                    _attr: {
                                                        noChangeAspect: 1,
                                                        "xmlns:a":
                                                            "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        "a:graphic": [
                                            {
                                                _attr: {
                                                    "xmlns:a":
                                                        "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                },
                                            },
                                            {
                                                "a:graphicData": [
                                                    {
                                                        _attr: {
                                                            uri: "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                        },
                                                    },
                                                    {
                                                        "pic:pic": [
                                                            {
                                                                _attr: {
                                                                    "xmlns:pic":
                                                                        "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                                },
                                                            },
                                                            {
                                                                "pic:nvPicPr": [
                                                                    {
                                                                        "pic:cNvPr": {
                                                                            _attr: {
                                                                                descr: "",
                                                                                id: 0,
                                                                                name: "",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "pic:cNvPicPr": [
                                                                            {
                                                                                "a:picLocks": {
                                                                                    _attr: {
                                                                                        noChangeArrowheads: 1,
                                                                                        noChangeAspect: 1,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:blipFill": [
                                                                    {
                                                                        "a:blip": {
                                                                            _attr: {
                                                                                cstate: "none",
                                                                                "r:embed":
                                                                                    "rId{811c9dc5-0.png}",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:srcRect": {},
                                                                    },
                                                                    {
                                                                        "a:stretch": [
                                                                            {
                                                                                "a:fillRect": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:spPr": [
                                                                    {
                                                                        _attr: {
                                                                            bwMode: "auto",
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:xfrm": [
                                                                            {
                                                                                _attr: {
                                                                                    rot: 2700000,
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:off": {
                                                                                    _attr: {
                                                                                        x: 0,
                                                                                        y: 0,
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:ext": {
                                                                                    _attr: {
                                                                                        cx: 1905000,
                                                                                        cy: 1905000,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        "a:prstGeom": [
                                                                            {
                                                                                _attr: {
                                                                                    prst: "rect",
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:avLst": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it("should create with string", () => {
            const currentImageRun = new ImageRun({
                type: "png",
                data: "",
                transformation: {
                    width: 200,
                    height: 200,
                    rotation: 45,
                },
                floating: {
                    zIndex: 10,
                    horizontalPosition: {
                        offset: 1014400,
                    },
                    verticalPosition: {
                        offset: 1014400,
                    },
                },
            });

            const tree = new Formatter().format(currentImageRun, {
                session: createRenderSession({ media: { addImage: vi.fn() } }),
                stack: [],
            });
            expect(tree).to.deep.equal({
                "w:r": [
                    {
                        "w:drawing": [
                            {
                                "wp:anchor": [
                                    {
                                        _attr: {
                                            allowOverlap: "1",
                                            behindDoc: "0",
                                            distB: 0,
                                            distL: 0,
                                            distR: 0,
                                            distT: 0,
                                            layoutInCell: "1",
                                            locked: "0",
                                            relativeHeight: 10,
                                            simplePos: "0",
                                        },
                                    },
                                    {
                                        "wp:simplePos": {
                                            _attr: {
                                                x: 0,
                                                y: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:positionH": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:positionV": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:extent": {
                                            _attr: {
                                                cx: 1905000,
                                                cy: 1905000,
                                            },
                                        },
                                    },
                                    {
                                        "wp:effectExtent": {
                                            _attr: {
                                                b: 0,
                                                l: 0,
                                                r: 0,
                                                t: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:wrapNone": {},
                                    },
                                    {
                                        "wp:docPr": {
                                            _attr: {
                                                descr: "",
                                                id: 1,
                                                name: "",
                                                title: "",
                                            },
                                        },
                                    },
                                    {
                                        "wp:cNvGraphicFramePr": [
                                            {
                                                "a:graphicFrameLocks": {
                                                    _attr: {
                                                        noChangeAspect: 1,
                                                        "xmlns:a":
                                                            "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        "a:graphic": [
                                            {
                                                _attr: {
                                                    "xmlns:a":
                                                        "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                },
                                            },
                                            {
                                                "a:graphicData": [
                                                    {
                                                        _attr: {
                                                            uri: "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                        },
                                                    },
                                                    {
                                                        "pic:pic": [
                                                            {
                                                                _attr: {
                                                                    "xmlns:pic":
                                                                        "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                                },
                                                            },
                                                            {
                                                                "pic:nvPicPr": [
                                                                    {
                                                                        "pic:cNvPr": {
                                                                            _attr: {
                                                                                descr: "",
                                                                                id: 0,
                                                                                name: "",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "pic:cNvPicPr": [
                                                                            {
                                                                                "a:picLocks": {
                                                                                    _attr: {
                                                                                        noChangeArrowheads: 1,
                                                                                        noChangeAspect: 1,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:blipFill": [
                                                                    {
                                                                        "a:blip": {
                                                                            _attr: {
                                                                                cstate: "none",
                                                                                "r:embed":
                                                                                    "rId{811c9dc5-0.png}",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:srcRect": {},
                                                                    },
                                                                    {
                                                                        "a:stretch": [
                                                                            {
                                                                                "a:fillRect": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:spPr": [
                                                                    {
                                                                        _attr: {
                                                                            bwMode: "auto",
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:xfrm": [
                                                                            {
                                                                                _attr: {
                                                                                    rot: 2700000,
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:off": {
                                                                                    _attr: {
                                                                                        x: 0,
                                                                                        y: 0,
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:ext": {
                                                                                    _attr: {
                                                                                        cx: 1905000,
                                                                                        cy: 1905000,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        "a:prstGeom": [
                                                                            {
                                                                                _attr: {
                                                                                    prst: "rect",
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:avLst": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it("should return UInt8Array if atob is present", () => {
            vi.spyOn(global, "atob").mockReturnValue("");

            const currentImageRun = new ImageRun({
                type: "png",
                data: "",
                transformation: {
                    width: 200,
                    height: 200,
                    rotation: 45,
                },
                floating: {
                    zIndex: 10,
                    horizontalPosition: {
                        offset: 1014400,
                    },
                    verticalPosition: {
                        offset: 1014400,
                    },
                },
            });

            const tree = new Formatter().format(currentImageRun, {
                session: createRenderSession({ media: { addImage: vi.fn() } }),
                stack: [],
            });

            expect(tree).to.deep.equal({
                "w:r": [
                    {
                        "w:drawing": [
                            {
                                "wp:anchor": [
                                    {
                                        _attr: {
                                            allowOverlap: "1",
                                            behindDoc: "0",
                                            distB: 0,
                                            distL: 0,
                                            distR: 0,
                                            distT: 0,
                                            layoutInCell: "1",
                                            locked: "0",
                                            relativeHeight: 10,
                                            simplePos: "0",
                                        },
                                    },
                                    {
                                        "wp:simplePos": {
                                            _attr: {
                                                x: 0,
                                                y: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:positionH": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:positionV": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:extent": {
                                            _attr: {
                                                cx: 1905000,
                                                cy: 1905000,
                                            },
                                        },
                                    },
                                    {
                                        "wp:effectExtent": {
                                            _attr: {
                                                b: 0,
                                                l: 0,
                                                r: 0,
                                                t: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:wrapNone": {},
                                    },
                                    {
                                        "wp:docPr": {
                                            _attr: {
                                                descr: "",
                                                id: 1,
                                                name: "",
                                                title: "",
                                            },
                                        },
                                    },
                                    {
                                        "wp:cNvGraphicFramePr": [
                                            {
                                                "a:graphicFrameLocks": {
                                                    _attr: {
                                                        noChangeAspect: 1,
                                                        "xmlns:a":
                                                            "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        "a:graphic": [
                                            {
                                                _attr: {
                                                    "xmlns:a":
                                                        "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                },
                                            },
                                            {
                                                "a:graphicData": [
                                                    {
                                                        _attr: {
                                                            uri: "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                        },
                                                    },
                                                    {
                                                        "pic:pic": [
                                                            {
                                                                _attr: {
                                                                    "xmlns:pic":
                                                                        "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                                },
                                                            },
                                                            {
                                                                "pic:nvPicPr": [
                                                                    {
                                                                        "pic:cNvPr": {
                                                                            _attr: {
                                                                                descr: "",
                                                                                id: 0,
                                                                                name: "",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "pic:cNvPicPr": [
                                                                            {
                                                                                "a:picLocks": {
                                                                                    _attr: {
                                                                                        noChangeArrowheads: 1,
                                                                                        noChangeAspect: 1,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:blipFill": [
                                                                    {
                                                                        "a:blip": {
                                                                            _attr: {
                                                                                cstate: "none",
                                                                                "r:embed":
                                                                                    "rId{811c9dc5-0.png}",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:srcRect": {},
                                                                    },
                                                                    {
                                                                        "a:stretch": [
                                                                            {
                                                                                "a:fillRect": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:spPr": [
                                                                    {
                                                                        _attr: {
                                                                            bwMode: "auto",
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:xfrm": [
                                                                            {
                                                                                _attr: {
                                                                                    rot: 2700000,
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:off": {
                                                                                    _attr: {
                                                                                        x: 0,
                                                                                        y: 0,
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:ext": {
                                                                                    _attr: {
                                                                                        cx: 1905000,
                                                                                        cy: 1905000,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        "a:prstGeom": [
                                                                            {
                                                                                _attr: {
                                                                                    prst: "rect",
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:avLst": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it("should use data as is if its not a string", () => {
            const currentImageRun = new ImageRun({
                type: "png",
                data: new Uint8Array(),
                transformation: {
                    width: 200,
                    height: 200,
                    rotation: 45,
                },
                floating: {
                    zIndex: 10,
                    horizontalPosition: {
                        offset: 1014400,
                    },
                    verticalPosition: {
                        offset: 1014400,
                    },
                },
            });

            const tree = new Formatter().format(currentImageRun, {
                session: createRenderSession({ media: { addImage: vi.fn() } }),
                stack: [],
            });

            expect(tree).to.deep.equal({
                "w:r": [
                    {
                        "w:drawing": [
                            {
                                "wp:anchor": [
                                    {
                                        _attr: {
                                            allowOverlap: "1",
                                            behindDoc: "0",
                                            distB: 0,
                                            distL: 0,
                                            distR: 0,
                                            distT: 0,
                                            layoutInCell: "1",
                                            locked: "0",
                                            relativeHeight: 10,
                                            simplePos: "0",
                                        },
                                    },
                                    {
                                        "wp:simplePos": {
                                            _attr: {
                                                x: 0,
                                                y: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:positionH": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:positionV": [
                                            {
                                                _attr: {
                                                    relativeFrom: "page",
                                                },
                                            },
                                            {
                                                "wp:posOffset": ["1014400"],
                                            },
                                        ],
                                    },
                                    {
                                        "wp:extent": {
                                            _attr: {
                                                cx: 1905000,
                                                cy: 1905000,
                                            },
                                        },
                                    },
                                    {
                                        "wp:effectExtent": {
                                            _attr: {
                                                b: 0,
                                                l: 0,
                                                r: 0,
                                                t: 0,
                                            },
                                        },
                                    },
                                    {
                                        "wp:wrapNone": {},
                                    },
                                    {
                                        "wp:docPr": {
                                            _attr: {
                                                descr: "",
                                                id: 1,
                                                name: "",
                                                title: "",
                                            },
                                        },
                                    },
                                    {
                                        "wp:cNvGraphicFramePr": [
                                            {
                                                "a:graphicFrameLocks": {
                                                    _attr: {
                                                        noChangeAspect: 1,
                                                        "xmlns:a":
                                                            "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        "a:graphic": [
                                            {
                                                _attr: {
                                                    "xmlns:a":
                                                        "http://schemas.openxmlformats.org/drawingml/2006/main",
                                                },
                                            },
                                            {
                                                "a:graphicData": [
                                                    {
                                                        _attr: {
                                                            uri: "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                        },
                                                    },
                                                    {
                                                        "pic:pic": [
                                                            {
                                                                _attr: {
                                                                    "xmlns:pic":
                                                                        "http://schemas.openxmlformats.org/drawingml/2006/picture",
                                                                },
                                                            },
                                                            {
                                                                "pic:nvPicPr": [
                                                                    {
                                                                        "pic:cNvPr": {
                                                                            _attr: {
                                                                                descr: "",
                                                                                id: 0,
                                                                                name: "",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "pic:cNvPicPr": [
                                                                            {
                                                                                "a:picLocks": {
                                                                                    _attr: {
                                                                                        noChangeArrowheads: 1,
                                                                                        noChangeAspect: 1,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:blipFill": [
                                                                    {
                                                                        "a:blip": {
                                                                            _attr: {
                                                                                cstate: "none",
                                                                                "r:embed":
                                                                                    "rId{811c9dc5-0.png}",
                                                                            },
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:srcRect": {},
                                                                    },
                                                                    {
                                                                        "a:stretch": [
                                                                            {
                                                                                "a:fillRect": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                "pic:spPr": [
                                                                    {
                                                                        _attr: {
                                                                            bwMode: "auto",
                                                                        },
                                                                    },
                                                                    {
                                                                        "a:xfrm": [
                                                                            {
                                                                                _attr: {
                                                                                    rot: 2700000,
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:off": {
                                                                                    _attr: {
                                                                                        x: 0,
                                                                                        y: 0,
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:ext": {
                                                                                    _attr: {
                                                                                        cx: 1905000,
                                                                                        cy: 1905000,
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        "a:prstGeom": [
                                                                            {
                                                                                _attr: {
                                                                                    prst: "rect",
                                                                                },
                                                                            },
                                                                            {
                                                                                "a:avLst": {},
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it("should strip base64 marker", () => {
            const spy = vi.spyOn(global, "atob").mockReturnValue("");

            new ImageRun({
                type: "png",
                data: ";base64,",
                transformation: {
                    width: 200,
                    height: 200,
                    rotation: 45,
                },
            });

            expect(spy).toBeCalledWith("");
        });

        it("should work with svgs", () => {
            const currentImageRun = new ImageRun({
                type: "svg",
                data: Buffer.from(""),
                transformation: {
                    width: 200,
                    height: 200,
                },
                fallback: {
                    type: "png",
                    data: Buffer.from(""),
                },
            });

            const tree = new Formatter().format(currentImageRun, {
                session: createRenderSession({ media: { addImage: vi.fn() } }),
                stack: [],
            });

            expect(tree).toStrictEqual({
                "w:r": [
                    {
                        "w:drawing": [
                            {
                                "wp:inline": expect.arrayContaining([
                                    {
                                        "a:graphic": expect.arrayContaining([
                                            {
                                                "a:graphicData": expect.arrayContaining([
                                                    {
                                                        "pic:pic": expect.arrayContaining([
                                                            {
                                                                "pic:blipFill":
                                                                    expect.arrayContaining([
                                                                        {
                                                                            "a:blip": [
                                                                                {
                                                                                    _attr: {
                                                                                        cstate: "none",
                                                                                        "r:embed":
                                                                                            "rId{811c9dc5-0.png}",
                                                                                    },
                                                                                },
                                                                                {
                                                                                    "a:extLst": [
                                                                                        {
                                                                                            "a:ext":
                                                                                                [
                                                                                                    {
                                                                                                        _attr: {
                                                                                                            uri: "{96DAC541-7B7A-43D3-8B79-37D633B846F1}",
                                                                                                        },
                                                                                                    },
                                                                                                    {
                                                                                                        "asvg:svgBlip":
                                                                                                            {
                                                                                                                _attr: expect.objectContaining(
                                                                                                                    {
                                                                                                                        "r:embed":
                                                                                                                            "rId{811c9dc5-0.svg}",
                                                                                                                    },
                                                                                                                ),
                                                                                                            },
                                                                                                    },
                                                                                                ],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ]),
                                                            },
                                                        ]),
                                                    },
                                                ]),
                                            },
                                        ]),
                                    },
                                ]),
                            },
                        ],
                    },
                ],
            });
        });

        it("uses normalized bytes for media identity", () => {
            const imageRunStringData = new ImageRun({
                type: "png",
                data: "REFUQQ==",
                transformation: {
                    width: 100,
                    height: 100,
                    rotation: 42,
                },
            });

            const imageRunBufferData = new ImageRun({
                type: "png",
                data: Buffer.from("DATA"),
                transformation: {
                    width: 200,
                    height: 200,
                    rotation: 45,
                },
            });

            const addImageSpy = vi.fn();
            const context = {
                session: createRenderSession({ media: { addImage: addImageSpy } }),
                stack: [],
            };

            new Formatter().format(imageRunStringData, context);
            new Formatter().format(imageRunBufferData, context);

            const expectedHash = "c407fae5-4";

            expect(addImageSpy).toHaveBeenCalledTimes(2);
            expect(addImageSpy).toHaveBeenNthCalledWith(
                1,
                `${expectedHash}.png`,
                expect.objectContaining({ fileName: `${expectedHash}.png` }),
            );
            expect(addImageSpy).toHaveBeenNthCalledWith(
                2,
                `${expectedHash}.png`,
                expect.objectContaining({ fileName: `${expectedHash}.png` }),
            );
        });

        it("copies supplied bytes so later caller mutation cannot change the payload", () => {
            const bytes = new Uint8Array([1, 2, 3]);
            const imageRun = new ImageRun({
                type: "png",
                data: bytes,
                transformation: { width: 1, height: 1 },
            });
            bytes[0] = 9;
            const addImageSpy = vi.fn();

            new Formatter().format(imageRun, {
                session: createRenderSession({ media: { addImage: addImageSpy } }),
                stack: [],
            });

            expect(addImageSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ data: new Uint8Array([1, 2, 3]) }),
            );
        });
    });
});
