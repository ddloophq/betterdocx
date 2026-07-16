import { IRenderSession } from "./render-session";
import { IXmlableObject } from "./xmlable-object";

export type IContext = {
    /** Narrow, serialization-scoped services available to XML components. */
    readonly session: IRenderSession;

    readonly stack: BaseXmlComponent[];
};

export abstract class BaseXmlComponent {
    protected readonly rootKey: string;

    public constructor(rootKey: string) {
        this.rootKey = rootKey;
    }

    public abstract prepForXml(context: IContext): IXmlableObject | undefined;
}
