export type IXmlAttribute = Readonly<Record<string, string | number | boolean>>;

// XML trees are intentionally loosely typed at the serializer boundary.
// oxlint-disable-next-line typescript/consistent-type-definitions
export interface IXmlableObject extends Record<string, unknown> {
    // oxlint-disable-next-line typescript/no-explicit-any -- XML serializer boundary
    readonly [key: string]: any;
}
