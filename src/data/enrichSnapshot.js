/** Derives snapshot page presentation data from core financial figures. */
export function enrichSnapshot(snapshot = {}, meta) {
  const monthName = meta?.month?.trim() || 'the month';
  const cashAccounts = (snapshot.cash?.accounts ?? []).map((account) => ({
    ...account,
    ...cashAccountMeta(account.name),
  }));

  const retirementSorted = [...(snapshot.retirement?.accounts ?? [])].sort(
    (a, b) => parseAmount(b.amount) - parseAmount(a.amount),
  );

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
          chip: { text: 'Positive', tone: 'green' },
          note: 'Cash plus retirement minus connected debt.',
        },
        {
          icon: '💵',
          label: 'Connected Cash',
          value: snapshot.cash?.total ?? '—',
          chip: { text: 'Mostly assigned', tone: 'blue' },
          note: 'Most cash is reserved for bills or children\'s savings.',
        },
        {
          icon: '🛟',
          label: 'Emergency Fund',
          value: snapshot.emergencyFund?.value ?? '—',
          chip: { text: 'Needs definition', tone: 'yellow' },
          note: 'No account is clearly designated as the emergency fund.',
          indicator: '!',
        },
        {
          icon: '🌱',
          label: 'Retirement',
          value: snapshot.retirement?.total ?? '—',
          chip: { text: 'Strongest area', tone: 'purple' },
          note: `About ${snapshot.retirement?.monthContributions ?? snapshot.retirement?.julyContributions ?? '—'} was contributed during ${meta?.month ?? 'the month'}.`,
        },
      ],
      summaryRows: [
        {
          icon: '🏠',
          title: 'Connected net worth only',
          text: 'Home value, mortgage balance, and unconnected accounts are not included.',
        },
        {
          icon: '💳',
          title: 'Debt remains the biggest drag',
          text: 'Connected debt is nearly as large as the retirement balance.',
        },
        {
          icon: '🧾',
          title: 'Cash is not the same as available cash',
          text: 'The Bills account and children\'s savings make the total look more flexible than it is.',
        },
      ],
      pulseInsight: 'income remained strong and retirement kept growing, but high-interest debt and limited unassigned cash reduce flexibility.',
      biggestWin: `We still invested about ${snapshot.retirement?.monthContributions ?? snapshot.retirement?.julyContributions ?? '—'} for retirement during an expensive month. ✨`,
      biggestFocus: 'Stop high-interest card growth and define a real emergency fund.',
      missingBeforeLock: [
        'Home value and mortgage',
        'Emergency-fund account',
        'Card APR details',
        'Brokerage link refresh',
      ],
      continuedText: 'Cash and retirement continue on the next page →',
    },
    cash: {
      ...(snapshot.cash ?? {}),
      total: snapshot.cash?.total ?? '—',
      totalExact: snapshot.cash?.totalExact || snapshot.cash?.total || '—',
      accounts: cashAccounts,
      betterKpiInsight: 'separate bills funded, available spending, emergency savings, children\'s savings, and sinking funds.',
      continuedText: 'Debt details and final status continue on the next page →',
    },
    retirement: {
      ...(snapshot.retirement ?? {}),
      total: snapshot.retirement?.total ?? '—',
      totalExact: snapshot.retirement?.totalExact || snapshot.retirement?.total || '—',
      accountsSorted: retirementSorted,
      contributionNote: 'Employee contributions, employer match, profit-sharing, and after-tax contributions.',
    },
    emergencyFund: {
      ...(snapshot.emergencyFund ?? {}),
      value: snapshot.emergencyFund?.value ?? '—',
      headline: 'Needs a household definition',
      description: snapshot.emergencyFund?.description || `The only clearly identifiable general savings balance is ${snapshot.emergencyFund?.value ?? '—'}, but the Bills account may contain additional cushion.`,
      checks: [
        'Choose the account',
        'Confirm the balance',
        'Set the first target',
        'Define an emergency',
      ],
    },
    debtPage: {
      subtitle: `A complete view of connected debt, key risks, and what must be decided before ${monthName} is locked.`,
      overallStatus: {
        title: 'Positive, but debt-heavy',
        text: snapshot.netWorth?.insight ?? '',
      },
      healthScore: {
        title: 'Not included yet',
        text: 'Wait until the formula is transparent and tied to real financial behaviors.',
      },
      readyToLock: [
        'Mortgage and home value are added',
        'Emergency savings are defined',
        'Card rates are confirmed',
        'Brokerage link is current',
      ],
      finalInsight: `${monthName}'s strongest foundation is retirement. ${monthName}'s clearest risk is expensive revolving debt.`,
      footerText: 'End of Financial Snapshot · Next: Monthly Story',
    },
  };
}

function parseAmount(value) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
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
