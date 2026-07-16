// http://officeopenxml.com/WPfooters.php
import { InitializableXmlComponent, XmlComponent } from "@file/xml-components";

import {
    DocumentAttributes,
    HEADER_FOOTER_ATTRIBUTE_NAMESPACES,
} from "../document/document-attributes";
import { Paragraph } from "../paragraph";
import { Table } from "../table";

export class FooterView extends InitializableXmlComponent {
    private readonly refId: number;

    public constructor(referenceNumber: number, initContent?: XmlComponent) {
        super("w:ftr", initContent);
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
