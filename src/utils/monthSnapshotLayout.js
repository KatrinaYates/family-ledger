const GLANCE_KPI_ORDER = ['Income', 'Spending'];
const ENDING_POSITION_ORDER = ['Cash', 'Net worth'];

function hasDisplayValue(value) {
  return value != null && String(value).trim() !== '' && String(value).trim() !== '—';
}

/**
 * Keep the Snapshot header stable even when the source record contains additional
 * month-change metrics used elsewhere on the page.
 */
export function buildSnapshotGlanceKpis(kpis = [], futureProgress = null) {
  const byLabel = new Map(
    kpis
      .filter((kpi) => kpi?.label && hasDisplayValue(kpi.value))
      .map((kpi) => [kpi.label, kpi]),
  );

  const items = GLANCE_KPI_ORDER.map((label) => byLabel.get(label)).filter(Boolean);
  if (hasDisplayValue(futureProgress?.total)) {
    items.push({
      label: 'Future progress',
      value: futureProgress.total,
      chip: { text: 'This month', tone: 'protected' },
    });
  }
  return items;
}

/** Only Cash and Net worth belong in the approved end-of-month pill row. */
export function buildSnapshotEndingPosition(items = []) {
  const byLabel = new Map(
    items
      .filter((item) => item?.label && hasDisplayValue(item.value))
      .map((item) => [item.label, item]),
  );
  return ENDING_POSITION_ORDER.map((label) => byLabel.get(label)).filter(Boolean);
}
