export function enrichFuture(future) {
  return {
    ...future,
    retirementPage: {
      subtitle: 'Where retirement stands today and what we still need to define for meaningful projections.',
      footerText: 'Goals and upcoming expenses continue on the next page →',
    },
    goalsPage: {
      subtitle: 'Shared goals and expenses on the horizon — balance future progress with life today.',
      footerText: 'End of Retirement & Future · Next: Money Meeting',
      closingInsight: 'Retirement contributions stayed consistent in July. Naming goals and upcoming costs makes monthly decisions easier.',
    },
  };
}
