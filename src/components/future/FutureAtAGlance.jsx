import React from 'react';

const COMPONENT_ICONS = {
  Retirement: '🌱',
  'Kids savings': '👨‍👩‍👦',
  'Emergency fund': '🛟',
  'Other savings': '💰',
};

/** @param {{ atAGlanceLabel?: string, futureProgress?: { total?: string, components?: Array<{ label: string, value: string }> }, summary?: string }} props */
export function FutureAtAGlance({ atAGlanceLabel, futureProgress, summary }) {
  if (!futureProgress?.total) return null;

  return (
    <section className="spending-block" aria-label={atAGlanceLabel}>
      <h2 className="month-snapshot-section-heading">{atAGlanceLabel}</h2>
      <div className="paper-surface spending-panel-surface future-glance-panel">
        <div className="future-glance-hero">
          <strong className="snapshot-kpi-value">{futureProgress.total}</strong>
          <p className="panel-note future-glance-caption">
            moved toward our future this month
          </p>
        </div>
        <ul className="month-snapshot-future-progress-lines">
          {futureProgress.components?.map((component) => (
            <li key={component.label}>
              <span>
                <span aria-hidden="true">{COMPONENT_ICONS[component.label] ?? '→'}</span>
                {' '}
                {component.label}
              </span>
              <strong>
                +{String(component.value).replace(/^\+/, '')}
              </strong>
            </li>
          ))}
        </ul>
        {summary && (
          <div className="month-snapshot-pulse insight-banner spending-overview-pulse">
            <p>{summary}</p>
          </div>
        )}
      </div>
    </section>
  );
}
