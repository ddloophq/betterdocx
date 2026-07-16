// http://www.datypic.com/sc/ooxml/e-m_f-1.html
// http://www.datypic.com/sc/ooxml/e-m_num-1.html
// http://www.datypic.com/sc/ooxml/e-m_den-1.html
import { BuilderElement } from "@file/xml-components";

import type { MathComponent } from "../math-component";

export class MathNumerator extends BuilderElement {
    public constructor(children: readonly MathComponent[]) {
        super({ name: "m:num", children });
    }
}

export class MathDenominator extends BuilderElement {
    public constructor(children: readonly MathComponent[]) {
        super({ name: "m:den", children });
    }
}

export type IMathFractionOptions = {
    readonly numerator: readonly MathComponent[];
    readonly denominator: readonly MathComponent[];
};

export class MathFraction extends BuilderElement {
    public constructor(options: IMathFractionOptions) {
        super({
            name: "m:f",
            children: [
                new MathNumerator(options.numerator),
                new MathDenominator(options.denominator),
            ],
        });
    }
}
