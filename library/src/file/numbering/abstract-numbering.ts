import { XmlAttributeComponent, XmlComponent } from "@file/xml-components";
import { decimalNumber } from "@util/values";

import { ILevelsOptions, Level } from "./level";
import { MultiLevelType } from "./multi-level-type";
import { validateNumberingLevel } from "./validation";

// <xsd:complexType name="CT_AbstractNum">
// <xsd:sequence>
//   <xsd:element name="nsid" type="CT_LongHexNumber" minOccurs="0"/>
//   <xsd:element name="multiLevelType" type="CT_MultiLevelType" minOccurs="0"/>
//   <xsd:element name="tmpl" type="CT_LongHexNumber" minOccurs="0"/>
//   <xsd:element name="name" type="CT_String" minOccurs="0"/>
//   <xsd:element name="styleLink" type="CT_String" minOccurs="0"/>
//   <xsd:element name="numStyleLink" type="CT_String" minOccurs="0"/>
//   <xsd:element name="lvl" type="CT_Lvl" minOccurs="0" maxOccurs="9"/>
// </xsd:sequence>
// <xsd:attribute name="abstractNumId" type="ST_DecimalNumber" use="required"/>
// </xsd:complexType>

// <xsd:attribute name="restartNumberingAfterBreak" type="w12:ST_OnOff"/>
// https://docs.microsoft.com/en-us/openspecs/office_standards/ms-docx/cbddeff8-01aa-4486-a48e-6a83dede4f13
class AbstractNumberingAttributes extends XmlAttributeComponent<{
    readonly abstractNumId: number;
    readonly restartNumberingAfterBreak: number;
}> {
    protected readonly xmlKeys = {
        abstractNumId: "w:abstractNumId",
        restartNumberingAfterBreak: "w15:restartNumberingAfterBreak",
    };
}

export class AbstractNumbering extends XmlComponent {
    public readonly id: number;

    public constructor(id: number, levelOptions: readonly ILevelsOptions[]) {
        super("w:abstractNum");

        const levels = new Set<number>();
        for (const option of levelOptions) {
            validateNumberingLevel(option.level);
            if (levels.has(option.level)) {
                throw new Error(`Duplicate numbering level '${option.level}'.`);
            }
            levels.add(option.level);
        }

        this.root.push(
            new AbstractNumberingAttributes({
                abstractNumId: decimalNumber(id),
                restartNumberingAfterBreak: 0,
            }),
        );
        this.root.push(new MultiLevelType("hybridMultilevel"));
        this.id = id;

        for (const option of levelOptions) {
            this.root.push(new Level(option));
        }
    }
}
