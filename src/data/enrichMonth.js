import { enrichSnapshot } from './enrichSnapshot.js';
import { enrichStory } from './enrichStory.js';
import { getComparisonMonthLabels } from '../utils/monthLabels.js';

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

/** @param {string | undefined} insight @param {string | undefined} status */
function movementNote(insight, status) {
  const statusText = status?.trim();
  if (statusText && statusText.length < 48 && !statusText.toLowerCase().includes('review')) {
    return statusText;
  }
  const insightText = insight?.trim();
  if (insightText && insightText.length < 120) return insightText;
  return '';
}

/** @param {object} story @param {object} snapshot */
function savedInvestedLabel(story, snapshot) {
  const saved = story.savings?.total ?? story.savings?.monthTotal;
  const invested = story.investments?.monthContributions ?? snapshot.retirement?.monthContributions;
  const parts = [];
  if (hasValue(saved)) parts.push(saved);
  if (hasValue(invested)) parts.push(invested);
  if (!parts.length) return null;

  if (hasValue(saved) && hasValue(invested)) {
    return { value: parts.join(' + '), note: 'Savings and retirement contributions' };
  }
  if (hasValue(invested)) {
    return { value: invested, note: 'Retirement contributions' };
  }
  return { value: saved, note: 'Saved this month' };
}

/** @param {object} sourceData @param {object} story @param {object} snapshot @param {object | undefined} meta */
function buildWhatMadeDifferent(sourceData, story, meta) {
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

/** @param {object} snapshot @param {object | undefined} meta @param {object} sourceData */
function buildNeedsAttention(snapshot, meta, sourceData) {
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

/** @param {object} snapshot @param {object} story */
function buildOverallPulse(snapshot, story) {
  const pulse = snapshot.overview?.pulseInsight?.trim();
  if (pulse) return pulse;

  const closing = story.explanation?.closing?.trim();
  if (closing) return closing;

  const netInsight = snapshot.netWorth?.insight?.trim();
  if (netInsight && netInsight.length <= 160) return netInsight;

  return '';
}

/**
 * Monthly Snapshot enrichment — headline month-end orientation.
 * @param {object} sourceData
 * @param {object | undefined} meta
 */
export function enrichMonth(sourceData, meta) {
  const label = monthLabel(meta);
  const snapshot = enrichSnapshot(sourceData.snapshot ?? {}, meta);
  const story = enrichStory(sourceData.story ?? {}, meta);
  const spending = sourceData.spending ?? {};

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
  if (hasValue(monthEndCash)) {
    const cashNotes = [];
    if (hasValue(snapshot.cash?.availableTotal)) {
      cashNotes.push(`${snapshot.cash.availableTotal} available`);
    }
    if (hasValue(snapshot.cash?.protectedTotal)) {
      cashNotes.push(`${snapshot.cash.protectedTotal} protected`);
    }
    kpis.push({
      icon: '💵',
      label: 'Month-end cash',
      value: monthEndCash,
      chip: statusChip(snapshot.cash?.status, 'Connected'),
      note: cashNotes.join(' · '),
    });
  }

  if (hasValue(snapshot.debt?.total)) {
    kpis.push({
      icon: '💳',
      label: 'Debt',
      value: snapshot.debt.total,
      chip: statusChip(snapshot.debt?.status, 'Connected'),
      note: movementNote(snapshot.debt?.insight, snapshot.debt?.status),
    });
  }

  if (hasValue(snapshot.netWorth?.value)) {
    kpis.push({
      icon: '📈',
      label: 'Net worth',
      value: snapshot.netWorth.value,
      chip: statusChip(snapshot.netWorth?.status, 'Connected'),
      note: movementNote(snapshot.netWorth?.insight, snapshot.netWorth?.status),
    });
  }

  const savedInvested = savedInvestedLabel(story, snapshot);
  if (savedInvested) {
    kpis.push({
      icon: '🌱',
      label: 'Saved / invested',
      value: savedInvested.value,
      chip: { text: 'Progress', tone: 'purple' },
      note: savedInvested.note,
    });
  }

  const biggestWin = meta?.biggestWin?.trim()
    || snapshot.overview?.biggestWin?.trim()
    || sourceData.celebrate?.biggestWin?.trim()
    || '';

  const howItWent = {
    heading: `How ${label} went`,
    pulse: buildOverallPulse(snapshot, story),
    biggestWin,
    needsAttention: buildNeedsAttention(snapshot, meta, sourceData),
    whatMadeDifferent: buildWhatMadeDifferent(sourceData, story, meta),
  };

  /** @type {Array<{ label: string, value: string }>} */
  const moneyFlowItems = [];
  if (hasValue(incomeTotal)) {
    moneyFlowItems.push({ label: 'Money in', value: incomeTotal });
  }
  if (hasValue(spending.total)) {
    moneyFlowItems.push({ label: 'Spending', value: spending.total });
  }
  if (savedInvested) {
    moneyFlowItems.push({ label: 'Saved / invested', value: savedInvested.value });
  }

  return {
    subtitle: `Where we finished ${label} and what changed.`,
    atAGlanceLabel: `${label} at a glance`,
    kpis,
    howItWent,
    moneyFlow: {
      items: moneyFlowItems,
      independent: true,
    },
    humanContextLabel: "What the numbers don't know",
  };
}
