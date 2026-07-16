import type { IMediaData } from "@file/media";

/**
 * Services which may be used while an XML component is rendered.
 *
 * The contract deliberately contains only serialization-scoped capabilities.
 * Components must not reach through it to the mutable Document/File model.
 */
export type IRenderMediaService = {
    readonly addImage: (key: string, mediaData: IMediaData) => void;
};

export type IRenderNumberingService = {
    /** Returns the concrete w:numId for a configured reference and instance. */
    readonly resolve: (reference: string, instance: number) => number;
};

export type IRenderRelationshipService = {
    /** Returns an OOXML relationship id including its `rId` prefix. */
    readonly resolveHyperlink: (target: string) => string;
    /** Returns an OOXML relationship id including its `rId` prefix. */
    readonly resolveImage: (fileName: string) => string;
};

export type IRenderIdService = {
    readonly nextDrawingId: () => number;
    readonly nextBookmarkId: () => number;
};

export type IRenderSession = {
    readonly media?: IRenderMediaService;
    readonly numbering?: IRenderNumberingService;
    readonly relationships?: IRenderRelationshipService;
    readonly ids: IRenderIdService;
};

export type IRenderSessionOptions = Omit<IRenderSession, "ids"> & {
    readonly ids?: IRenderIdService;
};

/** Creates deterministic, render-local ID allocators unless shared allocators are supplied. */
export const createRenderSession = (options: IRenderSessionOptions = {}): IRenderSession => {
    let drawingId = 0;
    let bookmarkId = 0;

    return {
        ...options,
        ids: options.ids ?? {
            nextDrawingId: () => ++drawingId,
            nextBookmarkId: () => ++bookmarkId,
        },
    };
};
