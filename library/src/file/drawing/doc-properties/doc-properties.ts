// https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_docPr_topic_ID0ES32OB.html
import { ConcreteHyperlink } from "@file/paragraph";
import {
    IContext,
    IXmlableObject,
    NextAttributeComponent,
    XmlComponent,
} from "@file/xml-components";

import { createHyperlinkClick } from "./doc-properties-children";

// <complexType name="CT_NonVisualDrawingProps">
//     <sequence>
//         <element name="hlinkClick" type="CT_Hyperlink" minOccurs="0" maxOccurs="1" />
//         <element name="hlinkHover" type="CT_Hyperlink" minOccurs="0" maxOccurs="1" />
//         <element name="extLst" type="CT_OfficeArtExtensionList" minOccurs="0" maxOccurs="1" />
//     </sequence>
//     <attribute name="id" type="ST_DrawingElementId" use="required" />
//     <attribute name="name" type="xsd:string" use="required" />
//     <attribute name="descr" type="xsd:string" use="optional" default="" />
//     <attribute name="hidden" type="xsd:boolean" use="optional" default="false" />
// </complexType>

export type DocPropertiesOptions = {
    readonly name: string;
    readonly description?: string;
    readonly title?: string;
};

export class DocProperties extends XmlComponent {
    private readonly options: DocPropertiesOptions;

    public constructor(
        options: DocPropertiesOptions = {
            name: "",
            description: "",
            title: "",
        },
    ) {
        super("wp:docPr");
        this.options = options;
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        // The id must be unique per document (ST_DrawingElementId), so it is
        // allocated at serialization time from the file-level counter.
        const id = context.session.ids.nextDrawingId();

        const attributes: Record<
            string,
            { readonly key: string; readonly value: string | number }
        > = {
            id: {
                key: "id",
                value: id,
            },
            name: {
                key: "name",
                value: this.options.name,
            },
        };

        if (this.options.description !== null && this.options.description !== undefined) {
            attributes.description = {
                key: "descr",
                value: this.options.description,
            };
        }

        if (this.options.title !== null && this.options.title !== undefined) {
            attributes.title = {
                key: "title",
                value: this.options.title,
            };
        }

        // Push transiently and truncate afterwards so serializing the same
        // component twice does not accumulate duplicate attribute or
        // hlinkClick elements.
        const initialRootLength = this.root.length;
        this.root.push(new NextAttributeComponent(attributes));

        for (let i = context.stack.length - 1; i >= 0; i--) {
            const element = context.stack[i];
            if (element instanceof ConcreteHyperlink) {
                this.root.push(createHyperlinkClick(element.linkId, true));
                break;
            }
        }

        try {
            return super.prepForXml(context);
        } finally {
            this.root.length = initialRootLength;
        }
    }
}
