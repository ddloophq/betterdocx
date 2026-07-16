// http://officeopenxml.com/WPtext.php
import { FootnoteReferenceRun } from "@file/footnotes/footnote/run/reference-run";
import { FieldInstruction } from "@file/table-of-contents/field-instruction";
import { XmlComponent } from "@file/xml-components";

import { Break } from "./break";
import {
    AnnotationReference,
    CarriageReturn,
    ContinuationSeparator,
    DayLong,
    DayShort,
    EndnoteReference,
    FootnoteReferenceElement,
    LastRenderedPageBreak,
    MonthLong,
    MonthShort,
    NoBreakHyphen,
    PageNumberElement,
    Separator,
    SoftHyphen,
    Tab,
    YearLong,
    YearShort,
} from "./empty-children";
import { Begin, End, InstructionText, Separate } from "./field";
import { CurrentSection, NumberOfPages, NumberOfPagesSection, Page } from "./page-number";
import { PositionalTab } from "./positional-tab";
import { IRunPropertiesOptions, RunProperties } from "./properties";
import { Text } from "./run-components/text";

export type IRunOptions = {
    // <xsd:choice>
    //     <xsd:element name="br" type="CT_Br" />
    //     <xsd:element name="t" type="CT_Text" />
    //     <xsd:element name="contentPart" type="CT_Rel" />
    //     <xsd:element name="delText" type="CT_Text" />
    //     <xsd:element name="instrText" type="CT_Text" />
    //     <xsd:element name="delInstrText" type="CT_Text" />
    //     <xsd:element name="noBreakHyphen" type="CT_Empty" />
    //     <xsd:element name="softHyphen" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="dayShort" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="monthShort" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="yearShort" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="dayLong" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="monthLong" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="yearLong" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="annotationRef" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="footnoteRef" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="endnoteRef" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="separator" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="continuationSeparator" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="sym" type="CT_Sym" minOccurs="0" />
    //     <xsd:element name="pgNum" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="cr" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="tab" type="CT_Empty" minOccurs="0" />
    //     <xsd:element name="object" type="CT_Object" />
    //     <xsd:element name="pict" type="CT_Picture" />
    //     <xsd:element name="fldChar" type="CT_FldChar" />
    //     <xsd:element name="ruby" type="CT_Ruby" />
    //     <xsd:element name="footnoteReference" type="CT_FtnEdnRef" />
    //     <xsd:element name="endnoteReference" type="CT_FtnEdnRef" />
    //     <xsd:element name="commentReference" type="CT_Markup" />
    //     <xsd:element name="drawing" type="CT_Drawing" />
    //     <xsd:element name="ptab" type="CT_PTab" minOccurs="0" />
    //     <xsd:element name="lastRenderedPageBreak" type="CT_Empty" minOccurs="0" maxOccurs="1" />
    // </xsd:choice>
    readonly children?: readonly (
        | Begin
        | FieldInstruction
        | InstructionText
        | Separate
        | End
        | PageNumberField
        | FootnoteReferenceRun
        | Break
        | AnnotationReference
        | CarriageReturn
        | ContinuationSeparator
        | DayLong
        | DayShort
        | EndnoteReference
        | FootnoteReferenceElement
        | LastRenderedPageBreak
        | MonthLong
        | MonthShort
        | NoBreakHyphen
        | PageNumberElement
        | Separator
        | SoftHyphen
        | Tab
        | YearLong
        | YearShort
        | PositionalTab
        | string
    )[];
    readonly break?: number;
    readonly text?: string;
} & IRunPropertiesOptions;

export const PageNumberFieldType = {
    CURRENT: "CURRENT",
    TOTAL_PAGES: "TOTAL_PAGES",
    TOTAL_PAGES_IN_SECTION: "TOTAL_PAGES_IN_SECTION",
    CURRENT_SECTION: "CURRENT_SECTION",
} as const;

type PageNumberFieldTypeValue = (typeof PageNumberFieldType)[keyof typeof PageNumberFieldType];

/** An explicit field value used as a run child. Plain strings are always text. */
export class PageNumberField {
    public constructor(public readonly type: PageNumberFieldTypeValue) {}
}

export const PageNumber = {
    CURRENT: new PageNumberField(PageNumberFieldType.CURRENT),
    TOTAL_PAGES: new PageNumberField(PageNumberFieldType.TOTAL_PAGES),
    TOTAL_PAGES_IN_SECTION: new PageNumberField(PageNumberFieldType.TOTAL_PAGES_IN_SECTION),
    CURRENT_SECTION: new PageNumberField(PageNumberFieldType.CURRENT_SECTION),
} as const;

const appendPageNumberField = (root: XmlComponent, field: PageNumberField): void => {
    root.addChildElement(new Begin());

    switch (field.type) {
        case PageNumberFieldType.CURRENT:
            root.addChildElement(new Page());
            break;
        case PageNumberFieldType.TOTAL_PAGES:
            root.addChildElement(new NumberOfPages());
            break;
        case PageNumberFieldType.TOTAL_PAGES_IN_SECTION:
            root.addChildElement(new NumberOfPagesSection());
            break;
        case PageNumberFieldType.CURRENT_SECTION:
            root.addChildElement(new CurrentSection());
            break;
    }

    root.addChildElement(new Separate());
    root.addChildElement(new End());
};

export class Run extends XmlComponent {
    protected readonly properties: RunProperties;

    public constructor(options: IRunOptions) {
        super("w:r");
        this.properties = new RunProperties(options);
        this.root.push(this.properties);

        if (options.break) {
            this.root.push(...Array.from({ length: options.break }, () => new Break()));
        }

        if (options.children) {
            for (const child of options.children) {
                if (typeof child === "string") {
                    this.root.push(new Text(child));
                    continue;
                }

                if (child instanceof PageNumberField) {
                    appendPageNumberField(this, child);
                    continue;
                }

                this.root.push(child);
            }
        } else if (options.text !== undefined) {
            this.root.push(new Text(options.text));
        }
    }
}
