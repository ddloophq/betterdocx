// <xsd:complexType name="CT_SdtCheckbox">
//    <xsd:sequence>
//        <xsd:element name="checked" type="CT_OnOff" minOccurs="0"/>
//        <xsd:element name="checkedState" type="CT_SdtCheckboxSymbol" minOccurs="0"/>
//        <xsd:element name="uncheckedState" type="CT_SdtCheckboxSymbol" minOccurs="0"/>
//    </xsd:sequence>
// </xsd:complexType>
// <xsd:element name="checkbox" type="CT_SdtCheckbox"/>

import { CheckBoxSymbolElement } from "@file/checkbox/checkbox-symbol";
import { XmlComponent } from "@file/xml-components";

export type ICheckboxSymbolProperties = {
    readonly value?: string;
    readonly font?: string;
};

export type ICheckboxSymbolOptions = {
    readonly alias?: string;
    readonly checked?: boolean;
    readonly checkedState?: ICheckboxSymbolProperties;
    readonly uncheckedState?: ICheckboxSymbolProperties;
};

// default values per Microsoft
const DEFAULT_UNCHECKED_SYMBOL = "2610";
const DEFAULT_CHECKED_SYMBOL = "2612";
const DEFAULT_FONT = "MS Gothic";

// Resolves the symbol/font pair for the given checkbox state, falling back to
// the Microsoft defaults. Shared by the sdt properties and the rendered run.
export const resolveCheckboxSymbol = (
    options: ICheckboxSymbolOptions | undefined,
    checked: boolean,
): { readonly symbol: string; readonly font: string } => {
    const state = checked ? options?.checkedState : options?.uncheckedState;
    return {
        symbol: state?.value ?? (checked ? DEFAULT_CHECKED_SYMBOL : DEFAULT_UNCHECKED_SYMBOL),
        font: state?.font ?? DEFAULT_FONT,
    };
};

export class CheckBoxUtil extends XmlComponent {
    public constructor(options?: ICheckboxSymbolOptions) {
        super("w14:checkbox");

        this.root.push(new CheckBoxSymbolElement("w14:checked", options?.checked ? "1" : "0"));

        const checkedState = resolveCheckboxSymbol(options, true);
        this.root.push(
            new CheckBoxSymbolElement("w14:checkedState", checkedState.symbol, checkedState.font),
        );

        const uncheckedState = resolveCheckboxSymbol(options, false);
        this.root.push(
            new CheckBoxSymbolElement(
                "w14:uncheckedState",
                uncheckedState.symbol,
                uncheckedState.font,
            ),
        );
    }
}
