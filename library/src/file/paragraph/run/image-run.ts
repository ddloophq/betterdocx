import { DocPropertiesOptions } from "@file/drawing/doc-properties/doc-properties";
import { IContext, IXmlableObject } from "@file/xml-components";
import { hashedId } from "@util/convenience-functions";

import { Drawing, IFloating } from "../../drawing";
import { OutlineOptions } from "../../drawing/inline/graphic/graphic-data/pic/shape-properties/outline/outline";
import { IMediaTransformation } from "../../media";
import { IMediaData } from "../../media/data";
import { Run } from "../run";

type CoreImageOptions = {
    readonly transformation: IMediaTransformation;
    readonly floating?: IFloating;
    readonly altText?: DocPropertiesOptions;
    readonly outline?: OutlineOptions;
};

type RegularImageOptions = {
    readonly type: "jpg" | "jpeg" | "png" | "gif" | "bmp";
    readonly data: string | Uint8Array | ArrayBuffer;
};

type SvgMediaOptions = {
    readonly type: "svg";
    readonly data: string | Uint8Array | ArrayBuffer;
    /**
     * Required in case the Word processor does not support SVG.
     */
    readonly fallback: RegularImageOptions;
};

export type IImageOptions = (RegularImageOptions | SvgMediaOptions) & CoreImageOptions;

const RASTER_IMAGE_TYPES: ReadonlySet<string> = new Set(["jpg", "jpeg", "png", "gif", "bmp"]);

const validateImageType = (options: IImageOptions): void => {
    const type = (options as { readonly type?: unknown }).type;
    if (type === "svg") {
        const fallbackType = (options as { readonly fallback?: { readonly type?: unknown } })
            .fallback?.type;
        if (typeof fallbackType !== "string" || !RASTER_IMAGE_TYPES.has(fallbackType)) {
            throw new Error(
                `Invalid SVG fallback image type '${String(fallbackType)}'. Expected jpg, jpeg, png, gif, or bmp.`,
            );
        }
        return;
    }
    if (typeof type !== "string" || !RASTER_IMAGE_TYPES.has(type)) {
        throw new Error(
            `Invalid image type '${String(type)}'. Expected jpg, jpeg, png, gif, bmp, or svg.`,
        );
    }
};

const convertDataURIToBinary = (dataURI: string): Uint8Array => {
    const BASE64_MARKER = ";base64,";
    const base64Index = dataURI.indexOf(BASE64_MARKER);
    const base64IndexWithOffset = base64Index === -1 ? 0 : base64Index + BASE64_MARKER.length;
    const base64String = dataURI.substring(base64IndexWithOffset);

    // atob is available in browsers, workers, Bun, Deno, and supported Node.js
    // runtimes, so image normalization does not need Node's Buffer API.
    const binaryString = atob(base64String);
    return Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
};

const standardizeData = (data: string | Uint8Array | ArrayBuffer): Uint8Array =>
    typeof data === "string"
        ? convertDataURIToBinary(data)
        : data instanceof ArrayBuffer
          ? new Uint8Array(data.slice(0))
          : new Uint8Array(data);

const createImageData = (
    options: IImageOptions,
    key: string,
): Pick<IMediaData, "data" | "fileName" | "transformation"> => ({
    data: standardizeData(options.data),
    fileName: key,
    transformation: {
        pixels: {
            x: Math.round(options.transformation.width),
            y: Math.round(options.transformation.height),
        },
        emus: {
            x: Math.round(options.transformation.width * 9525),
            y: Math.round(options.transformation.height * 9525),
        },
        flip: options.transformation.flip,
        rotation: options.transformation.rotation
            ? options.transformation.rotation * 60000
            : undefined,
    },
});

export class ImageRun extends Run {
    private readonly imageData: IMediaData;

    public constructor(options: IImageOptions) {
        super({});

        validateImageType(options);
        const data = standardizeData(options.data);
        const hash = hashedId(data);
        const key = `${hash}.${options.type}`;

        this.imageData =
            options.type === "svg"
                ? {
                      type: options.type,
                      ...createImageData({ ...options, data }, key),
                      fallback: {
                          type: options.fallback.type,
                          ...createImageData(
                              {
                                  ...options.fallback,
                                  transformation: options.transformation,
                              },
                              `${hashedId(standardizeData(options.fallback.data))}.${options.fallback.type}`,
                          ),
                      },
                  }
                : {
                      type: options.type,
                      ...createImageData({ ...options, data }, key),
                  };
        const drawing = new Drawing(this.imageData, {
            floating: options.floating,
            docProperties: options.altText,
            outline: options.outline,
        });

        this.root.push(drawing);
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        context.session.media?.addImage(this.imageData.fileName, this.imageData);

        if (this.imageData.type === "svg") {
            context.session.media?.addImage(
                this.imageData.fallback.fileName,
                this.imageData.fallback,
            );
        }

        return super.prepForXml(context);
    }
}
