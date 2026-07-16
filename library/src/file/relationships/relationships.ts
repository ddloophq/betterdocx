import { XmlComponent } from "@file/xml-components";

import { RelationshipsAttributes } from "./attributes";
import { Relationship, RelationshipType, TargetModeType } from "./relationship/relationship";

export class Relationships extends XmlComponent {
    public constructor() {
        super("Relationships");
        this.root.push(
            new RelationshipsAttributes({
                xmlns: "http://schemas.openxmlformats.org/package/2006/relationships",
            }),
        );
    }

    private readonly relationshipIdByTypeAndTarget = new Map<string, number>();

    public createRelationship(
        id: number | string,
        type: RelationshipType,
        target: string,
        targetMode?: (typeof TargetModeType)[keyof typeof TargetModeType],
    ): Relationship {
        const relationship = new Relationship(`rId${id}`, type, target, targetMode);
        this.root.push(relationship);

        return relationship;
    }

    // Returns the numeric id of an existing relationship with the same type and
    // target, or creates a new one. Keeps repeated Packer runs over the same
    // document from accumulating duplicate relationships.
    public getOrCreateRelationship(
        type: RelationshipType,
        target: string,
        targetMode?: (typeof TargetModeType)[keyof typeof TargetModeType],
    ): number {
        const key = `${type}#${target}`;
        const existingId = this.relationshipIdByTypeAndTarget.get(key);
        if (existingId !== undefined) {
            return existingId;
        }

        const id = this.RelationshipCount + 1;
        this.createRelationship(id, type, target, targetMode);

        this.relationshipIdByTypeAndTarget.set(key, id);

        return id;
    }

    public get RelationshipCount(): number {
        return this.root.length - 1;
    }
}
