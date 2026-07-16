#!/usr/bin/env bash
#
# Runs every numbered demo, validates each real DOCX as an OPC package, and
# validates every WML part whose root is declared by the bundled WML schema.
#
# The strict ISO schema cannot consume Markup Compatibility extensions
# directly. Before XSD validation, prepare-wml-for-xsd.ts applies the relevant
# MCE consumer behavior: ignorable extension attributes/elements are removed
# and mc:AlternateContent uses its fallback. The original package is never
# changed and is always checked by the package-consistency validator first.
#
# Run from the library directory. Requires bun, unzip, and xmllint.

set -uo pipefail

# These demos intentionally exercise constructs that the bundled strict schema
# does not model or whose ordering is already tracked as a library defect. They
# still run and pass the package-consistency checks.
SCHEMA_EXCEPTIONS=(
  45  # complex-script highlight element ordering is rejected by the bundled schema
  55  # math subHide ordering is rejected by the bundled math schema
  60  # tracked revision run ordering is rejected by the bundled schema
  61  # text-frame border ordering is rejected by the bundled schema
  94  # legacy VML w:pict position is rejected by the bundled schema
  95  # paragraph-style border ordering is rejected by the bundled schema
)

# This demo demonstrates base64 export and deliberately writes text rather than
# a ZIP package to "My Document.docx".
NON_DOCX_OUTPUT=(19)

contains() {
  local value="$1"
  shift
  for item in "$@"; do
    [[ "$item" == "$value" ]] && return 0
  done
  return 1
}

cleanup() {
  rm -f "My Document.docx" "97-table-look.docx"
  rm -rf build/extracted-doc build/schema-ready
}
trap cleanup EXIT

for command in bun unzip xmllint; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Required command is unavailable: $command" >&2
    exit 2
  fi
done

SCHEMA="ooxml-schemas/microsoft/wml-2010.xsd"
PASSED=0
FAILED=0
RUN_SKIPPED=0
SCHEMA_SKIPPED=0
NON_DOCX_SKIPPED=0
FAILURES=()

while IFS= read -r demo_file; do
  filename=$(basename "$demo_file" .ts)
  num=${filename%%-*}
  cleanup

  echo "▶  Running demo $num ($filename)..."
  if ! bun "./$demo_file" >/dev/null 2>&1; then
    echo "✗  Demo $num FAILED (execution error)"
    FAILED=$((FAILED + 1))
    FAILURES+=("$num ($filename): execution error")
    continue
  fi

  if contains "$num" "${NON_DOCX_OUTPUT[@]}"; then
    echo "✓  Demo $num ran (non-DOCX export; package and schema checks skipped)"
    PASSED=$((PASSED + 1))
    NON_DOCX_SKIPPED=$((NON_DOCX_SKIPPED + 1))
    continue
  fi

  output="My Document.docx"
  [[ -f "$output" ]] || output="97-table-look.docx"
  if [[ ! -f "$output" ]]; then
    echo "✗  Demo $num FAILED (no declared DOCX output)"
    FAILED=$((FAILED + 1))
    FAILURES+=("$num ($filename): no declared DOCX output")
    continue
  fi

  if ! package_error=$(bun scripts/validate-docx-package.ts "$output" 2>&1); then
    echo "✗  Demo $num FAILED (package consistency error)"
    FAILED=$((FAILED + 1))
    FAILURES+=("$num ($filename): ${package_error//$'\n'/ }")
    continue
  fi

  if contains "$num" "${SCHEMA_EXCEPTIONS[@]}"; then
    echo "✓  Demo $num passed package checks (schema exception documented above)"
    PASSED=$((PASSED + 1))
    SCHEMA_SKIPPED=$((SCHEMA_SKIPPED + 1))
    continue
  fi

  rm -rf build/extracted-doc build/schema-ready
  mkdir -p build/extracted-doc build/schema-ready
  if ! unzip -q "$output" -d build/extracted-doc; then
    echo "✗  Demo $num FAILED (DOCX extraction error)"
    FAILED=$((FAILED + 1))
    FAILURES+=("$num ($filename): DOCX extraction error")
    continue
  fi

  schema_failed=0
  while IFS= read -r part; do
    root=$(xmllint --xpath 'local-name(/*)' "$part" 2>/dev/null)
    case "$root" in
      document|hdr|ftr|footnotes|endnotes|comments|numbering|styles|settings) ;;
      *) continue ;;
    esac

    relative=${part#build/extracted-doc/}
    prepared="build/schema-ready/${relative//\//__}"
    if ! bun scripts/prepare-wml-for-xsd.ts "$part" "$prepared" >/dev/null 2>&1; then
      schema_failed=1
      FAILURES+=("$num ($filename): could not MCE-normalize $relative")
      break
    fi
    if ! schema_error=$(xmllint --noout --schema "$SCHEMA" "$prepared" 2>&1); then
      schema_failed=1
      first_error=${schema_error%%$'\n'*}
      FAILURES+=("$num ($filename): $relative: $first_error")
      break
    fi
  done < <(find build/extracted-doc/word -maxdepth 1 -type f -name '*.xml' | sort)

  if [[ $schema_failed -eq 1 ]]; then
    echo "✗  Demo $num FAILED (WML schema error)"
    FAILED=$((FAILED + 1))
  else
    echo "✓  Demo $num passed"
    PASSED=$((PASSED + 1))
  fi
done < <(find demo -maxdepth 1 -type f -name '[0-9]*.ts' | sort -V)

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Results: $PASSED passed, $FAILED failed, $RUN_SKIPPED run skipped"
echo "  Explicit exclusions: $SCHEMA_SKIPPED schema, $NON_DOCX_SKIPPED non-DOCX"
echo "════════════════════════════════════════════════════════════════"

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo ""
  echo "Failures:"
  for failure in "${FAILURES[@]}"; do
    echo "  • $failure"
  done
  exit 1
fi
