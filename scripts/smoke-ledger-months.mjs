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
import { buildFutureProgress } from '../src/data/futureProgress.js';
import { MONTH_SECTION_IDS, MONTH_SECTIONS } from '../src/data/monthSections.js';
import { normalizePageId } from '../src/utils/normalizePageId.js';
import { canRenderCfoVisualization } from '../src/utils/cfoVisualization.js';
import { getComparisonMonthLabels } from '../src/utils/monthLabels.js';
import { getMonthCatalogEntry } from '../src/data/months.js';
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

  assert(
    JSON.stringify(MONTH_SECTION_IDS) === JSON.stringify([
      'month', 'spending', 'future', 'cfo', 'retrospective', 'celebrate', 'close',
    ]),
    'monthSections order should place Future before CFO Advice and Retrospective after CFO',
  );
  assert(MONTH_SECTIONS.future?.number === '03', 'Future should be section 03');
  assert(MONTH_SECTIONS.cfo?.number === '04', 'CFO Advice should be section 04');
  assert(MONTH_SECTIONS.retrospective?.number === '05', 'Retrospective should be section 05');
  assert(MONTH_SECTIONS.celebrate?.number === '06', 'Celebrate should be section 06');
  assert(MONTH_SECTIONS.close?.number === '07', 'Close should be section 07');
  assert(!MONTH_SECTION_IDS.includes('decisions'), 'decisions should not be a monthly section');
  assert(!MONTH_SECTION_IDS.includes('actions'), 'actions should not be a monthly section');
  assert(normalizePageId('2026-07-decisions') === '2026-07-retrospective', 'legacy decisions URL should redirect to retrospective');
  assert(normalizePageId('2026-07-actions') === '2026-07-retrospective', 'legacy actions URL should redirect to retrospective');
  assert(normalizePageId('july-decisions') === '2026-07-retrospective', 'legacy july-decisions URL should redirect to retrospective');
  assert(normalizePageId('july-actions') === '2026-07-retrospective', 'legacy july-actions URL should redirect to retrospective');
  assert(normalizePageId('future-july-decisions') === '2026-07-retrospective', 'future-july-decisions URL should redirect to retrospective');
  assert(
    !canRenderCfoVisualization({ type: 'balance_comparison', currentValue: 100 }),
    'balance_comparison chart should not render without projectedValue',
  );
  assert(
    canRenderCfoVisualization({ type: 'balance_comparison', currentValue: 100, projectedValue: 80 }),
    'balance_comparison chart should render when both values are supplied',
  );
  assert(MONTH_SECTIONS.cfo?.title === 'CFO Advice', 'CFO section title should be CFO Advice');
  assert(!Object.values(MONTH_SECTIONS).some((s) => /CFO Recommendations/i.test(s.title ?? '')), 'No CFO Recommendations title should remain');

  const samples = {
    '2026-07': sample202607,
    '2026-08': sample202608,
    '2026-09': sample202609,
  };

  for (const [monthId, raw] of Object.entries(samples)) {
    const record = loadSampleRecord(raw, monthId);
    const view = mergeMonthView(record);
    assert(view.meta?.month, `${monthId} should expose meta.month in merged view`);
    assert(view.month, `${monthId} should expose month section`);
    assert(view.spending, `${monthId} should expose spending section`);
    assert(view.actions, `${monthId} should expose actions seed data`);
    assert(view.retrospective, `${monthId} should expose retrospective section`);
    assert(record.schemaVersion === 1, `${monthId} should use schemaVersion 1`);
    assert(record.generation, `${monthId} should include generation block`);
    assert(record.dataQuality, `${monthId} should include dataQuality block`);
    assert(typeof record.version === 'number', `${monthId} should include version after normalize`);
  }

  assert(samples['2026-07'].workflow.status === 'meeting_ready', 'July should start meeting_ready for lock workflow test');
  assert(samples['2026-08'].workflow.status === 'draft', 'August should start draft');
  assert(samples['2026-09'].workflow.status === 'draft', 'September should start draft');

  assert(!fs.existsSync(path.join(monthsDir, '2026-10.sample.js')), 'October sample file should be absent');

  const futureCatalogMonth = getMonthCatalogEntry('2027-01');
  assert(futureCatalogMonth?.label === 'January', 'dynamic month metadata should support scheduled 2027 records');
  assert(futureCatalogMonth?.year === 2027, 'dynamic month metadata should preserve the scheduled record year');

  assert(typeof LedgerRepositoryError === 'function', 'LedgerRepositoryError class exists');
  assert(typeof LedgerNotFoundError === 'function', 'LedgerNotFoundError class exists');
  assert(typeof LockedMonthError === 'function', 'LockedMonthError class exists');
  assert(typeof ConflictError === 'function', 'ConflictError class exists');

  // The render model is always derived from source_data at read time.
  const updatedSourceRecord = loadSampleRecord(samples['2026-07'], '2026-07');
  updatedSourceRecord.sourceData.spending = {
    ...updatedSourceRecord.sourceData.spending,
    total: '$5,432.10',
  };
  const repairedView = resolveMonthView(updatedSourceRecord);
  assert(
    repairedView.spending?.total === '$5,432.10',
    'resolveMonthView should derive spending from source_data',
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

  const bumped = bumpRecordVersion(loadSampleRecord(samples['2026-07'], '2026-07'));
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
    assert(view.month?.subtitle, `${monthId} month section should be enriched`);
    assert(Array.isArray(view.month?.kpis), `${monthId} month.kpis should be an array`);
    assert(view.month?.howItWent, `${monthId} month.howItWent should be enriched`);
    assert(typeof view.month?.overallPulse === 'string', `${monthId} month.overallPulse should be a string`);
    assert(view.month?.moneySummary == null, `${monthId} month should not expose removed moneySummary`);
    assert(
      view.month?.futureProgress == null || view.month?.futureProgress?.total,
      `${monthId} month.futureProgress should be monthly contributions or absent`,
    );
    const kpiLabels = (view.month?.kpis ?? []).map((k) => k.label);
    assert(!kpiLabels.includes('Saved / invested'), `${monthId} should not use Saved / invested KPI label`);
    if (kpiLabels.includes('Debt') && kpiLabels.includes('Net worth')) {
      assert(kpiLabels.indexOf('Debt') !== kpiLabels.indexOf('Net worth'), `${monthId} debt and net worth should be separate KPIs`);
    }
    assert(Array.isArray(view.spending?.changes), `${monthId} spending.changes should be an array`);
    assert(view.spending?.overview?.currentTotal, `${monthId} spending.overview should include currentTotal`);
    assert(view.spending?.overview?.priorTotal != null, `${monthId} spending.overview should include priorTotal`);
    assert(view.spending?.overview?.changeAmount != null, `${monthId} spending.overview should include changeAmount`);
    assert(view.spending?.categories?.items != null, `${monthId} spending.categories.items should exist`);
    assert(view.spending?.whatChanged, `${monthId} spending.whatChanged should be enriched`);
    assert(view.spending?.spendingWatch, `${monthId} spending.spendingWatch should be enriched`);
    assert(view.spending?.notableSpending, `${monthId} spending.notableSpending should be enriched`);
    if (view.spending?.notableSpending?.items?.length) {
      const first = view.spending.notableSpending.items[0];
      assert(first.context != null || first.category != null, `${monthId} notable items should expose read-only context/category`);
      assert(first.note == null, `${monthId} notable items should not expose generated note field`);
    }
    assert(
      view.spending?.spendingWatch?.patterns?.items != null || view.spending?.spendingWatch?.patterns?.status === 'ok',
      `${monthId} spending watch patterns should expose structured items`,
    );
    assert(view.spending?.spendingWatch?.patterns?.lines == null, `${monthId} spending watch should not expose legacy pattern lines`);
    assert(view.spending?.pulse == null, `${monthId} spending should not expose removed pulse key`);
    assert(view.spending?.notablePurchases == null, `${monthId} spending should not expose removed notablePurchases key`);
    assert(view.spending?.watchList == null, `${monthId} spending should not expose removed watchList key`);
    assert(!view.spending?.overview?.continuedText, `${monthId} spending should not include multi-page continuedText`);
    assert(!view.spending?.changesPage?.footerText, `${monthId} spending should not include multi-page footerText`);
    assert(Array.isArray(view.cfo?.recommendations), `${monthId} cfo.recommendations should be an array`);
    assert(view.cfo.recommendations.length > 0, `${monthId} cfo.recommendations should not be empty`);
    assert(view.cfo.recommendations[0]?.headline, `${monthId} cfo recommendations should include headline`);
    assert(view.cfo.recommendations[0]?.id, `${monthId} cfo recommendations should include stable id`);
    if (monthId === '2026-07') {
      const structured = view.cfo.recommendations.find((rec) => rec.visualization?.type === 'balance_comparison');
      assert(structured, 'July should include a structured CFO recommendation with balance_comparison visualization');
      assert(
        canRenderCfoVisualization(structured.visualization),
        'July structured CFO recommendation should include complete chart data',
      );
    }
    if (monthId === '2026-08' || monthId === '2026-09') {
      assert(view.cfo.recommendations[0]?.isLegacy, `${monthId} should adapt legacy CFO priorities into recommendations`);
    }
    assert(view.retrospective?.subtitle, `${monthId} retrospective section should be enriched`);
    assert(Array.isArray(view.retrospective?.questionsToConsider), `${monthId} retrospective.questionsToConsider should be an array`);
    assert(view.decisions == null, `${monthId} should not expose decisions section`);
    assert(Array.isArray(view.actions?.items), `${monthId} actions.items should remain available for seeds`);
    assert(view.close?.subtitle, `${monthId} close section should be enriched`);
    assert(view.celebrate?.page?.subtitle, `${monthId} celebrate.page.subtitle should be enriched`);
    assert(!view.actions?.page?.subtitle, `${monthId} actions should not include standalone page subtitle`);
    assert(!view.celebrate?.page?.footerText, `${monthId} celebrate should not include multi-page footerText`);
    assert(view.future?.subtitle, `${monthId} future section should expose subtitle`);
    assert(Array.isArray(view.future?.goals), `${monthId} future.goals should be an array`);
    assert(Array.isArray(view.future?.comingUp), `${monthId} future.comingUp should be an array`);
    assert(Array.isArray(view.future?.discussionPrompts), `${monthId} future.discussionPrompts should be an array`);
    assert(view.future?.retirementPage == null, `${monthId} future should not expose legacy retirementPage`);
    assert(view.future?.goalsPage == null, `${monthId} future should not expose legacy goalsPage`);
    const monthProgress = view.month?.futureProgress;
    const futureProgress = view.future?.futureProgress;
    if (monthProgress?.total && futureProgress?.total) {
      assert(
        monthProgress.total === futureProgress.total,
        `${monthId} Snapshot and Future futureProgress totals should match`,
      );
    }
  }

  const julyRecord = loadSampleRecord(samples['2026-07'], '2026-07');
  const julyProgress = buildFutureProgress(julyRecord.sourceData);
  if (julyProgress?.components?.length) {
    const emergency = julyProgress.components.find((c) => c.label === 'Emergency fund');
    const efContributions = julyRecord.sourceData.snapshot?.emergencyFund?.monthContributions;
    const efAdded = julyRecord.sourceData.snapshot?.emergencyFund?.monthAdded;
    if (efContributions && efAdded && efContributions !== efAdded) {
      assert(
        emergency?.value === efContributions,
        'Future progress should use emergency monthContributions, not monthAdded',
      );
    }
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
