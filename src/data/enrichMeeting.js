export function enrichMeeting(meeting) {
  return {
    ...meeting,
    promptsPage: {
      subtitle: 'Start with curiosity. Capture what the numbers alone cannot explain.',
      footerText: 'Open questions and meeting notes continue on the next page →',
    },
    questionsPage: {
      subtitle: 'Questions worth answering together before closing the July meeting.',
      footerText: 'End of Money Meeting · Next: Action Plan',
    },
  };
}
