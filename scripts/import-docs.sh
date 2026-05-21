#!/bin/bash
# Bulk import docs/plans/specs into .venusos/documents/
set -e

VENUS_ROOT="/Users/phucld/workspace/venus"
DOCS_DIR="$VENUS_ROOT/.venusos/documents"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COUNTER=1

pad() { printf "%03d" "$1"; }

import_file() {
  local src="$1"
  local type="$2"
  local domain="$3"
  local filename=$(basename "$src" .md)
  local title=$(head -5 "$src" | grep "^# " | head -1 | sed 's/^# //' || echo "$filename")
  if [ -z "$title" ]; then
    title=$(echo "$filename" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
  fi
  local slug=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | cut -c1-40)
  local id="doc-${domain}-$(pad $COUNTER)-${slug}"
  local dest="$DOCS_DIR/${id}.md"

  cat > "$dest" << FRONTMATTER
---
id: ${id}
type: ${type}
title: ${title}
domain: ${domain}
status: active
updated_at: '${NOW}'
---

FRONTMATTER

  # Append body (skip existing frontmatter if any)
  if head -1 "$src" | grep -q "^---"; then
    sed -n '/^---$/,/^---$/!p' "$src" | tail -n +2 >> "$dest"
  else
    cat "$src" >> "$dest"
  fi

  echo "  ✓ $id"
  COUNTER=$((COUNTER + 1))
}

echo "=== Importing plans (implementation) ==="
for f in "$VENUS_ROOT/docs/plans"/*.md; do
  import_file "$f" "plan" "implementation"
done

echo ""
echo "=== Importing specs/designs (architecture) ==="
for f in "$VENUS_ROOT/docs/superpowers/specs"/*.md; do
  import_file "$f" "artifact" "architecture"
done

echo ""
echo "=== Importing standards & design docs (global) ==="
import_file "$VENUS_ROOT/docs/production-readiness-standard.md" "artifact" "global"
import_file "$VENUS_ROOT/DESIGN.md" "artifact" "design"

echo ""
echo "Done. Total: $((COUNTER - 1)) documents imported."
