// http://www.datypic.com/sc/ooxml/e-m_sSubSup-1.html
// http://www.datypic.com/sc/ooxml/e-m_sSubSupPr-1.html
import { BuilderElement, XmlComponent } from "@file/xml-components";

import { createMathElement } from "../create-math-element";
import type { MathComponent } from "../math-component";
import { createMathBase, createMathSubScriptElement, createMathSuperScriptElement } from "../n-ary";

export const createMathSubSuperScriptProperties = (): XmlComponent =>
    createMathElement("m:sSubSupPr");

export type IMathSubSuperScriptOptions = {
    readonly children: readonly MathComponent[];
    readonly subScript: readonly MathComponent[];
    readonly superScript: readonly MathComponent[];
};

export class MathSubSuperScript extends BuilderElement {
    public constructor(options: IMathSubSuperScriptOptions) {
        super({
            name: "m:sSubSup",
            children: [
                createMathSubSuperScriptProperties(),
                createMathBase({ children: options.children }),
                createMathSubScriptElement({ children: options.subScript }),
                createMathSuperScriptElement({ children: options.superScript }),
            ],
        });
    }
}
