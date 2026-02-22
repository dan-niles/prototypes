#!/usr/bin/env bash
# cleanup-ui.sh — find (and optionally delete) unused shadcn/ui components in mockup folders
#
# Usage:
#   ./scripts/cleanup-ui.sh                     # dry run across all mockups
#   ./scripts/cleanup-ui.sh bi-evalset-editor   # dry run for one mockup
#   ./scripts/cleanup-ui.sh --delete            # delete unused files across all mockups
#   ./scripts/cleanup-ui.sh bi-evalset-editor --delete

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MOCKUPS_DIR="$PROJECT_ROOT/src/mockups"

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

# Resolve target mockup directories
if [[ -n "$TARGET_SLUG" ]]; then
  mockup_dirs=("$MOCKUPS_DIR/$TARGET_SLUG")
  if [[ ! -d "${mockup_dirs[0]}" ]]; then
    echo "Error: mockup '$TARGET_SLUG' not found at ${mockup_dirs[0]}" >&2
    exit 1
  fi
else
  mockup_dirs=()
  while IFS= read -r d; do
    mockup_dirs+=("$d")
  done < <(find "$MOCKUPS_DIR" -mindepth 1 -maxdepth 1 -type d | sort)
fi

total_unused=0

for mockup_dir in "${mockup_dirs[@]}"; do
  slug="$(basename "$mockup_dir")"
  ui_dir="$mockup_dir/components/ui"

  [[ -d "$ui_dir" ]] || continue

  # Concatenate all non-ui source files into one string for fast grepping
  source_content="$(
    find "$mockup_dir" \( -name "*.tsx" -o -name "*.ts" \) \
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
