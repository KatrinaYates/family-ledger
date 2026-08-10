import { enrichLedgerMonth } from '../src/data/enrichLedgerMonth.js';
import { normalizeToContract } from '../src/data/normalizeLedgerMonth.js';
import { buildFutureProgress } from '../src/data/futureProgress.js';

const julySource = {
  meta: { month: 'July', year: 2026, monthId: '2026-07' },
  snapshot: {
    emergencyFund: {
      value: '$413.93',
      target: '$1,000',
      monthContributions: '$10.86',
      monthAdded: '$15.91',
      context: 'Pause at $1,000 while high-interest debt remains the priority.',
    },
    debt: {
      total: '$59,281.34',
      monthPayments: '$1,579.39',
      measurementStatus: 'historical_baseline_unavailable',
    },
    retirement: { monthContributions: '$1,421.82' },
  },
  story: { investments: { monthContributions: '$1,421.82' } },
  future: {
    retirement: {
      balance: '$70,094.59',
      monthContributions: '$1,421.82',
      balanceCaveat: 'Uses July 23–25 snapshots, not a true July 31 balance.',
    },
    kidsSavings: {
      total: '$2,131.57',
      monthContributions: '$77.00',
      accounts: [
        { name: 'Cole', monthContributions: '$32' },
        { name: 'Clay', monthContributions: '$45' },
      ],
      note: 'Protected for the kids and excluded from household spendable cash.',
    },
    upcoming: [],
  },
};

const record = enrichLedgerMonth(
  normalizeToContract({ schemaVersion: 1, sourceData: julySource, workflow: { status: 'meeting_ready' } }, '2026-07'),
);
const fp = buildFutureProgress(record.sourceData);
const { month, future } = record.generatedAnalysis;

const checks = [
  ['future progress total', fp?.total === '$3,089.07'],
  ['debt in future progress', fp?.components?.some((c) => c.label === 'Debt payments' && c.value === '$1,579.39')],
  ['emergency uses contributions not interest-inflated monthAdded', fp?.components?.find((c) => c.label === 'Emergency fund')?.value === '$10.86'],
  ['snapshot/future parity', month.futureProgress?.total === future.futureProgress?.total],
  ['four goals', future.goals?.length === 4],
  ['debt caveat present', future.goals?.find((g) => g.type === 'debt')?.caveat?.includes('Principal change unavailable')],
  ['retirement caveat present', future.goals?.find((g) => g.type === 'retirement')?.caveat?.includes('July 23–25')],
  ['kids splits', future.goals?.find((g) => g.type === 'kids-savings')?.childSplits?.length === 2],
  ['discussion prompts', future.discussionPrompts?.length >= 2],
  ['empty coming up copy path', future.comingUp?.length === 0],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  console.log('\nDebug:', JSON.stringify({ fp, summary: future.summary, goals: future.goals?.map((g) => g.title) }, null, 2));
  process.exit(1);
}

console.log('\nJuly Future verification passed.');
