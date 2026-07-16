# Better DOCX

Easily generate and modify .docx files with JS/TS. Works for Node and on the Browser.

A modern fork of [docxjs](https://github.com/dolanmiu/docx)

---

## Installation

```bash
npm install betterdocx
```

or:

```bash
pnpm install betterdocx
```

or:

```bash
bun install betterdocx
```

Better DOCX supports modern browsers and JavaScript runtimes with Web Platform APIs,
plus Node.js 24 and newer.

> [!IMPORTANT]
> **This is an ESM-only package — by design.** Better DOCX ships ES modules only and
> intentionally does **not** provide a CommonJS (`require`) build. This is a deliberate
> decision, not an omission: please do not add a CJS/dual build, `main`/`require` export
> conditions, or `.cjs`/`.d.cts` artifacts. Consume it with `import` (or a dynamic
> `import()` from CJS on Node 24+). The `engines.node` floor is `>=24`, also by design.

## Package entries

The root import remains the complete, backwards-compatible API. New code can use the
smaller, purpose-specific entries when that makes the dependency boundary clearer:

- `betterdocx/core` — document construction and packing;
- `betterdocx/patcher` — template patching, placeholder detection, and style reading;
- `betterdocx/advanced` — low-level XML components and formatting extension points.

For example, a generation-only application can import from `betterdocx/core`, while a
template workflow typically imports document components from `betterdocx/core` and
`patchDocument` from `betterdocx/patcher`. Existing imports from `betterdocx` continue
to work unchanged.

## Quick Start

```typescript
import { Document, Packer, Paragraph, TextRun } from "betterdocx";
import * as fs from "fs";

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun("Hello World"),
                        new TextRun({
                            text: "Foo Bar",
                            bold: true,
                        }),
                    ],
                }),
            ],
        },
    ],
});

Packer.toUint8Array(doc).then((bytes) => {
    fs.writeFileSync("My Document.docx", bytes);
});
```

## Documentation

Read the [complete documentation](https://betterdocx.dev/docs) including:

- [Getting Started](https://betterdocx.dev/docs) - Installation and basic usage
- [Usage Guides](https://betterdocx.dev/docs/usage/document) - Detailed guides for all features
- [Exporting](https://betterdocx.dev/docs/exporting/packers) - How to generate .docx files
- [Modifying Documents](https://betterdocx.dev/docs/modifying-existing-documents/patcher) - Working with existing files
- [Utility Functions](https://betterdocx.dev/docs/utility/convenience-functions) - Helper functions and utilities

## Examples

Browse the [demo source on GitHub](https://github.com/ddloophq/betterdocx/tree/main/library/demo) for examples.

## Contributing

Read the [contribution guidelines](https://betterdocx.dev/docs/contribution-guidelines) to get started.

## License

MIT
