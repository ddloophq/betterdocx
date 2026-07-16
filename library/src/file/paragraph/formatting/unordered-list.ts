import { Attributes, IContext, IXmlableObject, XmlComponent } from "@file/xml-components";
import { validateNumberingLevel } from "@file/numbering/validation";

export type NumberingReference = {
    readonly reference: string;
    readonly instance: number;
};

export class NumberProperties extends XmlComponent {
    public constructor(numberId: number | string | NumberingReference, indentLevel: number) {
        super("w:numPr");
        this.root.push(new IndentLevel(indentLevel));
        this.root.push(new NumberId(numberId));
    }
}

class IndentLevel extends XmlComponent {
    public constructor(level: number) {
        super("w:ilvl");

        validateNumberingLevel(level);

        this.root.push(
            new Attributes({
                val: level,
            }),
        );
    }
}

class NumberId extends XmlComponent {
    public constructor(private readonly id: number | string | NumberingReference) {
        super("w:numId");
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        const resolvedValue =
            typeof this.id === "object"
                ? (context.session.numbering?.resolve(this.id.reference, this.id.instance) ??
                  `{${this.id.reference}-${this.id.instance}}`)
                : typeof this.id === "string"
                  ? `{${this.id}}`
                  : this.id;
        const value =
            typeof resolvedValue === "number" && !Number.isFinite(resolvedValue)
                ? typeof this.id === "object"
                    ? `{${this.id.reference}-${this.id.instance}}`
                    : resolvedValue
                : resolvedValue;

        this.root.push(new Attributes({ val: value }));
        try {
            return super.prepForXml(context);
        } finally {
            this.root.pop();
        }
    }
}
