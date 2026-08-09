function parseAmount(value) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

function statusChip(status, fallbackText, fallbackTone) {
  const text = status?.trim();
  if (!text) return { text: fallbackText, tone: fallbackTone };
  return { text, tone: fallbackTone };
}

function insightSummaryRows(snapshot) {
  const rows = [];
  if (snapshot.netWorth?.insight?.trim()) {
    rows.push({ icon: '📈', title: 'Net worth', text: snapshot.netWorth.insight.trim() });
  }
  if (snapshot.cash?.insight?.trim()) {
    rows.push({ icon: '💵', title: 'Cash', text: snapshot.cash.insight.trim() });
  }
  if (snapshot.debt?.insight?.trim()) {
    rows.push({ icon: '💳', title: 'Debt', text: snapshot.debt.insight.trim() });
  }
  if (snapshot.retirement?.insight?.trim()) {
    rows.push({ icon: '🌱', title: 'Retirement', text: snapshot.retirement.insight.trim() });
  }
  return rows;
}

/** Derives snapshot page presentation data from core financial figures. */
export function enrichSnapshot(snapshot = {}, meta) {
  const monthName = meta?.month?.trim() || 'the month';
  const contributions = snapshot.retirement?.monthContributions ?? '—';

  const cashAccounts = (snapshot.cash?.accounts ?? []).map((account) => ({
    ...account,
    ...cashAccountMeta(account.name),
  }));

  const retirementSorted = [...(snapshot.retirement?.accounts ?? [])].sort(
    (a, b) => parseAmount(b.amount) - parseAmount(a.amount),
  );

  const summaryRows = snapshot.overview?.summaryRows?.length
    ? snapshot.overview.summaryRows
    : insightSummaryRows(snapshot);

  const missingBeforeLock = snapshot.missingBeforeLock
    ?? snapshot.overview?.missingBeforeLock
    ?? [];

  return {
    ...snapshot,
    debt: {
      total: snapshot.debt?.total ?? '—',
      insight: snapshot.debt?.insight ?? '',
      loans: snapshot.debt?.loans ?? [],
      creditCards: snapshot.debt?.creditCards ?? [],
      ...(snapshot.debt ?? {}),
    },
    overview: {
      subtitle: 'The big picture first: what we have, what we owe, and where our attention belongs this month.',
      kpis: [
        {
          icon: '📈',
          label: 'Connected Net Worth',
          value: snapshot.netWorth?.value ?? '—',
          chip: statusChip(snapshot.netWorth?.status, 'Review', 'green'),
          note: snapshot.netWorth?.insight?.trim() || snapshot.netWorth?.caveat?.trim() || '',
        },
        {
          icon: '💵',
          label: 'Connected Cash',
          value: snapshot.cash?.total ?? '—',
          chip: statusChip(snapshot.cash?.status, 'Review', 'blue'),
          note: snapshot.cash?.insight?.trim() || '',
        },
        {
          icon: '🛟',
          label: 'Emergency Fund',
          value: snapshot.emergencyFund?.value ?? '—',
          chip: statusChip(snapshot.emergencyFund?.status, 'Review', 'yellow'),
          note: snapshot.emergencyFund?.insight?.trim() || snapshot.emergencyFund?.description?.trim() || '',
          indicator: snapshot.emergencyFund?.status ? undefined : '!',
        },
        {
          icon: '🌱',
          label: 'Retirement',
          value: snapshot.retirement?.total ?? '—',
          chip: statusChip(snapshot.retirement?.status, 'Review', 'purple'),
          note: snapshot.retirement?.insight?.trim()
            || (contributions !== '—' ? `About ${contributions} was contributed during ${monthName}.` : ''),
        },
      ],
      summaryRows,
      pulseInsight: snapshot.overview?.pulseInsight ?? '',
      biggestWin: meta?.biggestWin?.trim() || snapshot.overview?.biggestWin?.trim() || '',
      biggestFocus: meta?.biggestFocus?.trim() || snapshot.overview?.biggestFocus?.trim() || '',
      missingBeforeLock,
      continuedText: 'Cash and retirement continue on the next page →',
    },
    cash: {
      ...(snapshot.cash ?? {}),
      total: snapshot.cash?.total ?? '—',
      totalExact: snapshot.cash?.totalExact || snapshot.cash?.total || '—',
      accounts: cashAccounts,
      betterKpiInsight: snapshot.cash?.insight?.trim() || '',
      continuedText: 'Debt details and final status continue on the next page →',
    },
    retirement: {
      ...(snapshot.retirement ?? {}),
      total: snapshot.retirement?.total ?? '—',
      totalExact: snapshot.retirement?.totalExact || snapshot.retirement?.total || '—',
      accountsSorted: retirementSorted,
      contributionNote: snapshot.retirement?.contributionNote
        || 'Employee contributions, employer match, profit-sharing, and after-tax contributions.',
    },
    emergencyFund: {
      ...(snapshot.emergencyFund ?? {}),
      value: snapshot.emergencyFund?.value ?? '—',
      headline: snapshot.emergencyFund?.status?.trim() || 'Define together',
      description: snapshot.emergencyFund?.description?.trim()
        || snapshot.emergencyFund?.insight?.trim()
        || '',
      checks: snapshot.emergencyFund?.checks ?? [
        'Choose the account',
        'Confirm the balance',
        'Set the first target',
        'Define an emergency',
      ],
    },
    debtPage: {
      subtitle: `A complete view of connected debt, key risks, and what must be decided before ${monthName} is locked.`,
      overallStatus: {
        title: snapshot.netWorth?.status?.trim() || 'Review connected balances',
        text: snapshot.netWorth?.insight?.trim() || snapshot.debt?.insight?.trim() || '',
      },
      healthScore: {
        title: snapshot.healthScore?.title || 'Not included yet',
        text: snapshot.healthScore?.text
          || 'Add a health score when the formula is transparent and tied to real financial behaviors.',
      },
      readyToLock: snapshot.debtPage?.readyToLock ?? missingBeforeLock,
      finalInsight: snapshot.debtPage?.finalInsight?.trim() || snapshot.debt?.insight?.trim() || '',
      footerText: 'End of Financial Snapshot · Next: Monthly Story',
    },
  };
}

function cashAccountMeta(name) {
  const map = {
    'Household bills': { tag: 'assigned', tagLabel: 'Assigned' },
    'Bills account': { tag: 'assigned', tagLabel: 'Assigned' },
    'Maple jar': { tag: 'protected', tagLabel: 'Goal jar' },
    'River jar': { tag: 'protected', tagLabel: 'Goal jar' },
    'Daily checking': { tag: 'available', tagLabel: 'Available' },
    'Basic checking': { tag: 'available', tagLabel: 'Available' },
    'Living account': { tag: 'available', tagLabel: 'Available' },
    'Rainy day fund': { tag: 'review', tagLabel: 'Emergency' },
    'General savings': { tag: 'review', tagLabel: 'Needs definition' },
    'Vacation jar': { tag: 'review', tagLabel: 'Goal jar' },
    'Garage project jar': { tag: 'review', tagLabel: 'Goal jar' },
    'Partners savings': { tag: 'review', tagLabel: 'Unclear purpose' },
    'Payment app': { tag: 'neutral', tagLabel: 'Empty' },
    'PayPal': { tag: 'neutral', tagLabel: 'Empty' },
  };
  return map[name] || { tag: 'neutral', tagLabel: 'Other' };
}
