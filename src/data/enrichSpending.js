import { getComparisonMonthLabels } from '../utils/monthLabels.js';
import { analyzeSpending } from './spendingAnalysis.js';

/** @param {object | undefined} meta @param {string} [monthId] */
function monthLabel(meta, monthId) {
  return meta?.month?.trim() || monthId || 'the month';
}

export function enrichSpending(spending = {}, meta) {
  const label = monthLabel(meta, meta?.monthId);
  const comparisonLabels = getComparisonMonthLabels(meta?.monthId, label);
  const analysis = analyzeSpending(spending, meta);

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
    subtitle: 'Where did our money go, what changed, and what deserves attention?',
    ...analysis,
  };
}
