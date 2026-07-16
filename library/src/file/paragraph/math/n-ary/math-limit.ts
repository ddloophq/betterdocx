// http://www.datypic.com/sc/ooxml/e-m_lim-1.html
// http://www.datypic.com/sc/ooxml/e-m_limUpp-1.html
// http://www.datypic.com/sc/ooxml/e-m_limLow-1.html
import { BuilderElement } from "@file/xml-components";

import type { MathComponent } from "../math-component";
import { createMathBase } from "./math-base";

export class MathLimit extends BuilderElement {
    public constructor(children: readonly MathComponent[]) {
        super({ name: "m:lim", children });
    }
}

type MathLimitUpperLowerOptions = {
    readonly children: readonly MathComponent[];
    readonly limit: readonly MathComponent[];
};

export type IMathLimitUpperOptions = MathLimitUpperLowerOptions;
export type IMathLimitLowerOptions = MathLimitUpperLowerOptions;

export class MathLimitUpper extends BuilderElement {
    public constructor(options: IMathLimitUpperOptions) {
        super({
            name: "m:limUpp",
            children: [
                createMathBase({ children: options.children }),
                new MathLimit(options.limit),
            ],
        });
    }
}

export class MathLimitLower extends BuilderElement {
    public constructor(options: IMathLimitLowerOptions) {
        super({
            name: "m:limLow",
            children: [
                createMathBase({ children: options.children }),
                new MathLimit(options.limit),
            ],
        });
    }
}
