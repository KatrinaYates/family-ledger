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

  if [[ "$file" =~ \.local(\.js)?$ ]] || [[ "$file" == "src/data/july2026.local.js" ]]; then
    echo "ERROR: Refusing to commit personal data file: $file"
    echo "       Real figures belong in july2026.local.js (gitignored)."
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
if echo "$staged" | grep -q 'july2026.sample.js'; then
  if git show :src/data/july2026.sample.js 2>/dev/null | grep -q 'totalExact'; then
    echo "ERROR: july2026.sample.js contains totalExact — looks like real data."
    echo "       Keep exact figures in july2026.local.js only."
    exit 1
  fi
fi

exit 0
