import { Document, IDocumentOptions } from "./document";
import { FooterView } from "./footer/footer";
import { FootNotes } from "./footnotes";
import { HeaderView } from "./header/header";
import { Relationships } from "./relationships";
import { XmlComponent } from "./xml-components";

export type IViewWrapper = {
    readonly View: Document | FooterView | HeaderView | FootNotes | XmlComponent;
    readonly Relationships: Relationships;
};

export class DocumentWrapper implements IViewWrapper {
    private readonly document: Document;
    private readonly relationships: Relationships;

    public constructor(options: IDocumentOptions) {
        this.document = new Document(options);
        this.relationships = new Relationships();
    }

    public get View(): Document {
        return this.document;
    }

    public get Relationships(): Relationships {
        return this.relationships;
    }
}
