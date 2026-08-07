/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

export function enrichMeeting(meeting, meta) {
  const label = monthLabel(meta);
  return {
    ...meeting,
    promptsPage: {
      subtitle: 'Start with curiosity. Capture what the numbers alone cannot explain.',
      footerText: 'Open questions and meeting notes continue on the next page →',
    },
    questionsPage: {
      subtitle: `Questions worth answering together before closing the ${label} meeting.`,
      footerText: 'End of Money Meeting · Next: Action Plan',
    },
  };
}
