export function enrichFuture(future) {
  const retirement = future.retirement ?? {};
  const kidsSavings = future.kidsSavings ?? {};
  const rawAccounts = kidsSavings.accounts ?? [];
  const accounts = rawAccounts.map((account, index) => ({
    name: account.name ?? `Child ${index + 1}`,
    balance: account.balance ?? account.amount ?? '—',
    monthAdded: account.monthAdded ?? null,
    monthContributions: account.monthContributions ?? null,
    monthInterest: account.monthInterest ?? null,
  }));

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
