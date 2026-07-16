import { IMediaData } from "@file/media";
import {
    IContext,
    IXmlableObject,
    NextAttributeComponent,
    XmlComponent,
} from "@file/xml-components";

import { createExtentionList } from "./blip-extentions";

class Blip extends XmlComponent {
    public constructor(private readonly mediaData: IMediaData) {
        super("a:blip");
        if (mediaData.type === "svg") {
            this.root.push(createExtentionList(mediaData));
        }
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        const fileName =
            this.mediaData.type === "svg"
                ? this.mediaData.fallback.fileName
                : this.mediaData.fileName;
        this.root.unshift(
            new NextAttributeComponent({
                embed: {
                    key: "r:embed",
                    value:
                        context.session.relationships?.resolveImage(fileName) ?? `rId{${fileName}}`,
                },
                cstate: {
                    key: "cstate",
                    value: "none",
                },
            }),
        );

        try {
            return super.prepForXml(context);
        } finally {
            this.root.shift();
        }
    }
}

export const createBlip = (mediaData: IMediaData): XmlComponent => new Blip(mediaData);
