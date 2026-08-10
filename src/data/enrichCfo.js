/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

const TIER_LABELS = {
  first: 'Do this first',
  next: 'Consider next',
  watch: 'Watch',
};

/** @param {number} index @param {number} total */
function assignTier(index, total) {
  if (index === 0) return 'first';
  if (index === 1 && total > 1) return 'next';
  return 'watch';
}

export function enrichCfo(cfo = {}, meta) {
  const label = monthLabel(meta);
  const rawPriorities = cfo.priorities ?? [];

  const priorities = rawPriorities.map((p, index, arr) => {
    const tier = p.tier ?? assignTier(index, arr.length);
    return {
      ...p,
      tier,
      tierLabel: TIER_LABELS[tier] ?? TIER_LABELS.watch,
      number: p.number ?? index + 1,
      decisions: p.decisions ?? [],
    };
  });

  const tiers = {
    first: priorities.filter((p) => p.tier === 'first'),
    next: priorities.filter((p) => p.tier === 'next'),
    watch: priorities.filter((p) => p.tier === 'watch'),
  };

  return {
    ...cfo,
    priorities,
    tiers,
    overview: {
      subtitle: `Prioritized recommendations based on ${label}'s full financial picture.`,
    },
  };
}
