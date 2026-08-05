export function enrichSpending(spending) {
  return {
    ...spending,
    overview: {
      subtitle: 'Where money flowed in July — excluding transfers so spending is not double-counted.',
      momLabel: `vs June ${spending.priorMonth}`,
      changeLabel: `+${spending.change} (${spending.changePercent})`,
      continuedText: 'Category changes and big purchases continue on the next page →',
    },
    changesPage: {
      subtitle: 'What shifted from June, which purchases stood out, and what to discuss together.',
      closingInsight: 'Much of July\'s increase came from home repairs, vehicle repairs, and education — but flexible categories also rose.',
      footerText: 'End of Spending · Next: CFO Recs',
    },
  };
}
