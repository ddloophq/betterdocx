// http://officeopenxml.com/WPheaders.php
import { InitializableXmlComponent, XmlComponent } from "@file/xml-components";

import {
    DocumentAttributes,
    HEADER_FOOTER_ATTRIBUTE_NAMESPACES,
} from "../document/document-attributes";
import { Paragraph } from "../paragraph";
import { Table } from "../table";

export class HeaderView extends InitializableXmlComponent {
    private readonly refId: number;

    public constructor(referenceNumber: number, initContent?: XmlComponent) {
        super("w:hdr", initContent);

        this.refId = referenceNumber;
        if (!initContent) {
            this.root.push(new DocumentAttributes(HEADER_FOOTER_ATTRIBUTE_NAMESPACES));
        }
    }

    public get ReferenceId(): number {
        return this.refId;
    }

    public add(item: Paragraph | Table): void {
        this.root.push(item);
    }
}
