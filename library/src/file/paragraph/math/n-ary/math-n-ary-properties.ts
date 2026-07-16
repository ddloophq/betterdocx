// http://www.datypic.com/sc/ooxml/e-m_naryPr-1.html
// http://www.datypic.com/sc/ooxml/e-m_chr-1.html
// http://www.datypic.com/sc/ooxml/e-m_limLoc-1.html
// http://www.datypic.com/sc/ooxml/e-m_subHide-1.html
// http://www.datypic.com/sc/ooxml/e-m_supHide-1.html
import type { XmlComponent } from "@file/xml-components";

import { createMathElement, createMathValElement } from "../create-math-element";

export const createMathAccentCharacter = ({ accent }: { readonly accent: string }): XmlComponent =>
    createMathValElement("m:chr", accent);

export const createMathLimitLocation = ({ value }: { readonly value?: string }): XmlComponent =>
    createMathValElement("m:limLoc", value ?? "undOvr");

type MathNAryPropertiesOptions = {
    readonly accent: string;
    readonly hasSuperScript: boolean;
    readonly hasSubScript: boolean;
    readonly limitLocationVal?: string;
};

export const createMathNAryProperties = ({
    accent,
    hasSuperScript,
    hasSubScript,
    limitLocationVal,
}: MathNAryPropertiesOptions): XmlComponent =>
    createMathElement("m:naryPr", [
        ...(accent ? [createMathAccentCharacter({ accent })] : []),
        createMathLimitLocation({ value: limitLocationVal }),
        ...(!hasSuperScript ? [createMathValElement("m:supHide", 1)] : []),
        ...(!hasSubScript ? [createMathValElement("m:subHide", 1)] : []),
    ]);
