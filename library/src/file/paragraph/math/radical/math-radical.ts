// http://www.datypic.com/sc/ooxml/e-m_rad-1.html
// http://www.datypic.com/sc/ooxml/e-m_radPr-1.html
// http://www.datypic.com/sc/ooxml/e-m_deg-1.html
// http://www.datypic.com/sc/ooxml/e-m_degHide-1.html
import { BuilderElement } from "@file/xml-components";

import { createMathValElement } from "../create-math-element";
import type { MathComponent } from "../math-component";
import { createMathBase } from "../n-ary";

export class MathRadicalProperties extends BuilderElement {
    public constructor(hasDegree: boolean) {
        super({
            name: "m:radPr",
            children: hasDegree ? [] : [createMathValElement("m:degHide", 1)],
        });
    }
}

export class MathDegree extends BuilderElement {
    public constructor(children?: readonly MathComponent[]) {
        super({ name: "m:deg", children });
    }
}

export type IMathRadicalOptions = {
    readonly children: readonly MathComponent[];
    readonly degree?: readonly MathComponent[];
};

export class MathRadical extends BuilderElement {
    public constructor(options: IMathRadicalOptions) {
        super({
            name: "m:rad",
            children: [
                new MathRadicalProperties(!!options.degree),
                new MathDegree(options.degree),
                createMathBase({ children: options.children }),
            ],
        });
    }
}
