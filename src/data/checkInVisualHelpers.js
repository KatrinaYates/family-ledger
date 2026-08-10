/** @param {number | string | null | undefined} value */
export function parseCheckInAmount(value) {
  if (value == null || value === '') return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * @param {Array<{ key: string, label: string, value: number | null, tone: string }>} items
 * @param {number | null} [totalOverride]
 */
export function buildStackedComposition(items, totalOverride = null) {
  const valid = items.filter((item) => item.value != null && item.value > 0);
  const total = totalOverride ?? valid.reduce((sum, item) => sum + item.value, 0);
  if (total == null || total <= 0 || valid.length === 0) return null;

  const segments = valid.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }));

  const percentSum = segments.reduce((sum, item) => sum + item.percent, 0);
  if (percentSum !== 100 && segments.length > 0) {
    segments[segments.length - 1].percent += 100 - percentSum;
  }

  return { total, segments };
}

/** @param {number | null} part @param {number | null} total */
export function progressPercent(part, total) {
  if (part == null || total == null || total <= 0) return null;
  return Math.min(100, Math.round((part / total) * 100));
}

/** @param {number | null} value @param {number | null} max */
export function relativeHeightPercent(value, max) {
  if (value == null || max == null || max <= 0) return 0;
  return Math.max(8, Math.round((value / max) * 100));
}

/** @param {Array<{ balance?: number | string, amount?: number | string, classification?: string }>} accounts */
export function sumAccountsByClassification(accounts, classification) {
  return (accounts ?? []).reduce((sum, account) => {
    if (account.classification !== classification) return sum;
    const amount = parseCheckInAmount(account.balance ?? account.amount);
    return amount != null ? sum + amount : sum;
  }, 0);
}

/** @param {Array<{ balance?: number | string, amount?: number | string }>} items */
export function sumAmounts(items) {
  return (items ?? []).reduce((sum, item) => {
    const amount = parseCheckInAmount(item.balance ?? item.amount);
    return amount != null ? sum + amount : sum;
  }, 0);
}

/**
 * @param {Array<{ date?: string, day?: string, amount?: number | string, spend?: number | string }>} daily
 */
export function buildDailySpendBars(daily) {
  if (!Array.isArray(daily) || daily.length === 0) return null;

  const bars = daily
    .map((entry, index) => {
      const value = parseCheckInAmount(entry.amount ?? entry.spend);
      if (value == null) return null;
      const date = entry.date ?? entry.day ?? `Day ${index + 1}`;
      return {
        key: `${date}-${index}`,
        label: formatShortDayLabel(date),
        date,
        value,
      };
    })
    .filter(Boolean);

  if (bars.length === 0) return null;

  const max = Math.max(...bars.map((bar) => bar.value));
  return bars.map((bar) => ({
    ...bar,
    heightPercent: relativeHeightPercent(bar.value, max),
  }));
}

function formatShortDayLabel(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(parsed);
}
