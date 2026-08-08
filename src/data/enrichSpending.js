/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
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
  return {
    ...spending,
    topCategories: spending.topCategories ?? [],
    momChanges: spending.momChanges ?? [],
    bigPurchases: spending.bigPurchases ?? [],
    unexpected: spending.unexpected ?? [],
    changes: spending.changes ?? spending.momChanges ?? [],
    questions: spending.questions ?? [],
    overview: {
      subtitle: `Where money flowed in ${label} — excluding transfers so spending is not double-counted.`,
      momLabel: 'vs prior month',
      changeLabel: formatChangeLabel(change, changePercent),
      continuedText: 'Category changes and big purchases continue on the next page →',
    },
    changesPage: {
      subtitle: 'What shifted from the prior month, which purchases stood out, and what to discuss together.',
      closingInsight: spending.closingInsight?.trim() || spending.changesPage?.closingInsight?.trim() || '',
      footerText: 'End of Spending · Next: CFO Recs',
    },
  };
}
