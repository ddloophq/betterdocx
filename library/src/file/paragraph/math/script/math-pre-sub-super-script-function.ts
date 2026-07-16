// http://www.datypic.com/sc/ooxml/e-m_sPre-1.html
// http://www.datypic.com/sc/ooxml/e-m_sPrePr-1.html
import { BuilderElement, XmlComponent } from "@file/xml-components";

import { createMathElement } from "../create-math-element";
import type { MathComponent } from "../math-component";
import { createMathBase, createMathSubScriptElement, createMathSuperScriptElement } from "../n-ary";

export const createMathPreSubSuperScriptProperties = (): XmlComponent =>
    createMathElement("m:sPrePr");

export type IMathPreSubSuperScriptOptions = {
    readonly children: readonly MathComponent[];
    readonly subScript: readonly MathComponent[];
    readonly superScript: readonly MathComponent[];
};

export class MathPreSubSuperScript extends BuilderElement {
    public constructor({ children, subScript, superScript }: IMathPreSubSuperScriptOptions) {
        super({
            name: "m:sPre",
            children: [
                createMathPreSubSuperScriptProperties(),
                createMathBase({ children }),
                createMathSubScriptElement({ children: subScript }),
                createMathSuperScriptElement({ children: superScript }),
            ],
        });
    }
}
