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

function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

function itemsFromSection(section) {
  if (Array.isArray(section?.items)) return section.items;
  if (Array.isArray(section?.groups)) {
    return section.groups.flatMap((group) =>
      (group.items ?? []).map((item) => ({
        name: item.name ?? group.label ?? 'Item',
        amount: item.amount ?? '—',
      })),
    );
  }
  return [];
}

function explanationRowText(item) {
  if (item.note?.trim()) return item.note.trim();
  if (item.amount && item.amount !== '—') return String(item.amount);
  return '';
}

export function enrichStory(story = {}, meta) {
  const label = monthLabel(meta);
  const income = story.income ?? { total: '—', period: '', groups: [] };
  const endingPosition = story.endingPosition ?? { totalCash: '—', billsAccount: '—', available: '—' };
  const explanation = story.explanation ?? { items: [], closing: '' };
  const bills = story.bills ?? { groups: [] };
  const lifestyle = story.lifestyle ?? { groups: [] };
  const savings = story.savings ?? { missing: [] };
  const investments = story.investments ?? { monthContributions: '—' };
  const debtPayments = story.debtPayments ?? { items: [] };
  const regularIncome = sumGroupItems(income.groups ?? [], ['Regular take-home']);
  const benefitsIncome = sumGroupItems(income.groups ?? [], ['Benefits income']);
  const oneTimeIncome = sumGroupItems(income.groups ?? [], ['One-time income']);

  return {
    ...story,
    bills: {
      ...bills,
      items: itemsFromSection(bills),
    },
    lifestyle: {
      ...lifestyle,
      items: itemsFromSection(lifestyle),
    },
    savings: {
      missing: [],
      ...savings,
    },
    investments: {
      monthContributions: '—',
      ...investments,
    },
    debtPayments: {
      items: [],
      ...debtPayments,
    },
    explanation: {
      title: 'What explains the month',
      items: [],
      closing: '',
      ...explanation,
    },
    overview: {
      subtitle: 'How money came in this month — separated so recurring income is not inflated by one-time deposits.',
      kpis: [
        {
          icon: '💰',
          label: 'Total inflows',
          value: income.total,
          chip: { text: 'Tagged income', tone: 'green' },
          note: income.period?.trim() || '',
        },
        {
          icon: '🏢',
          label: 'Regular take-home',
          value: regularIncome,
          chip: { text: 'Recurring', tone: 'blue' },
          note: '',
        },
        {
          icon: '🎖️',
          label: 'Benefits income',
          value: benefitsIncome,
          chip: { text: 'Benefits', tone: 'purple' },
          note: '',
        },
        {
          icon: '🎓',
          label: 'One-time income',
          value: oneTimeIncome,
          chip: { text: 'Non-recurring', tone: 'yellow' },
          note: '',
          indicator: oneTimeIncome !== '$0' && oneTimeIncome !== '—' ? '!' : undefined,
        },
      ],
      continuedText: 'Bills and lifestyle spending continue on the next page →',
    },
    billsPage: {
      subtitle: 'Core monthly obligations on one side, flexible lifestyle spending on the other.',
      billsInsight: bills.insight?.trim()
        || 'These are the expenses the household expects each month.',
      lifestyleInsight: lifestyle.insight?.trim()
        || 'Flexible categories deserve a separate conversation from fixed bills.',
      continuedText: `Ending position and what explains ${label} continue on the next page →`,
    },
    endingPage: {
      subtitle: 'Where the month left us, what moved between accounts, and what drove the story.',
      endingPills: [
        { label: 'Connected cash', value: endingPosition.totalCash },
        { label: 'Bills account', value: endingPosition.billsAccount },
        { label: 'Freely available', value: endingPosition.available },
      ],
      explanationRows: (explanation.items ?? []).map((item) => ({
        icon: item.amount === '—' ? '📊' : '💸',
        title: item.name,
        text: explanationRowText(item),
      })),
      footerText: 'End of Monthly Story · Next: Spending',
      closingInsight: explanation.closing?.trim() || '',
    },
  };
}
