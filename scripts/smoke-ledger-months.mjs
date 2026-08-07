/**
 * Smoke tests for month loading and blank-month enrichment.
 * Run: npm run smoke:months
 *
 * Uses direct sample imports (Node has no import.meta.glob).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sample202607 from '../src/data/months/2026-07.sample.js';
import sample202608 from '../src/data/months/2026-08.sample.js';
import sample202609 from '../src/data/months/2026-09.sample.js';
import { normalizeToContract, mergeMonthView } from '../src/data/normalizeLedgerMonth.js';
import { enrichLedgerMonth } from '../src/data/enrichLedgerMonth.js';
import { createBlankLedgerMonth } from '../src/repository/createBlankLedgerMonth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monthsDir = path.join(__dirname, '../src/data/months');

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function loadSampleRecord(raw, monthId) {
  const normalized = normalizeToContract(raw, monthId);
  return enrichLedgerMonth(normalized);
}

try {
  const sampleFiles = fs
    .readdirSync(monthsDir)
    .filter((name) => name.endsWith('.sample.js'))
    .map((name) => name.replace('.sample.js', ''))
    .sort();

  assert(sampleFiles.includes('2026-07'), 'July sample file should exist');
  assert(sampleFiles.includes('2026-08'), 'August sample file should exist');
  assert(sampleFiles.includes('2026-09'), 'September sample file should exist');
  assert(!sampleFiles.includes('2026-10'), 'October should not have a sample file');

  const samples = {
    '2026-07': sample202607,
    '2026-08': sample202608,
    '2026-09': sample202609,
  };

  for (const [monthId, raw] of Object.entries(samples)) {
    const record = loadSampleRecord(raw, monthId);
    const view = mergeMonthView(record);
    assert(view.meta?.month, `${monthId} should expose meta.month in merged view`);
    assert(view.snapshot, `${monthId} should expose snapshot section`);
    assert(view.story, `${monthId} should expose story section`);
    assert(view.actions, `${monthId} should expose actions section`);
    assert(record.schemaVersion === 1, `${monthId} should use schemaVersion 1`);
    assert(record.generation, `${monthId} should include generation block`);
    assert(record.dataQuality, `${monthId} should include dataQuality block`);
  }

  assert(samples['2026-07'].workflow.status === 'meeting_ready', 'July should start meeting_ready for lock workflow test');
  assert(samples['2026-08'].workflow.status === 'draft', 'August should start draft');
  assert(samples['2026-09'].workflow.status === 'draft', 'September should start draft');

  const blank = createBlankLedgerMonth('2026-08');
  mergeMonthView(enrichLedgerMonth(blank));

  assert(!fs.existsSync(path.join(monthsDir, '2026-10.sample.js')), 'October sample file should be absent');
} catch (error) {
  errors.push(`Unexpected error: ${error.message}`);
}

if (errors.length) {
  console.error('Smoke tests failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Smoke tests passed.');
