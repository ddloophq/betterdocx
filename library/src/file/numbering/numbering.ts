// http://officeopenxml.com/WPnumbering.php
// https://stackoverflow.com/questions/58622437/purpose-of-abstractnum-and-numberinginstance
import { AlignmentType } from "@file/paragraph";
import { IContext, IXmlableObject, XmlComponent } from "@file/xml-components";
import {
    UniqueNumericIdCreator,
    convertInchesToTwip,
    uniqueNumericIdCreator,
} from "@util/convenience-functions";

import { AbstractNumbering } from "./abstract-numbering";
import { ILevelsOptions, LevelFormat } from "./level";
import { ConcreteNumbering } from "./num";
import { validateNumberingInstance } from "./validation";
import { CORE_ATTRIBUTE_NAMESPACES, DocumentAttributes } from "../document/document-attributes";

export type INumberingOptions = {
    readonly config: readonly {
        readonly levels: readonly ILevelsOptions[];
        readonly reference: string;
    }[];
};

// Offsets to generate ids above existing ones, e.g. when merging into a
// document that already defines numberings. New ids start at offset + 1.
export type INumberingIdOffsets = {
    readonly abstractNum?: number;
    readonly num?: number;
};

// <xsd:element name="numbering" type="CT_Numbering"/>
//
//     <xsd:complexType name="CT_Numbering">
//         <xsd:sequence>
//             <xsd:element name="numPicBullet" type="CT_NumPicBullet" minOccurs="0" maxOccurs="unbounded"/>
//             <xsd:element name="abstractNum" type="CT_AbstractNum" minOccurs="0" maxOccurs="unbounded"/>
//             <xsd:element name="num" type="CT_Num" minOccurs="0" maxOccurs="unbounded"/>
//             <xsd:element name="numIdMacAtCleanup" type="CT_DecimalNumber" minOccurs="0"/>
//         </xsd:sequence>
//     </xsd:complexType>
export class Numbering extends XmlComponent {
    private readonly abstractNumberingMap = new Map<string, AbstractNumbering>();
    private readonly concreteNumberingMap = new Map<string, ConcreteNumbering>();
    private readonly referenceConfigMap = new Map<string, readonly ILevelsOptions[]>();
    private readonly abstractNumUniqueNumericId: UniqueNumericIdCreator;
    private readonly concreteNumUniqueNumericId: UniqueNumericIdCreator;

    public constructor(options: INumberingOptions, idOffsets: INumberingIdOffsets = {}) {
        super("w:numbering");
        this.abstractNumUniqueNumericId = uniqueNumericIdCreator(idOffsets.abstractNum ?? 0);
        this.concreteNumUniqueNumericId = uniqueNumericIdCreator(idOffsets.num ?? 0);
        this.root.push(new DocumentAttributes(CORE_ATTRIBUTE_NAMESPACES, "w14 w15 wp14"));

        const references = new Set<string>();
        for (const config of options.config) {
            if (config.reference.length === 0) {
                throw new Error("Numbering references must not be empty.");
            }
            if (references.has(config.reference)) {
                throw new Error(`Duplicate numbering reference '${config.reference}'.`);
            }
            references.add(config.reference);
        }

        const abstractNumbering = new AbstractNumbering(this.abstractNumUniqueNumericId(), [
            {
                level: 0,
                format: LevelFormat.BULLET,
                text: "\u25CF",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: {
                            left: convertInchesToTwip(0.5),
                            hanging: convertInchesToTwip(0.25),
                        },
                    },
                },
            },
            {
                level: 1,
                format: LevelFormat.BULLET,
                text: "\u25CB",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: {
                            left: convertInchesToTwip(1),
                            hanging: convertInchesToTwip(0.25),
                        },
                    },
                },
            },
            {
                level: 2,
                format: LevelFormat.BULLET,
                text: "\u25A0",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: { left: 2160, hanging: convertInchesToTwip(0.25) },
                    },
                },
            },
            {
                level: 3,
                format: LevelFormat.BULLET,
                text: "\u25CF",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: { left: 2880, hanging: convertInchesToTwip(0.25) },
                    },
                },
            },
            {
                level: 4,
                format: LevelFormat.BULLET,
                text: "\u25CB",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: { left: 3600, hanging: convertInchesToTwip(0.25) },
                    },
                },
            },
            {
                level: 5,
                format: LevelFormat.BULLET,
                text: "\u25A0",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: { left: 4320, hanging: convertInchesToTwip(0.25) },
                    },
                },
            },
            {
                level: 6,
                format: LevelFormat.BULLET,
                text: "\u25CF",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: { left: 5040, hanging: convertInchesToTwip(0.25) },
                    },
                },
            },
            {
                level: 7,
                format: LevelFormat.BULLET,
                text: "\u25CF",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: { left: 5760, hanging: convertInchesToTwip(0.25) },
                    },
                },
            },
            {
                level: 8,
                format: LevelFormat.BULLET,
                text: "\u25CF",
                alignment: AlignmentType.LEFT,
                style: {
                    paragraph: {
                        indent: { left: 6480, hanging: convertInchesToTwip(0.25) },
                    },
                },
            },
        ]);

        // Keyed as `reference-instance` so a createConcreteNumberingInstance
        // call for the default bullet numbering is a no-op instead of
        // registering a duplicate.

        this.concreteNumberingMap.set(
            "default-bullet-numbering-0",
            new ConcreteNumbering({
                numId: this.concreteNumUniqueNumericId(),
                abstractNumId: abstractNumbering.id,
                reference: "default-bullet-numbering",
                instance: 0,
                overrideLevels: [
                    {
                        num: 0,
                        start: 1,
                    },
                ],
            }),
        );

        this.abstractNumberingMap.set("default-bullet-numbering", abstractNumbering);

        for (const con of options.config) {
            this.abstractNumberingMap.set(
                con.reference,
                new AbstractNumbering(this.abstractNumUniqueNumericId(), con.levels),
            );

            this.referenceConfigMap.set(con.reference, con.levels);
        }
    }

    public prepForXml(context: IContext): IXmlableObject | undefined {
        // Push transiently and truncate afterwards so packing the same document
        // twice does not emit duplicate w:abstractNum/w:num entries.
        const initialRootLength = this.root.length;

        for (const numbering of this.abstractNumberingMap.values()) {
            this.root.push(numbering);
        }

        for (const numbering of this.concreteNumberingMap.values()) {
            this.root.push(numbering);
        }

        try {
            return super.prepForXml(context);
        } finally {
            this.root.length = initialRootLength;
        }
    }

    public createConcreteNumberingInstance(reference: string, instance: number): void {
        validateNumberingInstance(instance);
        const abstractNumbering = this.abstractNumberingMap.get(reference);

        if (!abstractNumbering) {
            return;
        }

        const fullReference = `${reference}-${instance}`;

        if (this.concreteNumberingMap.has(fullReference)) {
            return;
        }

        const referenceConfigLevels = this.referenceConfigMap.get(reference);
        const firstLevelStartNumber = referenceConfigLevels && referenceConfigLevels[0].start;

        const concreteNumberingSettings = {
            numId: this.concreteNumUniqueNumericId(),
            abstractNumId: abstractNumbering.id,
            reference,
            instance,
            overrideLevels: [
                firstLevelStartNumber !== undefined
                    ? {
                          num: 0,
                          start: firstLevelStartNumber,
                      }
                    : {
                          num: 0,
                          start: 1,
                      },
            ],
        };

        this.concreteNumberingMap.set(
            fullReference,
            new ConcreteNumbering(concreteNumberingSettings),
        );
    }

    public getConcreteNumberingId(reference: string, instance: number): number {
        this.createConcreteNumberingInstance(reference, instance);
        const concrete = this.concreteNumberingMap.get(`${reference}-${instance}`);

        if (!concrete) {
            throw new Error(
                `Could not resolve numbering reference "${reference}". Every numbering reference must be configured before serialization.`,
            );
        }

        return concrete.numId;
    }

    public get ConcreteNumbering(): readonly ConcreteNumbering[] {
        return Array.from(this.concreteNumberingMap.values());
    }

    public getAbstractNumbering(reference: string): AbstractNumbering | undefined {
        return this.abstractNumberingMap.get(reference);
    }
    public get ReferenceConfig(): readonly (readonly ILevelsOptions[])[] {
        return Array.from(this.referenceConfigMap.values());
    }
}
