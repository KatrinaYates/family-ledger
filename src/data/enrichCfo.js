export function enrichCfo(cfo) {
  const priorities = cfo.priorities.map((p, index, arr) => ({
    ...p,
    page: index + 1,
    totalPages: arr.length,
    eyebrowSuffix: `Section 04 · Page ${index + 1} of ${arr.length}`,
    footerText:
      index < arr.length - 1
        ? `Priority ${index + 2} continues on the next page →`
        : 'End of CFO Recs · Next: Retirement & Future',
  }));

  return {
    ...cfo,
    priorities,
    overview: {
      subtitle: 'Three prioritized recommendations based on July\'s full financial picture.',
    },
  };
}
