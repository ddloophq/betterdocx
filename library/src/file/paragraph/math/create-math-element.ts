import { BuilderElement, XmlComponent } from "@file/xml-components";

/**
 * Creates a math element that simply wraps its children in the given tag,
 * rendering an empty element when there are no children.
 */
export const createMathElement = (name: string, children?: readonly XmlComponent[]): XmlComponent =>
    new BuilderElement({ name, children });

/** Creates a math element carrying a single `m:val` attribute. */
export const createMathValElement = (name: string, value: string | number): XmlComponent =>
    new BuilderElement<{ readonly val: string | number }>({
        name,
        attributes: {
            val: { key: "m:val", value },
        },
    });
