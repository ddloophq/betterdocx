import { Element, js2xml, xml2js } from "xml-js";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
    console.error("Usage: bun scripts/prepare-wml-for-xsd.ts <input.xml> <output.xml>");
    process.exit(2);
}

const source = await Bun.file(inputPath).text();
const document = xml2js(source, { compact: false }) as Element;
const ignorablePrefixes = new Set<string>();
const processContent = new Set<string>();

const visit = (element: Element): void => {
    if (element.type === "element") {
        const ignorable = element.attributes?.["mc:Ignorable"];
        if (typeof ignorable === "string") {
            for (const prefix of ignorable.split(/\s+/).filter(Boolean)) {
                ignorablePrefixes.add(prefix);
            }
        }
        const processed = element.attributes?.["mc:ProcessContent"];
        if (typeof processed === "string") {
            for (const name of processed.split(/\s+/).filter(Boolean)) {
                processContent.add(name);
            }
        }
    }
    for (const child of element.elements ?? []) {
        visit(child);
    }
};
visit(document);

const transform = (element: Element): readonly Element[] => {
    if (element.type !== "element") {
        return [
            {
                ...element,
                elements: element.elements?.flatMap(transform),
            },
        ];
    }

    if (element.name === "mc:AlternateContent") {
        const fallback = element.elements?.find(
            (child) => child.type === "element" && child.name === "mc:Fallback",
        );
        return fallback?.elements?.flatMap(transform) ?? [];
    }

    const [prefix = ""] = element.name?.split(":") ?? [];
    if (ignorablePrefixes.has(prefix)) {
        return processContent.has(element.name ?? "")
            ? (element.elements?.flatMap(transform) ?? [])
            : [];
    }

    const attributes = Object.fromEntries(
        Object.entries(element.attributes ?? {}).filter(([name]) => {
            if (name.startsWith("mc:")) {
                return false;
            }
            const attributePrefix = name.includes(":") ? name.split(":", 1)[0] : "";
            return !ignorablePrefixes.has(attributePrefix);
        }),
    );
    return [
        {
            ...element,
            attributes,
            elements: element.elements?.flatMap(transform),
        },
    ];
};

const transformed = transform(document)[0];
await Bun.write(outputPath, js2xml(transformed, { compact: false }));
