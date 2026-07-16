import { SymbolRun } from "@file/paragraph/run/symbol-run";
import { StructuredDocumentTagContent } from "@file/table-of-contents/sdt-content";
import { StructuredDocumentTagProperties } from "@file/table-of-contents/sdt-properties";
import { XmlComponent } from "@file/xml-components";

import { CheckBoxUtil, ICheckboxSymbolOptions, resolveCheckboxSymbol } from "./checkbox-util";

export class CheckBox extends XmlComponent {
    public constructor(options?: ICheckboxSymbolOptions) {
        super("w:sdt");

        const properties = new StructuredDocumentTagProperties(options?.alias);
        properties.addChildElement(new CheckBoxUtil(options));
        this.root.push(properties);

        const content = new StructuredDocumentTagContent();
        const { symbol, font } = resolveCheckboxSymbol(options, !!options?.checked);

        content.addChildElement(
            new SymbolRun({
                char: symbol,
                symbolFont: font,
            }),
        );
        this.root.push(content);
    }
}
