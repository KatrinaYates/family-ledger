import { enrichHandoff } from './enrichHandoff.js';

/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

/**
 * Close the month — summary and carry-forward from handoff source data.
 * @param {object} sourceData
 * @param {object | undefined} meta
 */
export function enrichClose(sourceData, meta) {
  const label = monthLabel(meta);
  const handoff = enrichHandoff(sourceData.handoff ?? {}, meta);
  const snapshot = sourceData.snapshot ?? {};
  const actions = sourceData.actions ?? {};

  const missingItems = snapshot.overview?.missingBeforeLock
    ?? snapshot.missingBeforeLock
    ?? [];
  const openActionCount = (actions.items ?? []).filter(
    (item) => item.status && item.status !== 'Done' && item.status !== 'Complete',
  ).length;

  const readiness = [];
  if (missingItems.length) {
    readiness.push({ label: 'Missing data resolved', done: false, detail: `${missingItems.length} items flagged before lock` });
  } else {
    readiness.push({ label: 'Missing data resolved', done: true, detail: 'No open gaps flagged' });
  }
  if (openActionCount > 0) {
    readiness.push({ label: 'Action items assigned', done: true, detail: `${openActionCount} open actions tracked` });
  } else {
    readiness.push({ label: 'Action items assigned', done: false, detail: 'Add owners and due dates' });
  }
  readiness.push({ label: 'Month summary captured', done: Boolean(handoff.summary?.trim()), detail: 'Summary paragraph on this page' });

  return {
    subtitle: handoff.summaryPage?.subtitle ?? `${label} at a glance — rundown, carry-forwards, and lock.`,
    summary: handoff.summary?.trim() || '',
    carryForward: handoff.carryForward ?? [],
    revisit: handoff.revisit ?? [],
    readiness,
  };
}
