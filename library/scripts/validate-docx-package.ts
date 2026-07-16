import { validateDocxPackage } from "../src/export/packer/package-validator";

const path = process.argv[2];
if (!path) {
    console.error("Usage: bun scripts/validate-docx-package.ts <document.docx>");
    process.exit(2);
}

const file = Bun.file(path);
if (!(await file.exists())) {
    console.error(`DOCX package does not exist: ${path}`);
    process.exit(2);
}

try {
    const issues = await validateDocxPackage(await file.arrayBuffer());
    if (issues.length > 0) {
        console.error(`Package consistency failed for ${path}:`);
        for (const issue of issues) {
            console.error(
                `  - ${issue.code}${issue.part ? ` (${issue.part})` : ""}: ${issue.message}`,
            );
        }
        process.exit(1);
    }
    console.log(`Package consistency passed: ${path}`);
} catch (error) {
    console.error(
        `Could not inspect ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
}
