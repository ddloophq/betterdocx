import { XmlComponent } from "@file/xml-components";

import { IViewWrapper } from "./document-wrapper";
import { HeaderView } from "./header/header";
import { Media } from "./media";
import { Paragraph } from "./paragraph";
import { Relationships } from "./relationships";
import { Table } from "./table";

export class HeaderWrapper implements IViewWrapper {
    private readonly header: HeaderView;
    private readonly relationships: Relationships;

    public constructor(
        private readonly media: Media,
        referenceId: number,
        initContent?: XmlComponent,
    ) {
        this.header = new HeaderView(referenceId, initContent);
        this.relationships = new Relationships();
    }

    public add(item: Paragraph | Table): void {
        this.header.add(item);
    }

    public addChildElement(childElement: XmlComponent | string): void {
        this.header.addChildElement(childElement);
    }

    public get View(): HeaderView {
        return this.header;
    }

    public get Relationships(): Relationships {
        return this.relationships;
    }

    public get Media(): Media {
        return this.media;
    }
}
