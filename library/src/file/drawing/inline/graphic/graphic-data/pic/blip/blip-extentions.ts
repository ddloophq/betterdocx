import { IMediaData } from "@file/media";

// cspell:ignore asvg
import {
    BuilderElement,
    IContext,
    IXmlableObject,
    NextAttributeComponent,
    XmlComponent,
} from "@file/xml-components";

class SvgBlip extends XmlComponent {
    public constructor(private readonly mediaData: IMediaData) {
        super("asvg:svgBlip");
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        this.root.push(
            new NextAttributeComponent({
                asvg: {
                    key: "xmlns:asvg",
                    value: "http://schemas.microsoft.com/office/drawing/2016/SVG/main",
                },
                embed: {
                    key: "r:embed",
                    value:
                        context.session.relationships?.resolveImage(this.mediaData.fileName) ??
                        `rId{${this.mediaData.fileName}}`,
                },
            }),
        );

        try {
            return super.prepForXml(context);
        } finally {
            this.root.pop();
        }
    }
}

const createSvgBlip = (mediaData: IMediaData): XmlComponent => new SvgBlip(mediaData);

const createExtention = (mediaData: IMediaData): XmlComponent =>
    new BuilderElement({
        name: "a:ext",
        attributes: {
            uri: {
                key: "uri",
                value: "{96DAC541-7B7A-43D3-8B79-37D633B846F1}",
            },
        },
        children: [createSvgBlip(mediaData)],
    });

export const createExtentionList = (mediaData: IMediaData): XmlComponent =>
    new BuilderElement({
        name: "a:extLst",
        children: [createExtention(mediaData)],
    });
