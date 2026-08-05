export function enrichCelebrate(celebrate, meta) {
  return {
    ...celebrate,
    page: {
      subtitle: 'Pause to notice progress, effort, and direction — not only perfect results.',
      footerText: 'End of Celebrate · Next: CFO Handoff',
      motto: meta?.motto || '',
    },
  };
}
