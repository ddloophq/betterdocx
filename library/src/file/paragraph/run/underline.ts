import { Attributes, XmlComponent } from "@file/xml-components";
import { hexColorValue } from "@util/values";

export const UnderlineType = {
    SINGLE: "single",
    WORDS: "words",
    DOUBLE: "double",
    THICK: "thick",
    DOTTED: "dotted",
    DOTTEDHEAVY: "dottedHeavy",
    DASH: "dash",
    DASHEDHEAVY: "dashedHeavy",
    DASHLONG: "dashLong",
    DASHLONGHEAVY: "dashLongHeavy",
    DOTDASH: "dotDash",
    DASHDOTHEAVY: "dashDotHeavy",
    DOTDOTDASH: "dotDotDash",
    DASHDOTDOTHEAVY: "dashDotDotHeavy",
    WAVE: "wave",
    WAVYHEAVY: "wavyHeavy",
    WAVYDOUBLE: "wavyDouble",
    NONE: "none",
} as const;

export type IUnderlineOptions = {
    readonly type?: (typeof UnderlineType)[keyof typeof UnderlineType];
    readonly color?: string;
};

export class Underline extends XmlComponent {
    public constructor(options?: IUnderlineOptions);
    /** @deprecated Pass an options object instead. */
    public constructor(
        underlineType?: (typeof UnderlineType)[keyof typeof UnderlineType],
        color?: string,
    );
    public constructor(
        optionsOrType: IUnderlineOptions | (typeof UnderlineType)[keyof typeof UnderlineType] = {},
        legacyColor?: string,
    ) {
        super("w:u");

        const { type = UnderlineType.SINGLE, color = legacyColor } =
            typeof optionsOrType === "string" ? { type: optionsOrType } : optionsOrType;

        this.root.push(
            new Attributes({
                val: type,
                color: color === undefined ? undefined : hexColorValue(color),
            }),
        );
    }
}
