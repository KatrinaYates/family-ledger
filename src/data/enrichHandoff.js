export function enrichHandoff(handoff) {
  return {
    ...handoff,
    summaryPage: {
      subtitle: 'July at a glance — your meeting rundown, what to carry into August, and open items.',
    },
    feedbackPage: {
      subtitle: 'Help future-us improve this ledger — what worked, what to change, and ideas for the next edition.',
    },
  };
}
