import { enrichMeeting } from './enrichMeeting.js';

/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

/**
 * Decisions section — CFO outcomes + parking lot, not a second questionnaire.
 * @param {object} sourceData
 * @param {object} enrichedCfo
 * @param {object | undefined} meta
 */
export function enrichDecisions(sourceData, enrichedCfo, meta) {
  const label = monthLabel(meta);
  const meeting = enrichMeeting(sourceData.meeting ?? {}, meta);
  const priorities = enrichedCfo?.priorities ?? [];

  const cfoOutcomes = priorities.map((priority, index) => ({
    number: priority.number ?? index + 1,
    title: priority.title ?? `Priority ${index + 1}`,
    why: priority.why ?? '',
  }));

  return {
    subtitle: `What we agreed on during the ${label} meeting — consolidated from earlier sections.`,
    cfoOutcomes,
    questions: meeting.questions ?? [],
    insight: meeting.insight?.trim() || '',
    currentUpdate: meeting.currentUpdate ?? null,
  };
}
