// http://www.datypic.com/sc/ooxml/e-m_d-1.html
// http://www.datypic.com/sc/ooxml/e-m_dPr-1.html
// http://www.datypic.com/sc/ooxml/e-m_begChr-1.html
// http://www.datypic.com/sc/ooxml/e-m_endChr-1.html
import { BuilderElement, XmlComponent } from "@file/xml-components";

import { createMathElement, createMathValElement } from "../create-math-element";
import type { MathComponent } from "../math-component";
import { createMathBase } from "../n-ary";

type MathBracketCharacters = {
    readonly beginningCharacter: string;
    readonly endingCharacter: string;
};

type MathBracketsOptions = {
    readonly children: readonly MathComponent[];
};

export const createMathBracketProperties = ({
    characters,
}: {
    readonly characters?: MathBracketCharacters;
}): XmlComponent =>
    createMathElement(
        "m:dPr",
        characters
            ? [
                  createMathValElement("m:begChr", characters.beginningCharacter),
                  createMathValElement("m:endChr", characters.endingCharacter),
              ]
            : [],
    );

class MathBrackets extends BuilderElement {
    public constructor(options: MathBracketsOptions, characters?: MathBracketCharacters) {
        super({
            name: "m:d",
            children: [
                createMathBracketProperties({ characters }),
                createMathBase({ children: options.children }),
            ],
        });
    }
}

export class MathRoundBrackets extends MathBrackets {
    public constructor(options: MathBracketsOptions) {
        super(options);
    }
}

export class MathSquareBrackets extends MathBrackets {
    public constructor(options: MathBracketsOptions) {
        super(options, { beginningCharacter: "[", endingCharacter: "]" });
    }
}

export class MathCurlyBrackets extends MathBrackets {
    public constructor(options: MathBracketsOptions) {
        super(options, { beginningCharacter: "{", endingCharacter: "}" });
    }
}

export class MathAngledBrackets extends MathBrackets {
    public constructor(options: MathBracketsOptions) {
        super(options, { beginningCharacter: "〈", endingCharacter: "〉" });
    }
}
