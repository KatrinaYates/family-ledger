/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

export function enrichFuture(future, meta) {
  const label = monthLabel(meta);
  return {
    ...future,
    retirementPage: {
      subtitle: 'Where retirement stands today and what we still need to define for meaningful projections.',
      footerText: 'Goals and upcoming expenses continue on the next page →',
    },
    goalsPage: {
      subtitle: 'Shared goals and expenses on the horizon — balance future progress with life today.',
      footerText: 'End of Retirement & Future · Next: Money Meeting',
      closingInsight: `Retirement contributions stayed consistent in ${label}. Naming goals and upcoming costs makes monthly decisions easier.`,
    },
  };
}
