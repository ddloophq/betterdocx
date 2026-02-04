# Better DOCX

Easily generate and modify .docx files with JS/TS. Works for Node and on the Browser.

A modern fork of [docxjs](https://github.com/dolanmiu/docx)

---

## Installation

```bash
npm install betterdocx
pnpm install betterdocx
bun install betterdocx
```

## Quick Start

```typescript
import { Document, Packer, Paragraph, TextRun } from "betterdocx";
import * as fs from "fs";

const doc = new Document({
    sections: [{
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
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("My Document.docx", buffer);
});
```

## Documentation

Check the [docs folder](./docs/content/docs) for comprehensive documentation including:

- [Getting Started](./docs/content/docs/index.mdx) - Installation and basic usage
- [Usage Guides](./docs/content/docs/usage) - Detailed guides for all features
- [Exporting](./docs/content/docs/exporting) - How to generate .docx files
- [Modifying Documents](./docs/content/docs/modifying-existing-documents) - Working with existing files
- [Utility Functions](./docs/content/docs/utility) - Helper functions and utilities

## Examples

Check the [demo folder](./demo) for examples.

## Contributing

Read the [contribution guidelines](./docs/content/docs/contribution-guidelines.mdx) to get started.

## License

MIT