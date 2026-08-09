function parseAmount(value) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

  const availableCash = cashAccounts
    .filter((account) => account.cashClass === 'available')
    .reduce((sum, account) => sum + parseAmount(account.amount), 0);
  const protectedCash = cashAccounts
    .filter((account) => account.cashClass === 'protected')
    .reduce((sum, account) => sum + parseAmount(account.amount), 0);
  const unclassifiedCash = cashAccounts
    .filter((account) => !['available', 'protected'].includes(account.cashClass))
    .reduce((sum, account) => sum + parseAmount(account.amount), 0);

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
      availableTotal: formatCurrency(availableCash),
      protectedTotal: formatCurrency(protectedCash),
      unclassifiedTotal: unclassifiedCash ? formatCurrency(unclassifiedCash) : '',
      betterKpiInsight: snapshot.cash?.insight?.trim() || '',
      continuedText: 'Debt details and final status continue on the next page →',
    },
    retirement: {
      ...(snapshot.retirement ?? {}),
      total: snapshot.retirement?.total ?? '—',
      totalExact: snapshot.retirement?.totalExact || snapshot.retirement?.total || '—',
      accountsSorted: retirementSorted,
      protectionLabel: 'Protected long-term money',
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
  const normalized = String(name || '').trim().toLowerCase();
  const map = {
    'household bills': { tag: 'assigned', tagLabel: 'Protected · bills', cashClass: 'protected' },
    'bills account': { tag: 'assigned', tagLabel: 'Protected · bills', cashClass: 'protected' },
    'bills': { tag: 'assigned', tagLabel: 'Protected · bills', cashClass: 'protected' },
    'cole': { tag: 'protected', tagLabel: 'Protected · kids', cashClass: 'protected' },
    'clay': { tag: 'protected', tagLabel: 'Protected · kids', cashClass: 'protected' },
    'maple jar': { tag: 'protected', tagLabel: 'Protected · goal', cashClass: 'protected' },
    'river jar': { tag: 'protected', tagLabel: 'Protected · goal', cashClass: 'protected' },
    'daily checking': { tag: 'available', tagLabel: 'Available', cashClass: 'available' },
    'basic checking': { tag: 'available', tagLabel: 'Available', cashClass: 'available' },
    'partners checking': { tag: 'available', tagLabel: 'Available', cashClass: 'available' },
    'living account': { tag: 'available', tagLabel: 'Available', cashClass: 'available' },
    'living': { tag: 'available', tagLabel: 'Available', cashClass: 'available' },
    'rainy day fund': { tag: 'protected', tagLabel: 'Protected · emergency', cashClass: 'protected' },
    'general savings': { tag: 'protected', tagLabel: 'Protected · savings', cashClass: 'protected' },
    'savings': { tag: 'protected', tagLabel: 'Protected · emergency', cashClass: 'protected' },
    'partners savings': { tag: 'protected', tagLabel: 'Protected · savings', cashClass: 'protected' },
    'vacation jar': { tag: 'protected', tagLabel: 'Protected · goal', cashClass: 'protected' },
    'garage project jar': { tag: 'protected', tagLabel: 'Protected · goal', cashClass: 'protected' },
    'payment app': { tag: 'neutral', tagLabel: 'Available if funded', cashClass: 'available' },
    'paypal': { tag: 'neutral', tagLabel: 'Available if funded', cashClass: 'available' },
  };
  return map[normalized] || { tag: 'neutral', tagLabel: 'Needs classification', cashClass: 'unclassified' };
}
