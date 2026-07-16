// http://officeopenxml.com/WPdocument.php
import { XmlComponent } from "@file/xml-components";

import { ConcreteHyperlink, Paragraph } from "../paragraph";
import { Table } from "../table";
import { TableOfContents } from "../table-of-contents";
import { Body } from "./body";
import { DOCUMENT_ROOT_ATTRIBUTE_NAMESPACES, DocumentAttributes } from "./document-attributes";
import { DocumentBackground, IDocumentBackgroundOptions } from "./document-background";

export type IDocumentOptions = {
    readonly background?: IDocumentBackgroundOptions;
};

// <xsd:element name="document" type="CT_Document"/>
//
// <xsd:complexType name="CT_Document">
//     <xsd:complexContent>
//         <xsd:extension base="CT_DocumentBase">
//             <xsd:sequence>
//                 <xsd:element name="body" type="CT_Body" minOccurs="0" maxOccurs="1"/>
//             </xsd:sequence>
//             <xsd:attribute name="conformance" type="s:ST_ConformanceClass"/>
//             <xsd:attribute ref="mc:Ignorable" use="optional" />
//         </xsd:extension>
//     </xsd:complexContent>
// </xsd:complexType>
//
// <xsd:complexType name="CT_DocumentBase">
//     <xsd:sequence>
//         <xsd:element name="background" type="CT_Background" minOccurs="0"/>
//     </xsd:sequence>
// </xsd:complexType>
export class Document extends XmlComponent {
    private readonly body: Body;

    public constructor(options: IDocumentOptions) {
        super("w:document");
        this.root.push(new DocumentAttributes(DOCUMENT_ROOT_ATTRIBUTE_NAMESPACES, "w14 w15 wp14"));
        this.body = new Body();
        if (options.background) {
            this.root.push(new DocumentBackground(options.background));
        }
        this.root.push(this.body);
    }

    public add(item: Paragraph | Table | TableOfContents | ConcreteHyperlink): Document {
        this.body.push(item);
        return this;
    }

    public get Body(): Body {
        return this.body;
    }
}
