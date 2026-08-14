import { enrichSnapshot } from './enrichSnapshot.js';
import { enrichStory } from './enrichStory.js';
import { buildFutureProgress } from './futureProgress.js';
import { getComparisonMonthLabels } from '../utils/monthLabels.js';
import { parseAmount } from './spendingAnalysis.js';

/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

/** @param {string | undefined} value */
function hasValue(value) {
  return Boolean(value && value !== '—');
}

/** @param {string | undefined} status @param {string} fallback */
function statusChip(status, fallback = 'Review') {
  const text = status?.trim();
  if (!text) return { text: fallback, tone: 'blue' };
  const lower = text.toLowerCase();
  let tone = 'blue';
  if (lower.includes('good') || lower.includes('on track') || lower.includes('healthy')) tone = 'green';
  else if (lower.includes('watch') || lower.includes('review') || lower.includes('attention')) tone = 'yellow';
  else if (lower.includes('down') || lower.includes('lower')) tone = 'good';
  else if (lower.includes('up') && (lower.includes('debt') || lower.includes('spend'))) tone = 'watch';
  return { text, tone };
}

/** @param {object} spending @param {object | undefined} meta */
function spendingMovementNote(spending, meta) {
  const change = spending.change?.trim();
  const changePercent = spending.changePercent?.trim();
  if (!hasValue(change) && !hasValue(changePercent)) return '';

  const { priorLabel } = getComparisonMonthLabels(meta?.monthId, monthLabel(meta));
  const pct = hasValue(changePercent) ? changePercent : '';
  const arrow = pct.startsWith('-') || change?.startsWith('-') ? '↓' : (pct || change?.startsWith('+') ? '↑' : '');

  if (hasValue(change) && pct && priorLabel) {
    return `${arrow} ${pct} vs ${priorLabel}`.trim();
  }
  if (hasValue(change) && priorLabel) {
    return `${change} vs ${priorLabel}`;
  }
  if (pct && priorLabel) {
    return `${arrow} ${pct} vs ${priorLabel}`.trim();
  }
  return change || pct || '';
}

/** @param {object} story @param {object | undefined} meta */
function buildWhatMadeDifferent(story, meta) {
  const incomeContext = story.income?.context?.trim();
  if (incomeContext) return incomeContext;

  const explanationItems = story.explanation?.items ?? [];
  for (const item of explanationItems) {
    const note = item.note?.trim();
    if (note) return note;
    const name = item.name?.trim();
    if (name && hasValue(item.amount) && item.amount !== '$0') {
      return `${name} (${item.amount})`;
    }
  }

  const oneTimeGroup = (story.income?.groups ?? []).find((g) =>
    /one-time/i.test(g.label ?? ''),
  );
  if (oneTimeGroup?.items?.length) {
    const names = oneTimeGroup.items
      .filter((item) => hasValue(item.amount) && item.amount !== '$0')
      .map((item) => item.name)
      .filter(Boolean);
    if (names.length === 1) return `One-time income: ${names[0]}`;
    if (names.length > 1) return `One-time income: ${names.slice(0, 2).join(', ')}`;
  }

  return '';
}

/** @param {object} snapshot @param {object | undefined} meta */
function buildNeedsAttention(snapshot, meta) {
  const focus = meta?.biggestFocus?.trim() || snapshot.overview?.biggestFocus?.trim();
  if (focus) return focus;

  const summaryRows = snapshot.overview?.summaryRows ?? [];
  const priorityTitles = ['debt', 'cash', 'emergency', 'spending', 'credit'];
  for (const title of priorityTitles) {
    const row = summaryRows.find((r) =>
      r.title?.toLowerCase().includes(title) && r.text?.trim(),
    );
    if (row) return row.text.trim();
  }

  if (snapshot.debt?.insight?.trim()) return snapshot.debt.insight.trim();
  if (snapshot.cash?.insight?.trim()) return snapshot.cash.insight.trim();
  if (snapshot.emergencyFund?.insight?.trim()) return snapshot.emergencyFund.insight.trim();

  return '';
}

/** @param {string | undefined} text */
function directionFromStatus(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (/(down|lower|declin|reduc|paid down|decreas)/.test(lower)) return 'down';
  if (/(up|higher|increas|grew|rose)/.test(lower)) return 'up';
  return null;
}

/** @param {string | undefined} changePercent */
function spendingDirection(changePercent) {
  if (!hasValue(changePercent) || changePercent === '0%') return null;
  return changePercent.trim().startsWith('-') ? 'down' : 'up';
}

/**
 * Synthesize a one-sentence overall pulse from reliable month signals.
 * @param {object} params
 */
function buildDerivedOverallPulse({ snapshot, story, spending, futureProgress }) {
  /** @type {string[]} */
  const positives = [];
  /** @type {string[]} */
  const cautions = [];

  const spendDir = spendingDirection(spending.changePercent);
  if (spendDir === 'up') {
    const pct = spending.changePercent?.trim().replace(/^\+/, '') ?? '';
    cautions.push(`spending rose ${pct}`);
  } else if (spendDir === 'down') {
    const pct = spending.changePercent?.trim().replace(/^-/, '') ?? '';
    positives.push(`spending fell ${pct}`);
  }

  const debtChange = snapshot.monthChanges?.debt?.change;
  const debtDir = directionFromStatus(debtChange)
    ?? directionFromStatus(snapshot.debt?.status)
    ?? directionFromStatus(snapshot.debt?.insight);
  if (debtDir === 'down') positives.push('debt declined');
  else if (debtDir === 'up') cautions.push('debt increased');

  const netWorthChange = snapshot.monthChanges?.netWorth?.change;
  const nwDir = directionFromStatus(netWorthChange)
    ?? directionFromStatus(snapshot.netWorth?.status)
    ?? directionFromStatus(snapshot.netWorth?.insight);
  if (nwDir === 'up') positives.push('net worth moved up');
  else if (nwDir === 'down') cautions.push('net worth slipped');

  if (futureProgress?.total) positives.push('future-directed savings continued');

  const cashInsight = snapshot.cash?.insight?.trim();
  const cashStatus = snapshot.cash?.status?.trim().toLowerCase() ?? '';
  if (cashStatus.includes('tight') || /tight|pressure|buffer/.test(cashInsight ?? '')) {
    cautions.push('cash flexibility narrowed');
  } else if (cashStatus.includes('healthy') || /healthy|strong|comfortable/.test(cashInsight ?? '')) {
    positives.push('cash stayed healthy');
  }

  const oneTimeGroup = (story.income?.groups ?? []).find((g) => /one-time/i.test(g.label ?? ''));
  const hasOneTime = oneTimeGroup?.items?.some((item) => hasValue(item.amount) && item.amount !== '$0');
  if (hasOneTime) positives.push('one-time income shaped the month');

  const pickedPos = positives.slice(0, 2);
  const pickedCaution = cautions.slice(0, 2);

  if (!pickedPos.length && !pickedCaution.length) return '';

  if (pickedPos.length && pickedCaution.length) {
    const lead = pickedPos.join(' and ');
    const concern = pickedCaution.join(', ');
    return `${lead.charAt(0).toUpperCase()}${lead.slice(1)}, but ${concern} need attention.`;
  }

  if (pickedCaution.length) {
    const lead = pickedCaution.join(' and ');
    return `${lead.charAt(0).toUpperCase()}${lead.slice(1)} need attention this month.`;
  }

  const lead = pickedPos.join(' and ');
  return `${lead.charAt(0).toUpperCase()}${lead.slice(1)} made for a solid month overall.`;
}

/**
 * Resolve purpose-built overall pulse with safe fallbacks.
 * @param {object} sourceData
 * @param {object} snapshot
 * @param {object} story
 * @param {object} spending
 * @param {{ total?: string, components?: Array<{ label: string, value: string }> } | null} futureProgress
 */
function resolveOverallPulse(sourceData, snapshot, story, spending, futureProgress) {
  const authored = sourceData.meta?.overallPulse?.trim()
    || snapshot.overview?.overallPulse?.trim()
    || sourceData.monthAnalysis?.overallPulse?.trim();
  if (authored) return authored;

  const derived = buildDerivedOverallPulse({ snapshot, story, spending, futureProgress });
  if (derived) return derived;

  return '';
}

/** @param {object | undefined} change @param {string} endingValue */
function buildMonthlyChangeCard(change, endingValue) {
  if (!change) return null;
  const value = hasValue(change.change) ? change.change : '—';
  const noteParts = [];
  if (hasValue(endingValue)) noteParts.push(`Ended at ${endingValue}`);
  if (change.note?.trim()) noteParts.push(change.note.trim());
  return {
    value,
    chip: statusChip(change.status, hasValue(change.change) ? 'This month' : 'Change unavailable'),
    note: noteParts.join(' · '),
  };
}

/**
 * Monthly Snapshot enrichment — month activity first, ending position second.
 * @param {object} sourceData
 * @param {object | undefined} meta
 */
export function enrichMonth(sourceData, meta) {
  const label = monthLabel(meta);
  const snapshot = enrichSnapshot(sourceData.snapshot ?? {}, meta);
  const story = enrichStory(sourceData.story ?? {}, meta);
  const spending = sourceData.spending ?? {};
  const futureProgress = buildFutureProgress(sourceData);
  const overallPulse = resolveOverallPulse(sourceData, snapshot, story, spending, futureProgress);

  /** @type {Array<{ icon: string, label: string, value: string, chip?: { text: string, tone: string }, note?: string }>} */
  const kpis = [];

  const incomeTotal = story.income?.total;
  if (hasValue(incomeTotal)) {
    kpis.push({
      icon: '💰',
      label: 'Income',
      value: incomeTotal,
      chip: { text: 'Money in', tone: 'green' },
      note: story.income?.period?.trim() || '',
    });
  }

  if (hasValue(spending.total)) {
    const momNote = spendingMovementNote(spending, meta);
    kpis.push({
      icon: '🛍️',
      label: 'Spending',
      value: spending.total,
      chip: { text: 'Excl. transfers', tone: 'blue' },
      note: momNote,
    });
  }

  const monthEndCash = story.endingPosition?.totalCash ?? snapshot.cash?.total;
  const cashChange = buildMonthlyChangeCard(snapshot.monthChanges?.cash, monthEndCash);
  if (cashChange) {
    kpis.push({
      icon: '💵',
      label: 'Cash change',
      ...cashChange,
    });
  } else if (hasValue(monthEndCash)) {
    kpis.push({
      icon: '💵',
      label: 'Cash change',
      value: '—',
      chip: { text: 'Change unavailable', tone: 'blue' },
      note: `Ended at ${monthEndCash}`,
    });
  }

  const debtChange = buildMonthlyChangeCard(snapshot.monthChanges?.debt, snapshot.debt?.total);
  if (debtChange) {
    kpis.push({
      icon: '💳',
      label: 'Debt change',
      ...debtChange,
    });
  } else if (hasValue(snapshot.debt?.total)) {
    kpis.push({
      icon: '💳',
      label: 'Debt change',
      value: '—',
      chip: { text: 'Change unavailable', tone: 'blue' },
      note: `Ended at ${snapshot.debt.total}`,
    });
  }

  const netWorthChange = buildMonthlyChangeCard(snapshot.monthChanges?.netWorth, snapshot.netWorth?.value);
  if (netWorthChange) {
    kpis.push({
      icon: '📈',
      label: 'Net worth change',
      ...netWorthChange,
    });
  } else if (hasValue(snapshot.netWorth?.value)) {
    kpis.push({
      icon: '📈',
      label: 'Net worth change',
      value: '—',
      chip: { text: 'Change unavailable', tone: 'blue' },
      note: `Ended at ${snapshot.netWorth.value}`,
    });
  }

  const endingPosition = [
    hasValue(monthEndCash) ? { label: 'Cash', value: monthEndCash, tone: 'safety' } : null,
    hasValue(snapshot.debt?.total) ? { label: 'Debt', value: snapshot.debt.total, tone: 'focus' } : null,
    hasValue(snapshot.netWorth?.value) ? { label: 'Net worth', value: snapshot.netWorth.value, tone: 'win' } : null,
  ].filter(Boolean);

  const biggestWin = meta?.biggestWin?.trim()
    || snapshot.overview?.biggestWin?.trim()
    || sourceData.celebrate?.biggestWin?.trim()
    || '';

  const howItWent = {
    heading: `How ${label} went`,
    pulse: overallPulse,
    biggestWin,
    needsAttention: buildNeedsAttention(snapshot, meta),
    whatMadeDifferent: buildWhatMadeDifferent(story, meta),
  };

  return {
    subtitle: `What changed in ${label}, plus where we finished the month.`,
    atAGlanceLabel: `${label} at a glance`,
    endingPositionLabel: `End of ${label}`,
    overallPulse,
    kpis,
    futureProgress,
    endingPosition,
    howItWent,
    humanContextLabel: "What the numbers don't know",
  };
}
