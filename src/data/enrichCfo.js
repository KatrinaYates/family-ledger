/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

export function enrichCfo(cfo = {}, meta) {
  const label = monthLabel(meta);
  const rawPriorities = cfo.priorities ?? [];

  const priorities = rawPriorities.map((priority, index) => {
    const number = priority.number ?? index + 1;
    return {
      ...priority,
      number,
      priorityLabel: priority.priorityLabel?.trim() || `Priority ${number}`,
      decisions: priority.decisions ?? [],
    };
  });

  return {
    ...cfo,
    priorities,
    overview: {
      subtitle: `What I recommend we do next, based on ${label}'s financial picture and our future priorities.`,
    },
  };
}
