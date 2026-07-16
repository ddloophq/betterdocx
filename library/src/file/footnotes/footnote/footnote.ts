import { Paragraph } from "@file/paragraph";
import { XmlComponent } from "@file/xml-components";

import { FootnoteAttributes } from "./footnote-attributes";
import { validateFootnoteId } from "../footnote-id";
import { FootnoteRefRun } from "./run/footnote-ref-run";

export const FootnoteType = {
    SEPARATOR: "separator",
    CONTINUATION_SEPARATOR: "continuationSeparator",
    /** @deprecated Use {@link FootnoteType.SEPARATOR} instead (typo). Will be removed in a future version. */
    SEPERATOR: "separator",
    /** @deprecated Use {@link FootnoteType.CONTINUATION_SEPARATOR} instead (typo). Will be removed in a future version. */
    CONTINUATION_SEPERATOR: "continuationSeparator",
} as const;

export type IFootnoteOptions = {
    readonly id: number;
    readonly type?: (typeof FootnoteType)[keyof typeof FootnoteType];
    readonly children: readonly Paragraph[];
};

export class Footnote extends XmlComponent {
    public constructor(options: IFootnoteOptions) {
        super("w:footnote");
        if (options.type === undefined) {
            validateFootnoteId(options.id);
        }
        this.root.push(
            new FootnoteAttributes({
                type: options.type,
                id: options.id,
            }),
        );

        options.children.forEach((child, i) => {
            if (i === 0) {
                child.addRunToFront(new FootnoteRefRun());
            }

            this.root.push(child);
        });
    }
}
