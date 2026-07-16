import { IMediaData } from "./data";

const bytesEqual = (
    firstData: Uint8Array | ArrayBuffer,
    secondData: Uint8Array | ArrayBuffer,
): boolean => {
    const first = firstData instanceof ArrayBuffer ? new Uint8Array(firstData) : firstData;
    const second = secondData instanceof ArrayBuffer ? new Uint8Array(secondData) : secondData;

    return first.length === second.length && first.every((value, index) => value === second[index]);
};

export type IMediaTransformation = {
    readonly width: number;
    readonly height: number;
    readonly flip?: {
        readonly vertical?: boolean;
        readonly horizontal?: boolean;
    };
    readonly rotation?: number;
};

export class Media {
    private readonly map: Map<string, IMediaData>;

    public constructor() {
        this.map = new Map<string, IMediaData>();
    }

    public addImage(key: string, mediaData: IMediaData): void {
        const existing = this.map.get(key);
        if (existing) {
            if (!bytesEqual(existing.data, mediaData.data)) {
                throw new Error(`Media key collision for '${key}' with different image data`);
            }

            return;
        }

        this.map.set(key, mediaData);
    }

    public get Array(): readonly IMediaData[] {
        return Array.from(this.map.values());
    }
}
