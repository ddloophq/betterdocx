import { XmlComponent } from "@file/xml-components";

import {
    DeletedCurrentSection,
    DeletedNumberOfPages,
    DeletedNumberOfPagesSection,
    DeletedPage,
} from "./deleted-page-number";
import { DeletedText } from "./deleted-text";
import { Break } from "../../paragraph/run/break";
import { Begin, End, Separate } from "../../paragraph/run/field";
import { RunProperties } from "../../paragraph/run/properties";
import { IRunOptions, PageNumberField, PageNumberFieldType } from "../../paragraph/run/run";
import { ChangeAttributes, IChangedAttributesProperties } from "../track-revision";

type IDeletedRunOptions = IRunOptions & IChangedAttributesProperties;

export class DeletedTextRun extends XmlComponent {
    protected readonly deletedTextRunWrapper: DeletedTextRunWrapper;

    public constructor(options: IDeletedRunOptions) {
        super("w:del");
        this.root.push(
            new ChangeAttributes({
                id: options.id,
                author: options.author,
                date: options.date,
            }),
        );
        this.deletedTextRunWrapper = new DeletedTextRunWrapper(options);
        this.addChildElement(this.deletedTextRunWrapper);
    }
}

class DeletedTextRunWrapper extends XmlComponent {
    public constructor(options: IRunOptions) {
        super("w:r");
        this.root.push(new RunProperties(options));

        if (options.children) {
            for (const child of options.children) {
                if (typeof child === "string") {
                    this.root.push(new DeletedText(child));
                    continue;
                }

                if (child instanceof PageNumberField) {
                    this.root.push(new Begin());

                    switch (child.type) {
                        case PageNumberFieldType.CURRENT:
                            this.root.push(new DeletedPage());
                            break;
                        case PageNumberFieldType.TOTAL_PAGES:
                            this.root.push(new DeletedNumberOfPages());
                            break;
                        case PageNumberFieldType.TOTAL_PAGES_IN_SECTION:
                            this.root.push(new DeletedNumberOfPagesSection());
                            break;
                        case PageNumberFieldType.CURRENT_SECTION:
                            this.root.push(new DeletedCurrentSection());
                            break;
                    }

                    this.root.push(new Separate());
                    this.root.push(new End());
                    continue;
                }

                this.root.push(child);
            }
        } else if (options.text) {
            this.root.push(new DeletedText(options.text));
        }

        if (options.break) {
            this.root.splice(1, 0, ...Array.from({ length: options.break }, () => new Break()));
        }
    }
}
