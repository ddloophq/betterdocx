#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FIXTURE_DIR="$ROOT_DIR/test/package-consumer"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

TARBALL_NAME="$(
    cd "$ROOT_DIR"
    npm_config_cache="$TEMP_DIR/npm-cache" npm pack --silent --pack-destination "$TEMP_DIR"
)"
PACKAGE_DIR="$TEMP_DIR/consumer/node_modules/betterdocx"
mkdir -p "$PACKAGE_DIR"
tar -xzf "$TEMP_DIR/$TARBALL_NAME" -C "$PACKAGE_DIR" --strip-components=1

cp "$FIXTURE_DIR/dom-consumer.ts" "$TEMP_DIR/consumer/dom-consumer.ts"
cp "$FIXTURE_DIR/subpath-consumer.ts" "$TEMP_DIR/consumer/subpath-consumer.ts"
cp "$FIXTURE_DIR/tsconfig.json" "$TEMP_DIR/consumer/tsconfig.json"
cp "$FIXTURE_DIR/esm-consumer.mjs" "$TEMP_DIR/consumer/esm-consumer.mjs"

for dependency in jszip xml xml-js; do
    ln -s "$ROOT_DIR/node_modules/$dependency" "$TEMP_DIR/consumer/node_modules/$dependency"
done

if grep -ERq 'NodeJS\.|: Buffer|<Buffer|\| Buffer|from "jszip"|import\("jszip"\)' \
    "$PACKAGE_DIR/dist" --include='*.d.ts'; then
    echo "Published declarations leak Node- or JSZip-specific public types." >&2
    exit 1
fi

if grep -Eq '\]\(\./' "$PACKAGE_DIR/README.md"; then
    echo "Published README contains a package-relative link." >&2
    exit 1
fi

"$ROOT_DIR/node_modules/.bin/tsc" -p "$TEMP_DIR/consumer/tsconfig.json"
node "$ROOT_DIR/scripts/check-entry-boundaries.mjs"
node "$TEMP_DIR/consumer/esm-consumer.mjs"

echo "Packed DOM and ESM consumers passed."
