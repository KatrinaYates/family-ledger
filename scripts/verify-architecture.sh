#!/usr/bin/env bash
# Architecture grep checks from Phase 5 — month-agnostic pre-DB refactor.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail=0

check_absent() {
  local label="$1"
  local pattern="$2"
  local pathspec="${3:-src}"
  if rg -q "$pattern" "$pathspec" 2>/dev/null; then
    echo "FAIL: $label"
    rg -n "$pattern" "$pathspec" | head -20
    fail=1
  else
    echo "OK: $label"
  fi
}

check_absent "No fl-july-* storage keys" 'fl-july-' src
check_absent "No buildJulyPages" 'buildJulyPages' src
check_absent "No loadJuly2026" 'loadJuly2026' src
check_absent "No enrichJulyData" 'enrichJulyData' src
check_absent "No months[].status in catalog" 'status:\s*"(active|locked)"' src/data/months.js

# Month-specific conditionals outside data/catalog are forbidden.
if rg -q '2026-09' src \
  --glob '!src/data/months/**' \
  --glob '!src/data/months.js' \
  --glob '!src/utils/normalizePageId.js' 2>/dev/null; then
  echo "FAIL: 2026-09 conditionals outside data files and catalog"
  rg -n '2026-09' src \
    --glob '!src/data/months/**' \
    --glob '!src/data/months.js' \
    --glob '!src/utils/normalizePageId.js' | head -20
  fail=1
else
  echo "OK: No 2026-09 conditionals outside data/catalog"
fi

if rg -q '2026-08' src \
  --glob '!src/data/months/**' \
  --glob '!src/data/months.js' \
  --glob '!src/utils/normalizePageId.js' 2>/dev/null; then
  echo "FAIL: 2026-08 conditionals outside data files and catalog"
  rg -n '2026-08' src \
    --glob '!src/data/months/**' \
    --glob '!src/data/months.js' \
    --glob '!src/utils/normalizePageId.js' | head -20
  fail=1
else
  echo "OK: No 2026-08 conditionals outside data/catalog"
fi

required_samples=(
  src/data/months/2026-07.sample.js
  src/data/months/2026-08.sample.js
  src/data/months/2026-09.sample.js
)
for sample in "${required_samples[@]}"; do
  if [[ ! -f "$sample" ]]; then
    echo "FAIL: Missing $sample"
    fail=1
  else
    echo "OK: Found $sample"
  fi
done

if [[ ! -f src/data/months/2026-10.sample.js ]]; then
  echo "OK: October intentionally has no sample file (graceful failure test)"
else
  echo "WARN: 2026-10.sample.js exists — Phase 5 expects catalog-only October"
fi

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "Architecture verification failed."
  exit 1
fi

echo ""
echo "Architecture verification passed."
