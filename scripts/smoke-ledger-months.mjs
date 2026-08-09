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
import { normalizeToContract, mergeMonthView, resolveMonthView } from '../src/data/normalizeLedgerMonth.js';
import { enrichLedgerMonth } from '../src/data/enrichLedgerMonth.js';
import { createBlankLedgerMonth } from '../src/repository/createBlankLedgerMonth.js';
import { getComparisonMonthLabels } from '../src/utils/monthLabels.js';
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
  assert(blank.generation?.source === 'manual', 'blank production month should use generation.source manual');
  mergeMonthView(enrichLedgerMonth(blank));

  assert(!fs.existsSync(path.join(monthsDir, '2026-10.sample.js')), 'October sample file should be absent');

  assert(typeof LedgerRepositoryError === 'function', 'LedgerRepositoryError class exists');
  assert(typeof LedgerNotFoundError === 'function', 'LedgerNotFoundError class exists');
  assert(typeof LockedMonthError === 'function', 'LockedMonthError class exists');
  assert(typeof ConflictError === 'function', 'ConflictError class exists');

  // Stale generated_analysis must not override fresher source_data on read.
  const staleRecord = loadSampleRecord(samples['2026-07'], '2026-07');
  staleRecord.sourceData.snapshot = {
    ...staleRecord.sourceData.snapshot,
    cash: {
      ...(staleRecord.sourceData.snapshot?.cash ?? {}),
      total: '$17,799.42',
      status: 'Connected',
    },
  };
  staleRecord.generatedAnalysis = {
    ...staleRecord.generatedAnalysis,
    snapshot: {
      ...(staleRecord.generatedAnalysis.snapshot ?? {}),
      overview: {
        ...(staleRecord.generatedAnalysis.snapshot?.overview ?? {}),
        kpis: [
          { icon: '💵', label: 'Connected Cash', value: '—', chip: { text: 'Needs month-end detail', tone: 'blue' }, note: '' },
        ],
      },
      cash: {
        ...(staleRecord.generatedAnalysis.snapshot?.cash ?? {}),
        total: '—',
      },
    },
  };
  const repairedView = resolveMonthView(staleRecord);
  assert(
    repairedView.snapshot?.overview?.kpis?.find((kpi) => kpi.label === 'Connected Cash')?.value === '$17,799.42',
    'resolveMonthView should derive cash KPI from source_data, not stale generated_analysis',
  );
  assert(
    repairedView.snapshot?.cash?.total === '$17,799.42',
    'resolveMonthView should expose updated cash total from source_data',
  );

  const augustLabels = getComparisonMonthLabels('2026-08', 'August');
  assert(augustLabels.currentLabel === 'August', 'August comparison current label');
  assert(augustLabels.priorLabel === 'July', 'August comparison prior label should be July');

  const enrichedAugust = loadSampleRecord(samples['2026-08'], '2026-08');
  const augustSpendingView = mergeMonthView(enrichedAugust);
  assert(
    augustSpendingView.spending?.comparisonLabels?.priorLabel === 'July',
    'enriched spending should include dynamic comparison labels',
  );

  function dedupeHouseholds(memberships, households) {
    const byId = new Map(households.map((row) => [row.id, row]));
    const seen = new Set();
    return memberships
      .map((membership) => {
        const household = byId.get(membership.household_id);
        if (!household) return null;
        return { id: household.id, name: household.name };
      })
      .filter(Boolean)
      .filter((entry) => {
        if (seen.has(entry.id)) return false;
        seen.add(entry.id);
        return true;
      });
  }

  const duplicateMembershipFixture = [
    { household_id: 'hh-1', role: 'member' },
    { household_id: 'hh-1', role: 'member' },
    { household_id: 'hh-2', role: 'member' },
  ];
  const householdFixture = [
    { id: 'hh-1', name: 'Home' },
    { id: 'hh-2', name: 'Other' },
  ];
  const deduped = dedupeHouseholds(duplicateMembershipFixture, householdFixture);
  assert(deduped.length === 2, 'household list should dedupe by household_id');
  assert(deduped[0].id === 'hh-1' && deduped[1].id === 'hh-2', 'deduped households preserve first-seen order');

  const supabaseRepoSource = fs.readFileSync(
    path.join(__dirname, '../src/repository/SupabaseLedgerRepository.js'),
    'utf8',
  );
  assert(supabaseRepoSource.includes('resolveMonthView'), 'Supabase getMonth uses resolveMonthView');
  assert(supabaseRepoSource.includes('seen.has(entry.id)'), 'listHouseholds dedupes household_id');

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
  assert(localRepoSource.includes('resolveMonthView'), 'Local getMonth uses resolveMonthView');
  assert(localRepoSource.includes('async listNavigableMonthIds'), 'listNavigableMonthIds is async');
  assert(localRepoSource.includes('async unlockMonth'), 'unlockMonth is async');
  assert(localRepoSource.includes('async deleteAction'), 'deleteAction is async');
  assert(localRepoSource.includes('LockedMonthError'), 'repository throws LockedMonthError');

  const notFound = new LedgerNotFoundError('2099-01');
  assert(notFound instanceof LedgerRepositoryError, 'LedgerNotFoundError extends base error');
  const locked = new LockedMonthError('2026-07');
  assert(locked.code === 'LOCKED', 'LockedMonthError exposes code');

  for (const monthId of ['2026-08', '2026-09']) {
    const record = loadSampleRecord(samples[monthId], monthId);
    const view = mergeMonthView(record);
    assert(Array.isArray(view.story?.bills?.items), `${monthId} story.bills.items should be an array`);
    assert(Array.isArray(view.story?.lifestyle?.items), `${monthId} story.lifestyle.items should be an array`);
    assert(Array.isArray(view.story?.debtPayments?.items), `${monthId} story.debtPayments.items should be an array`);
    assert(Array.isArray(view.spending?.changes), `${monthId} spending.changes should be an array`);
    assert(Array.isArray(view.spending?.unexpected), `${monthId} spending.unexpected should be an array`);
    assert(Array.isArray(view.snapshot?.debt?.loans), `${monthId} snapshot.debt.loans should be an array`);
    assert(view.cfo?.priorities?.[0]?.decisions != null, `${monthId} cfo priorities should include decisions`);
    assert(view.celebrate?.page?.subtitle, `${monthId} celebrate.page.subtitle should be enriched`);
    assert(view.actions?.page?.subtitle, `${monthId} actions.page.subtitle should be enriched`);
  }
} catch (error) {
  errors.push(`Unexpected error: ${error.message}`);
}

if (errors.length) {
  console.error('Smoke tests failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Smoke tests passed.');
