import { BaseXmlComponent, IContext } from "./base";
import { IXmlableObject } from "./xmlable-object";

export type AttributeMap<T> = Record<keyof T, string>;

export type AttributeData = Record<string, boolean | number | string>;
export type AttributePayload<T> = {
    readonly [P in keyof T]: { readonly key: string; readonly value: T[P] };
};

export abstract class XmlAttributeComponent<
    // oxlint-disable-next-line typescript/no-explicit-any -- attribute value bags
    T extends Record<string, any>,
> extends BaseXmlComponent {
    protected readonly xmlKeys?: AttributeMap<T>;

    public constructor(private readonly root: T) {
        super("_attr");
    }

    public prepForXml(_: IContext): IXmlableObject {
        const attrs: Record<string, string> = {};
        Object.entries(this.root).forEach(([key, value]) => {
            if (value !== undefined) {
                const newKey = (this.xmlKeys && this.xmlKeys[key]) || key;

                attrs[newKey] = value;
            }
        });
        return { _attr: attrs };
    }
}

export class NextAttributeComponent<T extends AttributeData> extends BaseXmlComponent {
    public constructor(private readonly root: AttributePayload<T>) {
        super("_attr");
    }

    public prepForXml(_: IContext): IXmlableObject {
        const attrs: Record<string, string | boolean | number> = {};
        for (const { key, value } of Object.values<{
            readonly key: string;
            readonly value: string | boolean | number;
        }>(this.root)) {
            if (value !== undefined) {
                attrs[key] = value;
            }
        }
        return { _attr: attrs };
    }
}
