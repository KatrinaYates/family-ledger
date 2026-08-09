import { getComparisonMonthLabels } from '../utils/monthLabels.js';

/** @param {object | undefined} meta @param {string} [monthId] */
function monthLabel(meta, monthId) {
  return meta?.month?.trim() || monthId || 'the month';
}

function formatChangeLabel(change, changePercent) {
  if (!change || change === '—') return '—';
  if (!changePercent || changePercent === '—') return String(change);
  return `${change} (${changePercent})`;
}

export function enrichSpending(spending = {}, meta) {
  const label = monthLabel(meta);
  const priorMonth = spending.priorMonth ?? '—';
  const change = spending.change ?? '—';
  const changePercent = spending.changePercent ?? '—';
  const comparisonLabels = getComparisonMonthLabels(meta?.monthId, label);
  return {
    ...spending,
    topCategories: (spending.topCategories ?? []).map((cat, index) => ({
      ...cat,
      rank: cat.rank ?? index + 1,
    })),
    momChanges: spending.momChanges ?? [],
    bigPurchases: spending.bigPurchases ?? [],
    unexpected: spending.unexpected ?? [],
    changes: spending.changes ?? spending.momChanges ?? [],
    questions: spending.questions ?? [],
    comparisonLabels,
    overview: {
      subtitle: `Where money flowed in ${label} — excluding transfers so spending is not double-counted.`,
      momLabel: 'vs prior month',
      changeLabel: formatChangeLabel(change, changePercent),
      continuedText: 'Category changes and big purchases continue on the next page →',
    },
    changesPage: {
      subtitle: 'What shifted from the prior month, which purchases stood out, and what to discuss together.',
      comparisonLabels,
      closingInsight: spending.closingInsight?.trim() || spending.changesPage?.closingInsight?.trim() || '',
      footerText: 'End of Spending · Next: CFO Recs',
    },
  };
}
