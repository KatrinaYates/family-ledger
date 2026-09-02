/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

export function enrichHandoff(handoff, meta) {
  const label = monthLabel(meta);
  return {
    ...handoff,
    summaryPage: {
      subtitle: `${label} at a glance — your meeting rundown, what to carry forward, and open items.`,
    },
  };
}
