function sumGroupItems(groups, labels) {
  let total = 0;
  for (const group of groups) {
    if (!labels.includes(group.label)) continue;
    for (const item of group.items) {
      total += parseAmount(item.amount);
    }
  }
  return formatCurrency(total);
}

function parseAmount(value) {
  if (!value || value === '—') return 0;
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

function formatCurrency(amount) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function enrichStory(story) {
  const { income } = story;
  const regularIncome = sumGroupItems(income.groups, ['Regular take-home']);
  const benefitsIncome = sumGroupItems(income.groups, ['Benefits income']);
  const oneTimeIncome = sumGroupItems(income.groups, ['One-time income']);

  return {
    ...story,
    overview: {
      subtitle: 'How money came in this month — separated so recurring income is not inflated by one-time deposits.',
      kpis: [
        {
          icon: '💰',
          label: 'Total inflows',
          value: income.total,
          chip: { text: 'Tagged income', tone: 'green' },
          note: income.period,
        },
        {
          icon: '🏢',
          label: 'Regular take-home',
          value: regularIncome,
          chip: { text: 'Recurring', tone: 'blue' },
          note: 'Two recurring payroll deposits.',
        },
        {
          icon: '🎖️',
          label: 'Benefits income',
          value: benefitsIncome,
          chip: { text: 'Monthly stipend', tone: 'purple' },
          note: 'Stable monthly stipend.',
        },
        {
          icon: '🎓',
          label: 'One-time income',
          value: oneTimeIncome,
          chip: { text: 'Non-recurring', tone: 'yellow' },
          note: 'Side payout — not normal monthly income.',
          indicator: '!',
        },
      ],
      continuedText: 'Bills and lifestyle spending continue on the next page →',
    },
    billsPage: {
      subtitle: 'Core monthly obligations on one side, flexible lifestyle spending on the other.',
      billsInsight: 'These are the expenses the household expects each month — mortgage, utilities, loan payments, and essentials.',
      lifestyleInsight: 'Flexible categories deserve a separate conversation from fixed bills.',
      continuedText: 'Ending position and what explains July continue on the next page →',
    },
    endingPage: {
      subtitle: 'Where the month left us, what moved between accounts, and what drove the story.',
      endingPills: [
        { label: 'Connected cash', value: story.endingPosition.totalCash },
        { label: 'Bills account', value: story.endingPosition.billsAccount },
        { label: 'Freely available', value: story.endingPosition.available },
      ],
      explanationRows: story.explanation.items.map((item) => ({
        icon: item.amount === '—' ? '📊' : '💸',
        title: item.name,
        text: item.amount === '—' ? 'Higher than June' : item.amount,
      })),
      footerText: 'End of Monthly Story · Next: Spending',
      closingInsight: story.explanation.closing,
    },
  };
}
