// https://www.datypic.com/sc/ooxml/e-m_bar-1.html
// https://www.datypic.com/sc/ooxml/e-m_barPr-1.html
// https://www.datypic.com/sc/ooxml/e-m_pos-1.html
import type { XmlComponent } from "@file/xml-components";

import { createMathElement, createMathValElement } from "../create-math-element";
import type { MathComponent } from "../math-component";
import { createMathBase } from "../n-ary";

export const createMathBarProperties = ({ type }: { readonly type: string }): XmlComponent =>
    createMathElement("m:barPr", [createMathValElement("m:pos", type)]);

type MathBarOptions = {
    readonly type: "top" | "bot";
    readonly children: readonly MathComponent[];
};

export const createMathBar = ({ type, children }: MathBarOptions): XmlComponent =>
    createMathElement("m:bar", [createMathBarProperties({ type }), createMathBase({ children })]);
