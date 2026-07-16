// http://officeopenxml.com/WPnumbering-numFmt.php
// http://www.datypic.com/sc/ooxml/a-w_val-57.html
import {
    Attributes,
    NumberValueElement,
    XmlAttributeComponent,
    XmlComponent,
} from "@file/xml-components";
import { decimalNumber } from "@util/values";

import { AlignmentType } from "../paragraph/formatting";
import {
    ILevelParagraphStylePropertiesOptions,
    ParagraphProperties,
} from "../paragraph/properties";
import { IRunStylePropertiesOptions, RunProperties } from "../paragraph/run/properties";
import { NumberFormat as CanonicalNumberFormat } from "../shared/number-format";
import { validateNumberingLevel, validateNumberingStart } from "./validation";

// <xsd:simpleType name="ST_NumberFormat">
//     <xsd:restriction base="xsd:string">
//         <xsd:enumeration value="decimal"/>
//         <xsd:enumeration value="upperRoman"/>
//         <xsd:enumeration value="lowerRoman"/>
//         <xsd:enumeration value="upperLetter"/>
//         <xsd:enumeration value="lowerLetter"/>
//         <xsd:enumeration value="ordinal"/>
//         <xsd:enumeration value="cardinalText"/>
//         <xsd:enumeration value="ordinalText"/>
//         <xsd:enumeration value="hex"/>
//         <xsd:enumeration value="chicago"/>
//         <xsd:enumeration value="ideographDigital"/>
//         <xsd:enumeration value="japaneseCounting"/>
//         <xsd:enumeration value="aiueo"/>
//         <xsd:enumeration value="iroha"/>
//         <xsd:enumeration value="decimalFullWidth"/>
//         <xsd:enumeration value="decimalHalfWidth"/>
//         <xsd:enumeration value="japaneseLegal"/>
//         <xsd:enumeration value="japaneseDigitalTenThousand"/>
//         <xsd:enumeration value="decimalEnclosedCircle"/>
//         <xsd:enumeration value="decimalFullWidth2"/>
//         <xsd:enumeration value="aiueoFullWidth"/>
//         <xsd:enumeration value="irohaFullWidth"/>
//         <xsd:enumeration value="decimalZero"/>
//         <xsd:enumeration value="bullet"/>
//         <xsd:enumeration value="ganada"/>
//         <xsd:enumeration value="chosung"/>
//         <xsd:enumeration value="decimalEnclosedFullstop"/>
//         <xsd:enumeration value="decimalEnclosedParen"/>
//         <xsd:enumeration value="decimalEnclosedCircleChinese"/>
//         <xsd:enumeration value="ideographEnclosedCircle"/>
//         <xsd:enumeration value="ideographTraditional"/>
//         <xsd:enumeration value="ideographZodiac"/>
//         <xsd:enumeration value="ideographZodiacTraditional"/>
//         <xsd:enumeration value="taiwaneseCounting"/>
//         <xsd:enumeration value="ideographLegalTraditional"/>
//         <xsd:enumeration value="taiwaneseCountingThousand"/>
//         <xsd:enumeration value="taiwaneseDigital"/>
//         <xsd:enumeration value="chineseCounting"/>
//         <xsd:enumeration value="chineseLegalSimplified"/>
//         <xsd:enumeration value="chineseCountingThousand"/>
//         <xsd:enumeration value="koreanDigital"/>
//         <xsd:enumeration value="koreanCounting"/>
//         <xsd:enumeration value="koreanLegal"/>
//         <xsd:enumeration value="koreanDigital2"/>
//         <xsd:enumeration value="vietnameseCounting"/>
//         <xsd:enumeration value="russianLower"/>
//         <xsd:enumeration value="russianUpper"/>
//         <xsd:enumeration value="none"/>
//         <xsd:enumeration value="numberInDash"/>
//         <xsd:enumeration value="hebrew1"/>
//         <xsd:enumeration value="hebrew2"/>
//         <xsd:enumeration value="arabicAlpha"/>
//         <xsd:enumeration value="arabicAbjad"/>
//         <xsd:enumeration value="hindiVowels"/>
//         <xsd:enumeration value="hindiConsonants"/>
//         <xsd:enumeration value="hindiNumbers"/>
//         <xsd:enumeration value="hindiCounting"/>
//         <xsd:enumeration value="thaiLetters"/>
//         <xsd:enumeration value="thaiNumbers"/>
//         <xsd:enumeration value="thaiCounting"/>
//         <xsd:enumeration value="bahtText"/>
//         <xsd:enumeration value="dollarText"/>
//         <xsd:enumeration value="custom"/>
//     </xsd:restriction>
// </xsd:simpleType>

/** @deprecated Use NumberFormat. */
export const LevelFormat = CanonicalNumberFormat;

class LevelAttributes extends XmlAttributeComponent<{
    readonly ilvl?: number;
    readonly tentative?: number;
}> {
    protected readonly xmlKeys = {
        ilvl: "w:ilvl",
        tentative: "w15:tentative",
    };
}

// <xsd:complexType name="CT_NumFmt">
//     <xsd:attribute name="val" type="ST_NumberFormat" use="required"/>
//     <xsd:attribute name="format" type="s:ST_String" use="optional"/>
// </xsd:complexType>
class NumberFormatElement extends XmlComponent {
    public constructor(value: string) {
        super("w:numFmt");
        this.root.push(
            new Attributes({
                val: value,
            }),
        );
    }
}

// <xsd:complexType name="CT_LevelText">
//     <xsd:attribute name="val" type="s:ST_String" use="optional"/>
//     <xsd:attribute name="null" type="s:ST_OnOff" use="optional"/>
// </xsd:complexType>
class LevelText extends XmlComponent {
    public constructor(value: string) {
        super("w:lvlText");
        this.root.push(
            new Attributes({
                val: value,
            }),
        );
    }
}

class LevelJc extends XmlComponent {
    public constructor(value: (typeof AlignmentType)[keyof typeof AlignmentType]) {
        super("w:lvlJc");
        this.root.push(
            new Attributes({
                val: value,
            }),
        );
    }
}

export const LevelSuffix = {
    NOTHING: "nothing",
    SPACE: "space",
    TAB: "tab",
} as const;

export type ILevelsOptions = {
    readonly level: number;
    readonly format?: (typeof CanonicalNumberFormat)[keyof typeof CanonicalNumberFormat];
    readonly text?: string;
    readonly alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    readonly start?: number;
    readonly suffix?: (typeof LevelSuffix)[keyof typeof LevelSuffix];
    readonly isLegalNumberingStyle?: boolean;
    readonly style?: {
        readonly run?: IRunStylePropertiesOptions;
        readonly paragraph?: ILevelParagraphStylePropertiesOptions;
    };
};

// <xsd:complexType name="CT_LevelSuffix">
//     <xsd:attribute name="val" type="ST_LevelSuffix" use="required"/>
// </xsd:complexType>
//     <xsd:simpleType name="ST_LevelSuffix">
//         <xsd:restriction base="xsd:string">
//             <xsd:enumeration value="tab"/>
//             <xsd:enumeration value="space"/>
//             <xsd:enumeration value="nothing"/>
//         </xsd:restriction>
//     </xsd:simpleType>
class Suffix extends XmlComponent {
    public constructor(value: (typeof LevelSuffix)[keyof typeof LevelSuffix]) {
        super("w:suff");
        this.root.push(
            new Attributes({
                val: value,
            }),
        );
    }
}

// http://officeopenxml.com/WPnumbering-isLgl.php
// https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.islegalnumberingstyle?view=openxml-2.8.1
class IsLegalNumberingStyle extends XmlComponent {
    public constructor() {
        super("w:isLgl");
    }
}

// <xsd:complexType name="CT_Lvl">
//     <xsd:sequence>
//         <xsd:element name="start" type="CT_DecimalNumber" minOccurs="0"/>
//         <xsd:element name="numFmt" type="CT_NumFmt" minOccurs="0"/>
//         <xsd:element name="lvlRestart" type="CT_DecimalNumber" minOccurs="0"/>
//         <xsd:element name="pStyle" type="CT_String" minOccurs="0"/>
//         <xsd:element name="isLgl" type="CT_OnOff" minOccurs="0"/>
//         <xsd:element name="suff" type="CT_LevelSuffix" minOccurs="0"/>
//         <xsd:element name="lvlText" type="CT_LevelText" minOccurs="0"/>
//         <xsd:element name="lvlPicBulletId" type="CT_DecimalNumber" minOccurs="0"/>
//         <xsd:element name="legacy" type="CT_LvlLegacy" minOccurs="0"/>
//         <xsd:element name="lvlJc" type="CT_Jc" minOccurs="0"/>
//         <xsd:element name="pPr" type="CT_PPrGeneral" minOccurs="0"/>
//         <xsd:element name="rPr" type="CT_RPr" minOccurs="0"/>
//     </xsd:sequence>
//     <xsd:attribute name="ilvl" type="ST_DecimalNumber" use="required"/>
//     <xsd:attribute name="tplc" type="ST_LongHexNumber" use="optional"/>
//     <xsd:attribute name="tentative" type="s:ST_OnOff" use="optional"/>
// </xsd:complexType>
export class Level extends XmlComponent {
    private readonly paragraphProperties: ParagraphProperties;
    private readonly runProperties: RunProperties;

    public constructor({
        level,
        format,
        text,
        alignment = AlignmentType.START,
        start = 1,
        style,
        suffix,
        isLegalNumberingStyle,
    }: ILevelsOptions) {
        super("w:lvl");

        validateNumberingLevel(level);
        validateNumberingStart(start);

        this.root.push(new NumberValueElement("w:start", decimalNumber(start)));

        if (format) {
            this.root.push(new NumberFormatElement(format));
        }

        if (suffix) {
            this.root.push(new Suffix(suffix));
        }

        if (isLegalNumberingStyle) {
            this.root.push(new IsLegalNumberingStyle());
        }

        if (text) {
            this.root.push(new LevelText(text));
        }

        this.root.push(new LevelJc(alignment));

        this.paragraphProperties = new ParagraphProperties(style && style.paragraph);
        this.runProperties = new RunProperties(style && style.run);

        this.root.push(this.paragraphProperties);
        this.root.push(this.runProperties);

        this.root.push(
            new LevelAttributes({
                ilvl: decimalNumber(level),
                tentative: 1,
            }),
        );
    }
}
