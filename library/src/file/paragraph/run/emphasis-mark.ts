import { Attributes, XmlComponent } from "@file/xml-components";

export const EmphasisMarkType = {
    DOT: "dot",
} as const;

export class EmphasisMark extends XmlComponent {
    public constructor(
        emphasisMarkType: (typeof EmphasisMarkType)[keyof typeof EmphasisMarkType] = EmphasisMarkType.DOT,
    ) {
        super("w:em");
        this.root.push(
            new Attributes({
                val: emphasisMarkType,
            }),
        );
    }
}
