/**
 * Smoke tests for month loading, async repository, and versioning.
 * Run: npm run smoke:months
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
import {
  ConflictError,
  LedgerNotFoundError,
  LockedMonthError,
  LedgerRepositoryError,
} from '../src/repository/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monthsDir = path.join(__dirname, '../src/data/months');

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function assertExpectedVersion(record, options) {
  if (options?.expectedVersion == null) return;
  const currentVersion = record.version ?? 1;
  if (currentVersion !== options.expectedVersion) {
    throw new ConflictError(record.monthId, options.expectedVersion, currentVersion);
  }
}

function bumpRecordVersion(record) {
  return {
    ...record,
    version: (record.version ?? 1) + 1,
    updatedAt: new Date().toISOString(),
  };
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
    assert(typeof record.version === 'number', `${monthId} should include version after normalize`);
  }

  assert(samples['2026-07'].workflow.status === 'meeting_ready', 'July should start meeting_ready for lock workflow test');
  assert(samples['2026-08'].workflow.status === 'draft', 'August should start draft');
  assert(samples['2026-09'].workflow.status === 'draft', 'September should start draft');

  const blank = createBlankLedgerMonth('2026-08');
  assert(blank.version === 1, 'blank month should start at version 1');
  assert(blank.updatedAt === null, 'blank month updatedAt should be null');
  mergeMonthView(enrichLedgerMonth(blank));

  assert(!fs.existsSync(path.join(monthsDir, '2026-10.sample.js')), 'October sample file should be absent');

  assert(typeof LedgerRepositoryError === 'function', 'LedgerRepositoryError class exists');
  assert(typeof LedgerNotFoundError === 'function', 'LedgerNotFoundError class exists');
  assert(typeof LockedMonthError === 'function', 'LockedMonthError class exists');
  assert(typeof ConflictError === 'function', 'ConflictError class exists');

  const blankRecord = createBlankLedgerMonth('2026-07');
  const bumped = bumpRecordVersion(blankRecord);
  assert(bumped.version === 2, 'bumpRecordVersion increments version');
  assert(typeof bumped.updatedAt === 'string', 'bumpRecordVersion sets updatedAt');

  let conflictThrown = false;
  try {
    assertExpectedVersion(bumped, { expectedVersion: 1 });
  } catch (error) {
    conflictThrown = error instanceof ConflictError;
  }
  assert(conflictThrown, 'expectedVersion mismatch should throw ConflictError');

  const localRepoSource = fs.readFileSync(
    path.join(__dirname, '../src/repository/LocalLedgerRepository.js'),
    'utf8',
  );
  assert(localRepoSource.includes('async listNavigableMonthIds'), 'listNavigableMonthIds is async');
  assert(localRepoSource.includes('async unlockMonth'), 'unlockMonth is async');
  assert(localRepoSource.includes('async deleteAction'), 'deleteAction is async');
  assert(localRepoSource.includes('LockedMonthError'), 'repository throws LockedMonthError');

  const notFound = new LedgerNotFoundError('2099-01');
  assert(notFound instanceof LedgerRepositoryError, 'LedgerNotFoundError extends base error');
  const locked = new LockedMonthError('2026-07');
  assert(locked.code === 'LOCKED', 'LockedMonthError exposes code');
} catch (error) {
  errors.push(`Unexpected error: ${error.message}`);
}

if (errors.length) {
  console.error('Smoke tests failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Smoke tests passed.');
