#!/usr/bin/env bash
# Architecture checks that run on both local machines and GitHub-hosted runners.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail=0

search_q() {
  local pattern="$1"
  local pathspec="$2"
  grep -ERq -- "$pattern" "$pathspec" 2>/dev/null
}

search_n() {
  local pattern="$1"
  local pathspec="$2"
  grep -ERn -- "$pattern" "$pathspec" 2>/dev/null | head -20 || true
}

check_absent() {
  local label="$1"
  local pattern="$2"
  local pathspec="${3:-src}"
  if search_q "$pattern" "$pathspec"; then
    echo "FAIL: $label"
    search_n "$pattern" "$pathspec"
    fail=1
  else
    echo "OK: $label"
  fi
}

check_absent "No fl-july-* storage keys" 'fl-july-' src
check_absent "No buildJulyPages" 'buildJulyPages' src
check_absent "No enrichMeeting" 'enrichMeeting' src
check_absent "No actions-page class" 'actions-page' src
check_absent "No handoff-page-1 class" 'handoff-page-1' src
check_absent "No handoff-page-2 class" 'handoff-page-2' src
check_absent "No decisions-cfo-outcomes class" 'decisions-cfo-outcomes' src
check_absent "No PersistedEditableDecisionList" 'PersistedEditableDecisionList' src
check_absent "No loadJuly2026" 'loadJuly2026' src
check_absent "No enrichJulyData" 'enrichJulyData' src
check_absent "No july2026.local loader" 'july2026\.local' src
check_absent "No stored generated analysis column" 'generated_analysis' src
check_absent "No obsolete meeting_data column" 'meeting_data' src
check_absent "No blank month creation path" 'createBlankLedgerMonth|createMonth\(' src
check_absent "No invite email compatibility argument" 'invite_email|LINK_ONLY_INVITE_EMAIL' src
check_absent "No exported listNavigableMonthIds(repo)" 'listNavigableMonthIds\(repo\)' src
check_absent "No months[].status in catalog" 'status:[[:space:]]*"(active|locked)"' src/data/months.js

if grep -Eq 'async[[:space:]]+listNavigableMonthIds' src/repository/LocalLedgerRepository.js; then
  echo "OK: LocalLedgerRepository.listNavigableMonthIds is async"
else
  echo "FAIL: LocalLedgerRepository.listNavigableMonthIds should be async"
  fail=1
fi

if grep -Eq 'class[[:space:]]+ConflictError' src/repository/errors.js; then
  echo "OK: Typed ConflictError exists"
else
  echo "FAIL: Missing ConflictError in repository/errors.js"
  fail=1
fi

if grep -q 'useLedgerMonths' src/App.jsx; then
  echo "OK: App uses reactive useLedgerMonths"
else
  echo "FAIL: App.jsx should use useLedgerMonths for month discovery"
  fail=1
fi

if grep -Eq 'const[[:space:]]+notebookPages[[:space:]]*=[[:space:]]*useMemo' src/App.jsx; then
  echo "OK: App builds notebookPages reactively"
else
  echo "FAIL: App.jsx should build notebookPages via useMemo + useLedgerMonths"
  fail=1
fi

check_month_literal_outside_data() {
  local literal="$1"
  local matches
  matches="$(
    find src -type f \
      ! -path 'src/data/months/*' \
      ! -path 'src/data/months.js' \
      ! -path 'src/utils/normalizePageId.js' \
      ! -path 'src/components/notebook/KitInteractiveSamples.jsx' \
      ! -path 'src/components/notebook/NotebookKitPage.jsx' \
      -print0 \
      | xargs -0 grep -En -- "$literal" 2>/dev/null \
      | head -20 \
      || true
  )"
  if [[ -n "$matches" ]]; then
    echo "FAIL: $literal conditionals outside data files and catalog"
    echo "$matches"
    fail=1
  else
    echo "OK: No $literal conditionals outside data/catalog"
  fi
}

check_month_literal_outside_data '2026-09'
check_month_literal_outside_data '2026-08'

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

if [[ -f docs/MONTHLY_LEDGER_RUN.md ]] \
  && grep -q 'TARGET_MONTH' docs/MONTHLY_LEDGER_RUN.md \
  && grep -q 'GitHub is read-only' docs/MONTHLY_LEDGER_RUN.md; then
  echo "OK: Monthly generation runbook is present and reusable"
else
  echo "FAIL: Missing or incomplete docs/MONTHLY_LEDGER_RUN.md"
  fail=1
fi

if [[ ! -f src/data/months/2026-10.sample.js ]]; then
  echo "OK: October intentionally has no sample file (graceful failure test)"
else
  echo "WARN: 2026-10.sample.js exists — catalog-only October expectation no longer applies"
fi

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "Architecture verification failed."
  exit 1
fi

echo ""
echo "Architecture verification passed."
