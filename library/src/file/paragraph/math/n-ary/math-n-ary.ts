// http://www.datypic.com/sc/ooxml/e-m_nary-1.html
import { BuilderElement } from "@file/xml-components";

import type { MathComponent } from "../math-component";
import {
    createMathBase,
    createMathSubScriptElement,
    createMathSuperScriptElement,
} from "./math-base";
import { createMathNAryProperties } from "./math-n-ary-properties";

type MathNAryOptions = {
    readonly children: readonly MathComponent[];
    readonly subScript?: readonly MathComponent[];
    readonly superScript?: readonly MathComponent[];
};

export type IMathSumOptions = MathNAryOptions;
export type IMathIntegralOptions = MathNAryOptions;

class MathNAry extends BuilderElement {
    public constructor(
        { children, subScript, superScript }: MathNAryOptions,
        accent: string,
        limitLocationVal?: string,
    ) {
        super({
            name: "m:nary",
            children: [
                createMathNAryProperties({
                    accent,
                    hasSuperScript: !!superScript,
                    hasSubScript: !!subScript,
                    limitLocationVal,
                }),
                ...(subScript ? [createMathSubScriptElement({ children: subScript })] : []),
                ...(superScript ? [createMathSuperScriptElement({ children: superScript })] : []),
                createMathBase({ children }),
            ],
        });
    }
}

export class MathSum extends MathNAry {
    public constructor(options: IMathSumOptions) {
        super(options, "∑");
    }
}

export class MathIntegral extends MathNAry {
    public constructor(options: IMathIntegralOptions) {
        super(options, "", "subSup");
    }
}
