// http://www.datypic.com/sc/ooxml/e-m_func-1.html
// http://www.datypic.com/sc/ooxml/e-m_funcPr-1.html
// http://www.datypic.com/sc/ooxml/e-m_fName-1.html
import { BuilderElement } from "@file/xml-components";

import type { MathComponent } from "../math-component";
import { createMathBase } from "../n-ary";

export class MathFunctionProperties extends BuilderElement {
    public constructor() {
        super({ name: "m:funcPr" });
    }
}

export class MathFunctionName extends BuilderElement {
    public constructor(children: readonly MathComponent[]) {
        super({ name: "m:fName", children });
    }
}

export type IMathFunctionOptions = {
    readonly children: readonly MathComponent[];
    readonly name: readonly MathComponent[];
};

export class MathFunction extends BuilderElement {
    public constructor(options: IMathFunctionOptions) {
        super({
            name: "m:func",
            children: [
                new MathFunctionProperties(),
                new MathFunctionName(options.name),
                createMathBase({ children: options.children }),
            ],
        });
    }
}
