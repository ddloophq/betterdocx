import { expect, test } from "vitest";
import JSZip from "jszip";

import { validateDocxPackage } from "./package-validator";

const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
</Types>`;

const rootRelationships = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const makePackage = async (
    options: {
        readonly document?: string;
        readonly documentRelationships?: string;
        readonly numbering?: string;
        readonly includeImage?: boolean;
        readonly types?: string;
    } = {},
): Promise<Uint8Array> => {
    const zip = new JSZip();
    zip.file("[Content_Types].xml", options.types ?? contentTypes);
    zip.file("_rels/.rels", rootRelationships);
    zip.file(
        "word/document.xml",
        options.document ??
            `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
              <w:body>
                <w:p><w:pPr><w:numPr><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:drawing r:embed="rId1"/></w:r></w:p>
                <w:p><w:bookmarkStart w:id="1" w:name="anchor"/><w:bookmarkEnd w:id="1"/></w:p>
                <w:tbl><w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>
              </w:body>
            </w:document>`,
    );
    zip.file(
        "word/_rels/document.xml.rels",
        options.documentRelationships ??
            `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
              <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/pixel.png"/>
            </Relationships>`,
    );
    zip.file(
        "word/numbering.xml",
        options.numbering ??
            `<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:num w:numId="1"/></w:numbering>`,
    );
    if (options.includeImage ?? true) {
        zip.file("word/media/pixel.png", new Uint8Array([1, 2, 3]));
    }
    return zip.generateAsync({ type: "uint8array" });
};

test("accepts a package whose parts and cross-part references are consistent", async () => {
    expect(await validateDocxPackage(await makePackage())).toEqual([]);
});

test("resolves relationship attributes by namespace rather than a fixed prefix", async () => {
    const bytes = await makePackage({
        document: `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:rel="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <w:body><w:p><w:r><w:drawing rel:embed="rId1"/></w:r></w:p></w:body>
        </w:document>`,
    });
    expect(await validateDocxPackage(bytes)).toEqual([]);
});

test("reports missing relationship targets and relationship references", async () => {
    const bytes = await makePackage({
        documentRelationships: `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/missing.png"/>
        </Relationships>`,
        includeImage: false,
    });
    const codes = (await validateDocxPackage(bytes)).map((issue) => issue.code);
    expect(codes).toContain("RELATIONSHIP_TARGET_MISSING");
    expect(codes).toContain("RELATIONSHIP_REFERENCE_MISSING");
});

test("reports duplicate relationship ids", async () => {
    const bytes = await makePackage({
        documentRelationships: `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/pixel.png"/>
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/pixel.png"/>
        </Relationships>`,
    });
    expect((await validateDocxPackage(bytes)).map((issue) => issue.code)).toContain(
        "DUPLICATE_RELATIONSHIP_ID",
    );
});

test("reports invalid numbering, bookmarks, and table-cell endings", async () => {
    const bytes = await makePackage({
        document: `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p><w:pPr><w:numPr><w:numId w:val="missing"/></w:numPr></w:pPr></w:p>
            <w:p><w:bookmarkStart w:id="4" w:name="one"/><w:bookmarkStart w:id="4" w:name="two"/></w:p>
            <w:tbl><w:tr><w:tc><w:tbl/></w:tc></w:tr></w:tbl>
          </w:body>
        </w:document>`,
    });
    const codes = (await validateDocxPackage(bytes)).map((issue) => issue.code);
    expect(codes).toContain("INVALID_NUMBERING_ID");
    expect(codes).toContain("DUPLICATE_BOOKMARK_ID");
    expect(codes).toContain("UNMATCHED_BOOKMARK");
    expect(codes).toContain("TABLE_CELL_TERMINAL_PARAGRAPH");
});

test("reports content-type gaps", async () => {
    const bytes = await makePackage({
        types: `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="png" ContentType="image/png"/>
        </Types>`,
    });
    expect((await validateDocxPackage(bytes)).map((issue) => issue.code)).toContain(
        "CONTENT_TYPE_MISSING",
    );
});

test("detects duplicate central-directory part names before JSZip collapses them", async () => {
    const zip = new JSZip();
    zip.file(
        "[Content_Types].xml",
        `${contentTypes.replace("</Types>", "")}<Default Extension="txt" ContentType="text/plain"/></Types>`,
    );
    zip.file("word/a.txt", "a");
    zip.file("word/b.txt", "b");
    const bytes = await zip.generateAsync({ type: "uint8array" });
    const from = new TextEncoder().encode("word/b.txt");
    const to = new TextEncoder().encode("word/a.txt");
    for (let index = 0; index <= bytes.length - from.length; index++) {
        if (from.every((byte, offset) => bytes[index + offset] === byte)) {
            bytes.set(to, index);
        }
    }

    expect((await validateDocxPackage(bytes)).map((issue) => issue.code)).toContain(
        "DUPLICATE_PART",
    );
});
