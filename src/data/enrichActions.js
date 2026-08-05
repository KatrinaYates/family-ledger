export function enrichActions(actions) {
  return {
    ...actions,
    page: {
      subtitle: 'Specific next moves with owners and due dates — small enough to finish.',
      footerText: 'End of Action Plan · Next: Celebrate',
    },
  };
}
