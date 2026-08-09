export function enrichFuture(future) {
  const retirement = future.retirement ?? {};
  const kidsSavings = future.kidsSavings ?? {};
  return {
    ...future,
    goals: future.goals ?? [],
    upcomingExpenses: future.upcomingExpenses ?? [],
    kidsSavings: {
      total: '—',
      monthAdded: '—',
      accounts: [],
      note: 'Protected for the kids and excluded from household spendable cash.',
      ...kidsSavings,
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
