/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

/**
 * Map legacy cfo.priorities[] to simplified recommendations without inventing numbers.
 * @param {object[]} priorities
 */
function legacyPrioritiesToRecommendations(priorities) {
  return priorities.map((priority, index) => {
    const rank = priority.number ?? index + 1;
    const action = [priority.why, priority.benefit]
      .map((value) => (value != null ? String(value).trim() : ''))
      .find(Boolean) ?? '';

    return {
      id: priority.id ?? `cfo-rec-${rank}`,
      rank,
      type: 'legacy',
      headline: priority.title?.trim() || `Priority ${rank}`,
      action,
      timeframe: priority.timeframe ?? undefined,
      note: priority.note?.trim() || undefined,
      difficulty: priority.difficulty ?? undefined,
      suggestedFunds: priority.suggestedFunds ?? [],
      legacyWhy: priority.why?.trim() || undefined,
      legacyBenefit: priority.benefit?.trim() || undefined,
      isLegacy: true,
    };
  });
}

/**
 * Normalize a single ChatGPT-supplied recommendation for rendering.
 * @param {object} rec
 * @param {number} index
 */
function normalizeRecommendation(rec, index) {
  const rank = rec.rank ?? rec.number ?? index + 1;
  return {
    ...rec,
    id: rec.id ?? `cfo-rec-${rank}`,
    rank,
    type: rec.type ?? 'general',
    headline: rec.headline?.trim() || rec.title?.trim() || `Recommendation ${rank}`,
    action: rec.action?.trim() || '',
    isLegacy: false,
  };
}

/**
 * @param {object} sourceData
 * @param {object | undefined} meta
 */
export function enrichCfo(sourceData = {}, meta) {
  const label = monthLabel(meta);
  const cfo = sourceData.cfo ?? {};
  const meeting = sourceData.meeting ?? {};

  const rawRecommendations = Array.isArray(cfo.recommendations) && cfo.recommendations.length > 0
    ? cfo.recommendations.map(normalizeRecommendation)
    : legacyPrioritiesToRecommendations(cfo.priorities ?? []);

  const recommendations = [...rawRecommendations].sort((a, b) => a.rank - b.rank);

  const currentUpdate = meeting.currentUpdate ?? null;

  return {
    ...cfo,
    recommendations,
    overview: {
      subtitle: cfo.overview?.subtitle?.trim()
        || `What looks most realistic and useful to do next, based on ${label}'s financial picture.`,
    },
    currentUpdate,
  };
}
