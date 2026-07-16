import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const relativeImport = /(?:from\s+|import\s*)["'](\.\/[^"']+\.js)["']/g;

const collectEntryGraph = async (entry) => {
    const pending = [join(dist, entry)];
    const files = new Set();
    let code = "";
    let bytes = 0;

    while (pending.length > 0) {
        const file = pending.pop();
        if (files.has(file)) {
            continue;
        }
        files.add(file);

        const source = await readFile(file, "utf8");
        code += `\n${source}`;
        bytes += (await stat(file)).size;

        for (const match of source.matchAll(relativeImport)) {
            pending.push(resolve(dirname(file), match[1]));
        }
    }

    return { files, code, bytes };
};

const [rootGraph, coreGraph, patcherGraph, advancedGraph] = await Promise.all([
    collectEntryGraph("index.js"),
    collectEntryGraph("core.js"),
    collectEntryGraph("patcher.js"),
    collectEntryGraph("advanced.js"),
]);

const forbiddenCoreSymbols = [
    "patchDocument",
    "patchDetector",
    "readStyles",
    "readStyleIds",
    "TokenNotFoundError",
];
const leakedSymbols = forbiddenCoreSymbols.filter((symbol) => coreGraph.code.includes(symbol));

if (leakedSymbols.length > 0) {
    throw new Error(
        `betterdocx/core includes patcher implementation symbols: ${leakedSymbols.join(", ")}`,
    );
}

if (coreGraph.bytes >= rootGraph.bytes) {
    throw new Error(
        `betterdocx/core (${coreGraph.bytes} bytes) must remain lighter than the full root (${rootGraph.bytes} bytes).`,
    );
}

const format = (name, graph) =>
    `${name}: ${graph.bytes.toLocaleString("en-US")} bytes across ${graph.files.size} artifacts`;

console.log(
    [
        format("root", rootGraph),
        format("core", coreGraph),
        format("patcher", patcherGraph),
        format("advanced", advancedGraph),
    ].join("\n"),
);
