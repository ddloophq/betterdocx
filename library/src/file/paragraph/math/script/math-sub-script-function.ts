// http://www.datypic.com/sc/ooxml/e-m_sSub-1.html
// http://www.datypic.com/sc/ooxml/e-m_sSubPr-1.html
import { BuilderElement, XmlComponent } from "@file/xml-components";

import { createMathElement } from "../create-math-element";
import type { MathComponent } from "../math-component";
import { createMathBase, createMathSubScriptElement } from "../n-ary";

export const createMathSubScriptProperties = (): XmlComponent => createMathElement("m:sSubPr");

export type IMathSubScriptOptions = {
    readonly children: readonly MathComponent[];
    readonly subScript: readonly MathComponent[];
};

export class MathSubScript extends BuilderElement {
    public constructor(options: IMathSubScriptOptions) {
        super({
            name: "m:sSub",
            children: [
                createMathSubScriptProperties(),
                createMathBase({ children: options.children }),
                createMathSubScriptElement({ children: options.subScript }),
            ],
        });
    }
}
