// http://officeopenxml.com/WPbookmark.php
import { IContext, IXmlableObject, XmlComponent } from "@file/xml-components";

import { ParagraphChild } from "../paragraph";
import { BookmarkEndAttributes, BookmarkStartAttributes } from "./bookmark-attributes";

// BookmarkStart and BookmarkEnd of the same Bookmark share one holder, so both
// resolve to the same w:id. A completed start/end pair is removed from the
// session map, so reusing one Bookmark object creates a fresh id per occurrence.
type BookmarkIdHolder = {
    readonly pendingIdsBySession: WeakMap<object, number>;
};

const resolveBookmarkStartId = (holder: BookmarkIdHolder, context: IContext): number => {
    const existingId = holder.pendingIdsBySession.get(context.session);
    if (existingId !== undefined) {
        return existingId;
    }

    const id = context.session.ids.nextBookmarkId();
    holder.pendingIdsBySession.set(context.session, id);
    return id;
};

const resolveBookmarkEndId = (holder: BookmarkIdHolder, context: IContext): number => {
    const id =
        holder.pendingIdsBySession.get(context.session) ?? context.session.ids.nextBookmarkId();
    holder.pendingIdsBySession.delete(context.session);

    return id;
};

export class Bookmark {
    public readonly start: BookmarkStart;
    public readonly children: readonly ParagraphChild[];
    public readonly end: BookmarkEnd;

    public constructor(options: {
        readonly id: string;
        readonly children: readonly ParagraphChild[];
    }) {
        const linkId: BookmarkIdHolder = { pendingIdsBySession: new WeakMap() };

        this.start = new BookmarkStart(options.id, linkId);
        this.children = options.children;
        this.end = new BookmarkEnd(linkId);
    }
}

// <xsd:element name="bookmarkStart" type="CT_Bookmark"/>
// <xsd:element name="bookmarkEnd" type="CT_MarkupRange"/>

// <xsd:complexType name="CT_Bookmark">
//   <xsd:complexContent>
//     <xsd:extension base="CT_BookmarkRange">
//     <xsd:attribute name="name" type="s:ST_String" use="required"/>
//     </xsd:extension>
//   </xsd:complexContent>
// </xsd:complexType>

// <xsd:complexType name="CT_BookmarkRange">
//   <xsd:complexContent>
//     <xsd:extension base="CT_MarkupRange">
//       <xsd:attribute name="colFirst" type="ST_DecimalNumber" use="optional"/>
//       <xsd:attribute name="colLast" type="ST_DecimalNumber" use="optional"/>
//     </xsd:extension>
//   </xsd:complexContent>
// </xsd:complexType>

// <xsd:complexType name="CT_MarkupRange">
//   <xsd:complexContent>
//     <xsd:extension base="CT_Markup">
//       <xsd:attribute name="displacedByCustomXml" type="ST_DisplacedByCustomXml" use="optional"/>
//     </xsd:extension>
//   </xsd:complexContent>
// </xsd:complexType>

// <xsd:complexType name="CT_Markup">
//   <xsd:attribute name="id" type="ST_DecimalNumber" use="required"/>
// </xsd:complexType>

export class BookmarkStart extends XmlComponent {
    public constructor(
        private readonly name: string,
        private readonly linkId: BookmarkIdHolder,
    ) {
        super("w:bookmarkStart");
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        this.root.push(
            new BookmarkStartAttributes({
                name: this.name,
                id: resolveBookmarkStartId(this.linkId, context),
            }),
        );

        try {
            return super.prepForXml(context);
        } finally {
            this.root.pop();
        }
    }
}

export class BookmarkEnd extends XmlComponent {
    public constructor(private readonly linkId: BookmarkIdHolder) {
        super("w:bookmarkEnd");
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        this.root.push(
            new BookmarkEndAttributes({
                id: resolveBookmarkEndId(this.linkId, context),
            }),
        );

        try {
            return super.prepForXml(context);
        } finally {
            this.root.pop();
        }
    }
}
