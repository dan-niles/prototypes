#!/usr/bin/env bash
# cleanup-ui.sh — find (and optionally delete) unused shadcn/ui components in prototype folders
#
# Usage:
#   ./scripts/cleanup-ui.sh                     # dry run across all prototypes
#   ./scripts/cleanup-ui.sh bi-evalset-editor   # dry run for one prototype
#   ./scripts/cleanup-ui.sh --delete            # delete unused files across all prototypes
#   ./scripts/cleanup-ui.sh bi-evalset-editor --delete

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROTOTYPES_DIR="$PROJECT_ROOT/src/prototypes"

DELETE=false
TARGET_SLUG=""

# Parse args
for arg in "$@"; do
  case "$arg" in
    --delete) DELETE=true ;;
    --*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) TARGET_SLUG="$arg" ;;
  esac
done

# Resolve target prototype directories
if [[ -n "$TARGET_SLUG" ]]; then
  prototype_dirs=("$PROTOTYPES_DIR/$TARGET_SLUG")
  if [[ ! -d "${prototype_dirs[0]}" ]]; then
    echo "Error: prototype '$TARGET_SLUG' not found at ${prototype_dirs[0]}" >&2
    exit 1
  fi
else
  prototype_dirs=()
  while IFS= read -r d; do
    prototype_dirs+=("$d")
  done < <(find "$PROTOTYPES_DIR" -mindepth 1 -maxdepth 1 -type d | sort)
fi

total_unused=0

for prototype_dir in "${prototype_dirs[@]}"; do
  slug="$(basename "$prototype_dir")"
  ui_dir="$prototype_dir/components/ui"

  [[ -d "$ui_dir" ]] || continue

  # Concatenate all non-ui source files into one string for fast grepping
  source_content="$(
    find "$prototype_dir" \( -name "*.tsx" -o -name "*.ts" \) \
      ! -path "*/components/ui/*" \
      -exec cat {} +
  )"

  if [[ -z "$source_content" ]]; then
    continue
  fi

  unused=()

  while IFS= read -r ui_file; do
    filename="$(basename "$ui_file")"

    # Skip utility helpers — they're not components
    [[ "$filename" == "utils.ts" || "$filename" == "use-mobile.ts" ]] && continue

    component="${filename%.*}"   # strip extension

    # Look for any import referencing this component via the ui/ path
    if ! grep -q "ui/${component}['\"]" <<< "$source_content" 2>/dev/null; then
      unused+=("$ui_file")
    fi
  done < <(find "$ui_dir" \( -name "*.tsx" -o -name "*.ts" \) | sort)

  if [[ ${#unused[@]} -eq 0 ]]; then
    echo "[$slug] All ui components are used."
    continue
  fi

  echo "[$slug] Unused ui components (${#unused[@]}):"
  for f in "${unused[@]}"; do
    echo "  $(basename "$f")"
  done

  if $DELETE; then
    echo "  Deleting..."
    for f in "${unused[@]}"; do
      rm "$f"
    done
  fi

  total_unused=$((total_unused + ${#unused[@]}))
done

echo ""
if $DELETE; then
  echo "Done. Deleted $total_unused unused ui component(s)."
else
  echo "Found $total_unused unused ui component(s) total. Run with --delete to remove them."
fi
