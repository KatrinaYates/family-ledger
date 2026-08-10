/**
 * Merge July Future-related source_data fields for Supabase production.
 * Run once after deploying the Future page redesign:
 *   node scripts/patch-july-future-source.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY or authenticated session with write access.
 * Uses VITE_SUPABASE_URL from .env.local when present.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

/** @param {string} filePath */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      }),
  );
}

const env = { ...process.env, ...loadEnvFile(envPath) };
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or key. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, key);

/** Fields to merge into ledger_months.source_data for 2026-07 */
const julyFuturePatch = {
  snapshot: {
    emergencyFund: {
      value: '$413.93',
      target: '$1,000',
      monthContributions: '$10.86',
      monthAdded: '$10.86',
      account: 'Ally Savings',
      remaining: '$586.07',
      context: 'Pause at $1,000 while high-interest debt remains the priority.',
    },
    debt: {
      monthPayments: '$1,579.39',
      measurementStatus: 'historical_baseline_unavailable',
    },
  },
  future: {
    retirement: {
      balance: '$70,094.59',
      monthContributions: '$1,421.82',
      balanceCaveat: 'Uses July 23–25 snapshots, not a true July 31 balance.',
    },
    kidsSavings: {
      total: '$2,131.57',
      monthContributions: '$77.00',
      monthInterest: '$5.05',
      accounts: [
        { name: 'Cole', balance: null, monthContributions: '$32' },
        { name: 'Clay', balance: null, monthContributions: '$45' },
      ],
      note: 'Protected for the kids and excluded from household spendable cash.',
    },
    goals: [],
    upcoming: [],
  },
};

/** @param {object} base @param {object} patch */
function deepMerge(base, patch) {
  const result = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(base?.[key] ?? {}, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const { data: row, error: fetchError } = await supabase
  .from('ledger_months')
  .select('id, month_id, source_data, version')
  .eq('month_id', '2026-07')
  .maybeSingle();

if (fetchError) {
  console.error('Fetch failed:', fetchError.message);
  process.exit(1);
}

if (!row) {
  console.error('No 2026-07 ledger_months row found.');
  process.exit(1);
}

const sourceData = row.source_data ?? {};
const nextSource = {
  ...sourceData,
  snapshot: deepMerge(sourceData.snapshot ?? {}, julyFuturePatch.snapshot),
  future: deepMerge(sourceData.future ?? {}, julyFuturePatch.future),
};

if (sourceData.snapshot?.debt?.total) {
  nextSource.snapshot.debt = {
    ...nextSource.snapshot.debt,
    total: sourceData.snapshot.debt.total,
    monthPayments: julyFuturePatch.snapshot.debt.monthPayments,
    measurementStatus: julyFuturePatch.snapshot.debt.measurementStatus,
  };
}

const { error: updateError } = await supabase
  .from('ledger_months')
  .update({
    source_data: nextSource,
    updated_at: new Date().toISOString(),
  })
  .eq('id', row.id);

if (updateError) {
  console.error('Update failed:', updateError.message);
  process.exit(1);
}

console.log('Patched 2026-07 source_data with Future contract fields.');
console.log('Re-open the Future tab to verify enrichment from updated source data.');
