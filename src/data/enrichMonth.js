import { enrichSnapshot } from './enrichSnapshot.js';
import { enrichStory } from './enrichStory.js';

/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

function movementChip(changeText) {
  if (!changeText || changeText === '—') return null;
  const lower = changeText.toLowerCase();
  const tone = lower.includes('down') || lower.startsWith('-') ? 'good' : lower.includes('up') ? 'watch' : 'blue';
  return { text: changeText, tone };
}

/**
 * Curated month overview — snapshot headline + story context, not concatenation.
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
  if (incomeTotal && incomeTotal !== '—') {
    kpis.push({
      icon: '💰',
      label: 'Income',
      value: incomeTotal,
      chip: { text: 'This month', tone: 'green' },
      note: story.income?.period?.trim() || '',
    });
  }

  if (spending.total && spending.total !== '—') {
    kpis.push({
      icon: '🛍️',
      label: 'Spending',
      value: spending.total,
      chip: { text: 'Excl. transfers', tone: 'blue' },
      note: spending.change ? `vs prior: ${spending.change}` : '',
    });
  }

  const savedAmount = story.savings?.total ?? story.savings?.monthTotal;
  const investedAmount = story.investments?.monthContributions ?? snapshot.retirement?.monthContributions;
  if ((savedAmount && savedAmount !== '—') || (investedAmount && investedAmount !== '—')) {
    const parts = [];
    if (savedAmount && savedAmount !== '—') parts.push(`${savedAmount} saved`);
    if (investedAmount && investedAmount !== '—') parts.push(`${investedAmount} invested`);
    kpis.push({
      icon: '🌱',
      label: 'Saved & invested',
      value: parts.join(' · ') || '—',
      chip: { text: 'Progress', tone: 'purple' },
    });
  }

  const netWorthInsight = snapshot.netWorth?.insight?.trim();
  const debtInsight = snapshot.debt?.insight?.trim();
  if (netWorthInsight || debtInsight) {
    kpis.push({
      icon: '📈',
      label: 'Net worth & debt',
      value: snapshot.netWorth?.value ?? snapshot.debt?.total ?? '—',
      chip: movementChip(snapshot.netWorth?.status) ?? { text: 'Review', tone: 'yellow' },
      note: netWorthInsight || debtInsight || '',
    });
  }

  const summaryRows = snapshot.overview?.summaryRows ?? [];
  const concerns = summaryRows
    .filter((row) => row.text?.trim())
    .slice(0, 3)
    .map((row) => ({ title: row.title, text: row.text }));

  const explanationItems = (story.explanation?.items ?? []).slice(0, 4);
  const contextRows = explanationItems.map((item) => ({
    icon: '📊',
    title: item.name ?? 'Movement',
    text: item.note?.trim() || item.amount || '',
  })).filter((row) => row.text);

  return {
    subtitle: `What happened in ${label} — the story behind the headline numbers.`,
    kpis,
    whatChanged: {
      wins: meta?.biggestWin?.trim() || snapshot.overview?.biggestWin?.trim() || '',
      shifts: meta?.biggestFocus?.trim() || snapshot.overview?.biggestFocus?.trim() || '',
      concerns,
    },
    contextSummary: {
      closing: story.explanation?.closing?.trim() || story.endingPage?.closingInsight?.trim() || '',
      rows: contextRows,
    },
    pulseInsight: snapshot.overview?.pulseInsight?.trim() || '',
  };
}
