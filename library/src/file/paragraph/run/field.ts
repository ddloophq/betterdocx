import { SpaceType } from "@file/shared";
import { XmlAttributeComponent, XmlComponent } from "@file/xml-components";

import { TextAttributes } from "./text-attributes";

const FieldCharacterType = {
    BEGIN: "begin",
    END: "end",
    SEPARATE: "separate",
} as const;

class FidCharAttrs extends XmlAttributeComponent<{
    readonly type: (typeof FieldCharacterType)[keyof typeof FieldCharacterType];
    readonly dirty?: boolean;
}> {
    protected readonly xmlKeys = { type: "w:fldCharType", dirty: "w:dirty" };
}

export class Begin extends XmlComponent {
    public constructor(dirty?: boolean) {
        super("w:fldChar");
        this.root.push(new FidCharAttrs({ type: FieldCharacterType.BEGIN, dirty }));
    }
}

export class Separate extends XmlComponent {
    public constructor(dirty?: boolean) {
        super("w:fldChar");
        this.root.push(new FidCharAttrs({ type: FieldCharacterType.SEPARATE, dirty }));
    }
}

export class End extends XmlComponent {
    public constructor(dirty?: boolean) {
        super("w:fldChar");
        this.root.push(new FidCharAttrs({ type: FieldCharacterType.END, dirty }));
    }
}

/**
 * Instruction text (`<w:instrText>`) holding a raw field code, e.g. `DATE` or
 * `SEQ Figure`. Place it between a `Begin` and a `Separate`/`End` field
 * character to assemble a custom complex field.
 */
export class InstructionText extends XmlComponent {
    public constructor(instruction: string) {
        super("w:instrText");
        this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
        this.root.push(instruction);
    }
}
