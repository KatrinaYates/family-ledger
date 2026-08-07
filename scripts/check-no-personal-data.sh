#!/usr/bin/env bash
# Blocks commits that include local financial data or secrets.
set -euo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

staged="$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)"

if [[ -z "$staged" ]]; then
  exit 0
fi

blocked=0

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  if [[ "$file" =~ \.local(\.js)?$ ]] || [[ "$file" == src/data/months/*.local.js ]]; then
    echo "ERROR: Refusing to commit personal data file: $file"
    echo "       Real figures belong in src/data/months/YYYY-MM.local.js (gitignored)."
    blocked=1
  fi

  if [[ "$file" =~ ^\.env(\.|$) ]] && [[ "$file" != ".env.example" ]]; then
    echo "ERROR: Refusing to commit secrets file: $file"
    blocked=1
  fi
done <<< "$staged"

if [[ "$blocked" -ne 0 ]]; then
  echo ""
  echo "Unstage with: git restore --staged <file>"
  exit 1
fi

# Warn if sample data file contains exact-cent fields (likely copied from local)
if echo "$staged" | grep -qE 'src/data/months/[0-9]{4}-[0-9]{2}\.sample\.js'; then
  sample_file=$(echo "$staged" | grep -E 'src/data/months/[0-9]{4}-[0-9]{2}\.sample\.js' | head -1)
  if git show ":$sample_file" 2>/dev/null | grep -q 'totalExact'; then
    echo "ERROR: $sample_file contains totalExact — looks like real data."
    echo "       Keep exact figures in a gitignored *.local.js file only."
    exit 1
  fi
fi

exit 0
