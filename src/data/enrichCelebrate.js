export function enrichCelebrate(celebrate, meta) {
  return {
    ...celebrate,
    page: {
      subtitle: 'Pause to notice progress, effort, and direction — not only perfect results.',
      motto: meta?.motto || '',
    },
  };
}
