// http://officeopenxml.com/WPtableBorders.php
import { BorderElement, BorderStyle, IBorderOptions } from "@file/border";
import { XmlComponent } from "@file/xml-components";

/**
 * A single table border side. Pass an {@link IBorderOptions} to draw that side
 * explicitly, or `"inherit"` to emit no element for it so the referenced table
 * `style` owns that side (rather than the forced default border).
 */
export type TableBorderSide = IBorderOptions | "inherit";

export type ITableBordersOptions = {
    readonly top?: TableBorderSide;
    readonly bottom?: TableBorderSide;
    readonly left?: TableBorderSide;
    readonly right?: TableBorderSide;
    readonly insideHorizontal?: TableBorderSide;
    readonly insideVertical?: TableBorderSide;
};

type ITableBordersInternalOptions = {
    /**
     * When true, a side left `undefined` emits no element and defers to the
     * referenced table `style`. When false (no style is set), an unspecified
     * side falls back to {@link DEFAULT_BORDER} so unstyled tables stay visible.
     */
    readonly inheritUnspecified?: boolean;
};

const NONE_BORDER = {
    style: BorderStyle.NONE,
    size: 0,
    color: "auto",
};

const DEFAULT_BORDER = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "auto",
};

export class TableBorders extends XmlComponent {
    public static readonly NONE = {
        top: NONE_BORDER,
        bottom: NONE_BORDER,
        left: NONE_BORDER,
        right: NONE_BORDER,
        insideHorizontal: NONE_BORDER,
        insideVertical: NONE_BORDER,
    };

    public constructor(
        options: ITableBordersOptions,
        { inheritUnspecified = false }: ITableBordersInternalOptions = {},
    ) {
        super("w:tblBorders");

        const borders = [
            ["top", "w:top"],
            ["left", "w:left"],
            ["bottom", "w:bottom"],
            ["right", "w:right"],
            ["insideHorizontal", "w:insideH"],
            ["insideVertical", "w:insideV"],
        ] as const;

        for (const [key, elementName] of borders) {
            const value = options[key];
            // An explicit "inherit", or an unspecified side when a style owns
            // the borders, emits no element so the style's border for that side
            // is left untouched instead of being overridden by a direct border.
            if (value === "inherit" || (value === undefined && inheritUnspecified)) {
                continue;
            }
            this.root.push(new BorderElement(elementName, value ?? DEFAULT_BORDER));
        }
    }
}
