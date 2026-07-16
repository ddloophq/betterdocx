import { XmlComponent } from "@file/xml-components";

import { IViewWrapper } from "./document-wrapper";
import { FooterView } from "./footer/footer";
import { Media } from "./media";
import { Paragraph } from "./paragraph";
import { Relationships } from "./relationships";
import { Table } from "./table";

export class FooterWrapper implements IViewWrapper {
    private readonly footer: FooterView;
    private readonly relationships: Relationships;

    public constructor(
        private readonly media: Media,
        referenceId: number,
        initContent?: XmlComponent,
    ) {
        this.footer = new FooterView(referenceId, initContent);
        this.relationships = new Relationships();
    }

    public add(item: Paragraph | Table): void {
        this.footer.add(item);
    }

    public addChildElement(childElement: XmlComponent | string): void {
        this.footer.addChildElement(childElement);
    }

    public get View(): FooterView {
        return this.footer;
    }

    public get Relationships(): Relationships {
        return this.relationships;
    }

    public get Media(): Media {
        return this.media;
    }
}
