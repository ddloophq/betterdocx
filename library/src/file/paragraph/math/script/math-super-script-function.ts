// http://www.datypic.com/sc/ooxml/e-m_sSup-1.html
// http://www.datypic.com/sc/ooxml/e-m_sSupPr-1.html
import { BuilderElement, XmlComponent } from "@file/xml-components";

import { createMathElement } from "../create-math-element";
import type { MathComponent } from "../math-component";
import { createMathBase, createMathSuperScriptElement } from "../n-ary";

export const createMathSuperScriptProperties = (): XmlComponent => createMathElement("m:sSupPr");

export type IMathSuperScriptOptions = {
    readonly children: readonly MathComponent[];
    readonly superScript: readonly MathComponent[];
};

export class MathSuperScript extends BuilderElement {
    public constructor(options: IMathSuperScriptOptions) {
        super({
            name: "m:sSup",
            children: [
                createMathSuperScriptProperties(),
                createMathBase({ children: options.children }),
                createMathSuperScriptElement({ children: options.superScript }),
            ],
        });
    }
}
