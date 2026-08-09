function parseAmount(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
}

function formatMoney(value) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Split household growth across kids when only aggregate totals exist in source data. */
function allocateKidsGrowth(accounts, household) {
  const householdAdded = parseAmount(household.monthAdded);
  if (!householdAdded || accounts.length === 0) return accounts;

  const hasPerKidGrowth = accounts.some(
    (account) => account.monthAdded || account.monthContributions || account.monthInterest,
  );
  if (hasPerKidGrowth) return accounts;

  const totalBalance = accounts.reduce((sum, account) => sum + parseAmount(account.balance), 0);
  if (!totalBalance) return accounts;

  const householdContrib = parseAmount(household.monthContributions);
  const householdInterest = parseAmount(household.monthInterest);

  return accounts.map((account) => {
    const share = parseAmount(account.balance) / totalBalance;
    return {
      ...account,
      monthAdded: formatMoney(householdAdded * share),
      monthContributions: formatMoney(householdContrib * share),
      monthInterest: formatMoney(householdInterest * share),
    };
  });
}

export function enrichFuture(future) {
  const retirement = future.retirement ?? {};
  const kidsSavings = future.kidsSavings ?? {};
  const rawAccounts = kidsSavings.accounts ?? [];
  const mappedAccounts = rawAccounts.map((account, index) => ({
    name: account.name ?? `Child ${index + 1}`,
    balance: account.balance ?? account.amount ?? '—',
    monthAdded: account.monthAdded ?? null,
    monthContributions: account.monthContributions ?? null,
    monthInterest: account.monthInterest ?? null,
  }));
  const accounts = allocateKidsGrowth(mappedAccounts, kidsSavings);

  return {
    ...future,
    goals: future.goals ?? [],
    upcomingExpenses: future.upcomingExpenses ?? [],
    kidsSavings: {
      total: '—',
      monthAdded: '—',
      monthContributions: '—',
      monthInterest: '—',
      accounts,
      note: 'Protected for the kids and excluded from household spendable cash.',
      ...kidsSavings,
      accounts,
    },
    retirement: {
      balance: '—',
      monthContributions: '—',
      projectionNote: '',
      goalNote: 'Define retirement targets together before locking this month.',
      ...retirement,
    },
    retirementPage: {
      subtitle: 'Where retirement stands today and what we still need to define for meaningful projections.',
      footerText: 'Goals and upcoming expenses continue on the next page →',
    },
    goalsPage: {
      subtitle: 'Shared goals and expenses on the horizon — balance future progress with life today.',
      footerText: 'End of Retirement & Future · Next: Money Meeting',
      closingInsight: future.closingInsight?.trim()
        || future.goalsPage?.closingInsight?.trim()
        || '',
    },
  };
}
