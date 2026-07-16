// http://officeopenxml.com/drwPicFloating-textWrap.php
import type { IMargins } from "../floating";

export const TextWrappingType = {
    NONE: 0,
    SQUARE: 1,
    TIGHT: 2,
    TOP_AND_BOTTOM: 3,
} as const;

export const TextWrappingSide = {
    BOTH_SIDES: "bothSides",
    LEFT: "left",
    RIGHT: "right",
    LARGEST: "largest",
} as const;

export type ITextWrapping = {
    readonly type: (typeof TextWrappingType)[keyof typeof TextWrappingType];
    readonly side?: (typeof TextWrappingSide)[keyof typeof TextWrappingSide];
    /** Distance between the wrapped text and the drawing. Takes precedence over `IFloating.margins`. */
    readonly margins?: IMargins;
};
