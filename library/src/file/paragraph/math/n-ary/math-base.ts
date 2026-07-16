// http://www.datypic.com/sc/ooxml/e-m_e-1.html
// http://www.datypic.com/sc/ooxml/e-m_sub-3.html
// http://www.datypic.com/sc/ooxml/e-m_sup-3.html
import type { XmlComponent } from "@file/xml-components";

import { createMathElement } from "../create-math-element";
import type { MathComponent } from "../math-component";

type MathWrapperOptions = {
    readonly children: readonly MathComponent[];
};

export const createMathBase = ({ children }: MathWrapperOptions): XmlComponent =>
    createMathElement("m:e", children);

export const createMathSubScriptElement = ({ children }: MathWrapperOptions): XmlComponent =>
    createMathElement("m:sub", children);

export const createMathSuperScriptElement = ({ children }: MathWrapperOptions): XmlComponent =>
    createMathElement("m:sup", children);
