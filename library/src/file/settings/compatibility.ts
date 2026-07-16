// http://www.datypic.com/sc/ooxml/e-w_compat-1.html
import { OnOffElement, XmlComponent } from "@file/xml-components";

import { CompatibilitySetting } from "./compatibility-setting/compatibility-setting";

// <xsd:complexType name="CT_Compat">
// <xsd:sequence>
//   <xsd:element name="useSingleBorderforContiguousCells" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="wpJustification" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="noTabHangInd" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="noLeading" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="spaceForUL" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="noColumnBalance" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="balanceSingleByteDoubleByteWidth" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="noExtraLineSpacing" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotLeaveBackslashAlone" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="ulTrailSpace" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotExpandShiftReturn" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="spacingInWholePoints" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="lineWrapLikeWord6" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="printBodyTextBeforeHeader" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="printColBlack" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="wpSpaceWidth" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="showBreaksInFrames" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="subFontBySize" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="suppressBottomSpacing" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="suppressTopSpacing" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="suppressSpacingAtTopOfPage" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="suppressTopSpacingWP" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="suppressSpBfAfterPgBrk" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="swapBordersFacingPages" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="convMailMergeEsc" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="truncateFontHeightsLikeWP6" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="mwSmallCaps" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="usePrinterMetrics" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotSuppressParagraphBorders" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="wrapTrailSpaces" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="footnoteLayoutLikeWW8" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="shapeLayoutLikeWW8" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="alignTablesRowByRow" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="forgetLastTabAlignment" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="adjustLineHeightInTable" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="autoSpaceLikeWord95" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="noSpaceRaiseLower" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotUseHTMLParagraphAutoSpacing" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="layoutRawTableWidth" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="layoutTableRowsApart" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="useWord97LineBreakRules" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotBreakWrappedTables" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotSnapToGridInCell" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="selectFldWithFirstOrLastChar" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="applyBreakingRules" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotWrapTextWithPunct" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotUseEastAsianBreakRules" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="useWord2002TableStyleRules" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="growAutofit" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="useFELayout" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="useNormalStyleForList" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotUseIndentAsNumberingTabStop" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="useAltKinsokuLineBreakRules" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="allowSpaceOfSameStyleInTable" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotSuppressIndentation" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotAutofitConstrainedTables" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="autofitToFirstFixedWidthCell" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="underlineTabInNumList" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="displayHangulFixedWidth" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="splitPgBreakAndParaMark" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotVertAlignCellWithSp" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotBreakConstrainedForcedTable" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="doNotVertAlignInTxbx" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="useAnsiKerningPairs" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="cachedColBalance" type="CT_OnOff" minOccurs="0"/>
//   <xsd:element name="compatSetting" type="CT_CompatSetting" minOccurs="0" maxOccurs="unbounded"
//   />
// </xsd:sequence>
// </xsd:complexType>

export type ICompatibilityOptions = {
    readonly version?: number;
    /** Use Simplified Rules For Table Border Conflicts */
    readonly useSingleBorderforContiguousCells?: boolean;
    /** Emulate WordPerfect 6.x Paragraph Justification */
    readonly wordPerfectJustification?: boolean;
    /** Do Not Create Custom Tab Stop for Hanging Indent */
    readonly noTabStopForHangingIndent?: boolean;
    /** Do Not Add Leading Between Lines of Text */
    readonly noLeading?: boolean;
    /** Add Additional Space Below Baseline For Underlined East Asian Text */
    readonly spaceForUnderline?: boolean;
    /** Do Not Balance Text Columns within a Section */
    readonly noColumnBalance?: boolean;
    /** Balance Single Byte and Double Byte Characters */
    readonly balanceSingleByteDoubleByteWidth?: boolean;
    /** Do Not Center Content on Lines With Exact Line Height */
    readonly noExtraLineSpacing?: boolean;
    /** Convert Backslash To Yen Sign When Entered */
    readonly doNotLeaveBackslashAlone?: boolean;
    /** Underline All Trailing Spaces */
    readonly underlineTrailingSpaces?: boolean;
    /** Don't Justify Lines Ending in Soft Line Break */
    readonly doNotExpandShiftReturn?: boolean;
    /** Only Expand/Condense Text By Whole Points */
    readonly spacingInWholePoints?: boolean;
    /** Emulate Word 6.0 Line Wrapping for East Asian Text */
    readonly lineWrapLikeWord6?: boolean;
    /** Print Body Text before Header/Footer Contents */
    readonly printBodyTextBeforeHeader?: boolean;
    /** Print Colors as Black And White without Dithering */
    readonly printColorsBlack?: boolean;
    /** Space width */
    readonly spaceWidth?: boolean;
    /** Display Page/Column Breaks Present in Frames */
    readonly showBreaksInFrames?: boolean;
    /** Increase Priority Of Font Size During Font Substitution */
    readonly subFontBySize?: boolean;
    /** Ignore Exact Line Height for Last Line on Page */
    readonly suppressBottomSpacing?: boolean;
    /** Ignore Minimum and Exact Line Height for First Line on Page */
    readonly suppressTopSpacing?: boolean;
    /** Ignore Minimum Line Height for First Line on Page */
    readonly suppressSpacingAtTopOfPage?: boolean;
    /** Emulate WordPerfect 5.x Line Spacing */
    readonly suppressTopSpacingWP?: boolean;
    /** Do Not Use Space Before On First Line After a Page Break */
    readonly suppressSpBfAfterPgBrk?: boolean;
    /** Swap Paragraph Borders on Odd Numbered Pages */
    readonly swapBordersFacingPages?: boolean;
    /** Treat Backslash Quotation Delimiter as Two Quotation Marks */
    readonly convertMailMergeEsc?: boolean;
    /** Emulate WordPerfect 6.x Font Height Calculation */
    readonly truncateFontHeightsLikeWP6?: boolean;
    /** Emulate Word 5.x for the Macintosh Small Caps Formatting */
    readonly macWordSmallCaps?: boolean;
    /** Use Printer Metrics To Display Documents */
    readonly usePrinterMetrics?: boolean;
    /** Do Not Suppress Paragraph Borders Next To Frames */
    readonly doNotSuppressParagraphBorders?: boolean;
    /** Line Wrap Trailing Spaces */
    readonly wrapTrailSpaces?: boolean;
    /** Emulate Word 6.x/95/97 Footnote Placement */
    readonly footnoteLayoutLikeWW8?: boolean;
    /** Emulate Word 97 Text Wrapping Around Floating Objects */
    readonly shapeLayoutLikeWW8?: boolean;
    /** Align Table Rows Independently */
    readonly alignTablesRowByRow?: boolean;
    /** Ignore Width of Last Tab Stop When Aligning Paragraph If It Is Not Left Aligned */
    readonly forgetLastTabAlignment?: boolean;
    /** Add Document Grid Line Pitch To Lines in Table Cells */
    readonly adjustLineHeightInTable?: boolean;
    /** Emulate Word 95 Full-Width Character Spacing */
    readonly autoSpaceLikeWord95?: boolean;
    /** Do Not Increase Line Height for Raised/Lowered Text */
    readonly noSpaceRaiseLower?: boolean;
    /** Use Fixed Paragraph Spacing for HTML Auto Setting */
    readonly doNotUseHTMLParagraphAutoSpacing?: boolean;
    /** Ignore Space Before Table When Deciding If Table Should Wrap Floating Object */
    readonly layoutRawTableWidth?: boolean;
    /** Allow Table Rows to Wrap Inline Objects Independently */
    readonly layoutTableRowsApart?: boolean;
    /** Emulate Word 97 East Asian Line Breaking */
    readonly useWord97LineBreakRules?: boolean;
    /** Do Not Allow Floating Tables To Break Across Pages */
    readonly doNotBreakWrappedTables?: boolean;
    /** Do Not Snap to Document Grid in Table Cells with Objects */
    readonly doNotSnapToGridInCell?: boolean;
    /** Select Field When First or Last Character Is Selected */
    readonly selectFieldWithFirstOrLastCharacter?: boolean;
    /** Use Legacy Ethiopic and Amharic Line Breaking Rules */
    readonly applyBreakingRules?: boolean;
    /** Do Not Allow Hanging Punctuation With Character Grid */
    readonly doNotWrapTextWithPunctuation?: boolean;
    /** Do Not Compress Compressible Characters When Using Document Grid */
    readonly doNotUseEastAsianBreakRules?: boolean;
    /** Emulate Word 2002 Table Style Rules */
    readonly useWord2002TableStyleRules?: boolean;
    /** Allow Tables to AutoFit Into Page Margins */
    readonly growAutofit?: boolean;
    /** Do Not Bypass East Asian/Complex Script Layout Code */
    readonly useFELayout?: boolean;
    /** Do Not Automatically Apply List Paragraph Style To Bulleted/Numbered Text */
    readonly useNormalStyleForList?: boolean;
    /** Ignore Hanging Indent When Creating Tab Stop After Numbering */
    readonly doNotUseIndentAsNumberingTabStop?: boolean;
    /** Use Alternate Set of East Asian Line Breaking Rules */
    readonly useAlternateEastAsianLineBreakRules?: boolean;
    /** Allow Contextual Spacing of Paragraphs in Tables */
    readonly allowSpaceOfSameStyleInTable?: boolean;
    /** Do Not Ignore Floating Objects When Calculating Paragraph Indentation */
    readonly doNotSuppressIndentation?: boolean;
    /** Do Not AutoFit Tables To Fit Next To Wrapped Objects */
    readonly doNotAutofitConstrainedTables?: boolean;
    /** Allow Table Columns To Exceed Preferred Widths of Constituent Cells */
    readonly autofitToFirstFixedWidthCell?: boolean;
    /** Underline Following Character Following Numbering */
    readonly underlineTabInNumberingList?: boolean;
    /** Always Use Fixed Width for Hangul Characters */
    readonly displayHangulFixedWidth?: boolean;
    /** Always Move Paragraph Mark to Page after a Page Break */
    readonly splitPgBreakAndParaMark?: boolean;
    /** Don't Vertically Align Cells Containing Floating Objects */
    readonly doNotVerticallyAlignCellWithSp?: boolean;
    /** Don't Break Table Rows Around Floating Tables */
    readonly doNotBreakConstrainedForcedTable?: boolean;
    /** Ignore Vertical Alignment in Textboxes */
    readonly ignoreVerticalAlignmentInTextboxes?: boolean;
    /** Use ANSI Kerning Pairs from Fonts */
    readonly useAnsiKerningPairs?: boolean;
    /** Use Cached Paragraph Information for Column Balancing */
    readonly cachedColumnBalance?: boolean;
};

// Option key → XML element name, in CT_Compat sequence order (see above).
const COMPATIBILITY_OPTIONS: readonly (readonly [
    keyof Omit<ICompatibilityOptions, "version">,
    string,
])[] = [
    ["useSingleBorderforContiguousCells", "w:useSingleBorderforContiguousCells"],
    ["wordPerfectJustification", "w:wpJustification"],
    ["noTabStopForHangingIndent", "w:noTabHangInd"],
    ["noLeading", "w:noLeading"],
    ["spaceForUnderline", "w:spaceForUL"],
    ["noColumnBalance", "w:noColumnBalance"],
    ["balanceSingleByteDoubleByteWidth", "w:balanceSingleByteDoubleByteWidth"],
    ["noExtraLineSpacing", "w:noExtraLineSpacing"],
    ["doNotLeaveBackslashAlone", "w:doNotLeaveBackslashAlone"],
    ["underlineTrailingSpaces", "w:ulTrailSpace"],
    ["doNotExpandShiftReturn", "w:doNotExpandShiftReturn"],
    ["spacingInWholePoints", "w:spacingInWholePoints"],
    ["lineWrapLikeWord6", "w:lineWrapLikeWord6"],
    ["printBodyTextBeforeHeader", "w:printBodyTextBeforeHeader"],
    ["printColorsBlack", "w:printColBlack"],
    ["spaceWidth", "w:wpSpaceWidth"],
    ["showBreaksInFrames", "w:showBreaksInFrames"],
    ["subFontBySize", "w:subFontBySize"],
    ["suppressBottomSpacing", "w:suppressBottomSpacing"],
    ["suppressTopSpacing", "w:suppressTopSpacing"],
    ["suppressSpacingAtTopOfPage", "w:suppressSpacingAtTopOfPage"],
    ["suppressTopSpacingWP", "w:suppressTopSpacingWP"],
    ["suppressSpBfAfterPgBrk", "w:suppressSpBfAfterPgBrk"],
    ["swapBordersFacingPages", "w:swapBordersFacingPages"],
    ["convertMailMergeEsc", "w:convMailMergeEsc"],
    ["truncateFontHeightsLikeWP6", "w:truncateFontHeightsLikeWP6"],
    ["macWordSmallCaps", "w:mwSmallCaps"],
    ["usePrinterMetrics", "w:usePrinterMetrics"],
    ["doNotSuppressParagraphBorders", "w:doNotSuppressParagraphBorders"],
    ["wrapTrailSpaces", "w:wrapTrailSpaces"],
    ["footnoteLayoutLikeWW8", "w:footnoteLayoutLikeWW8"],
    ["shapeLayoutLikeWW8", "w:shapeLayoutLikeWW8"],
    ["alignTablesRowByRow", "w:alignTablesRowByRow"],
    ["forgetLastTabAlignment", "w:forgetLastTabAlignment"],
    ["adjustLineHeightInTable", "w:adjustLineHeightInTable"],
    ["autoSpaceLikeWord95", "w:autoSpaceLikeWord95"],
    ["noSpaceRaiseLower", "w:noSpaceRaiseLower"],
    ["doNotUseHTMLParagraphAutoSpacing", "w:doNotUseHTMLParagraphAutoSpacing"],
    ["layoutRawTableWidth", "w:layoutRawTableWidth"],
    ["layoutTableRowsApart", "w:layoutTableRowsApart"],
    ["useWord97LineBreakRules", "w:useWord97LineBreakRules"],
    ["doNotBreakWrappedTables", "w:doNotBreakWrappedTables"],
    ["doNotSnapToGridInCell", "w:doNotSnapToGridInCell"],
    ["selectFieldWithFirstOrLastCharacter", "w:selectFldWithFirstOrLastChar"],
    ["applyBreakingRules", "w:applyBreakingRules"],
    ["doNotWrapTextWithPunctuation", "w:doNotWrapTextWithPunct"],
    ["doNotUseEastAsianBreakRules", "w:doNotUseEastAsianBreakRules"],
    ["useWord2002TableStyleRules", "w:useWord2002TableStyleRules"],
    ["growAutofit", "w:growAutofit"],
    ["useFELayout", "w:useFELayout"],
    ["useNormalStyleForList", "w:useNormalStyleForList"],
    ["doNotUseIndentAsNumberingTabStop", "w:doNotUseIndentAsNumberingTabStop"],
    ["useAlternateEastAsianLineBreakRules", "w:useAltKinsokuLineBreakRules"],
    ["allowSpaceOfSameStyleInTable", "w:allowSpaceOfSameStyleInTable"],
    ["doNotSuppressIndentation", "w:doNotSuppressIndentation"],
    ["doNotAutofitConstrainedTables", "w:doNotAutofitConstrainedTables"],
    ["autofitToFirstFixedWidthCell", "w:autofitToFirstFixedWidthCell"],
    ["underlineTabInNumberingList", "w:underlineTabInNumList"],
    ["displayHangulFixedWidth", "w:displayHangulFixedWidth"],
    ["splitPgBreakAndParaMark", "w:splitPgBreakAndParaMark"],
    ["doNotVerticallyAlignCellWithSp", "w:doNotVertAlignCellWithSp"],
    ["doNotBreakConstrainedForcedTable", "w:doNotBreakConstrainedForcedTable"],
    ["ignoreVerticalAlignmentInTextboxes", "w:doNotVertAlignInTxbx"],
    ["useAnsiKerningPairs", "w:useAnsiKerningPairs"],
    ["cachedColumnBalance", "w:cachedColBalance"],
];

export class Compatibility extends XmlComponent {
    public constructor(options: ICompatibilityOptions) {
        super("w:compat");

        // Explicit false must be emitted too — a CT_OnOff element with
        // w:val="false" overrides an inherited/default true.
        for (const [key, elementName] of COMPATIBILITY_OPTIONS) {
            const value = options[key];
            if (value !== undefined) {
                this.root.push(new OnOffElement(elementName, value));
            }
        }

        // Per the CT_Compat sequence, compatSetting comes last.
        if (options.version) {
            this.root.push(new CompatibilitySetting(options.version));
        }
    }
}
