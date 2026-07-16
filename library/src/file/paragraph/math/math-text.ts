import { XmlComponent } from "@file/xml-components";

// Deliberately not exported from the package: a bare `m:t` is only valid
// inside other math elements and has no slot in the public MathComponent
// union — use `MathRun` instead.
export class MathText extends XmlComponent {
    public constructor(text: string) {
        super("m:t");

        this.root.push(text);
    }
}
