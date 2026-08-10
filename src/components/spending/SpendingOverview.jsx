import React from 'react';

export function SpendingOverview({ overview }) {
  if (!overview) return null;

  const changeTone =
    overview.direction === 'down' ? 'tone-spending-down'
      : overview.direction === 'up' ? 'tone-spending-up'
        : '';

  return (
    <section className="spending-block" aria-label="Spending overview">
      <h2 className="month-snapshot-section-heading">Spending Overview</h2>
      <div className="month-snapshot-money-grid spending-overview-grid">
        <article className="month-snapshot-money-block">
          <span className="month-snapshot-money-block-title">{overview.currentLabel}</span>
          <strong className="month-snapshot-money-block-value">{overview.currentTotal}</strong>
        </article>
        <article className="month-snapshot-money-block">
          <span className="month-snapshot-money-block-title">{overview.priorLabel}</span>
          <strong className="month-snapshot-money-block-value">{overview.priorTotal}</strong>
        </article>
        <article className={`month-snapshot-money-block ${changeTone}`.trim()}>
          <span className="month-snapshot-money-block-title">Change</span>
          <strong className="month-snapshot-money-block-value">{overview.changeAmount}</strong>
          {overview.changePercent && overview.changePercent !== '—' && (
            <span className="month-snapshot-money-block-subtitle">{overview.changePercent}</span>
          )}
        </article>
      </div>
      {overview.footnote && (
        <p className="panel-note spending-overview-footnote">{overview.footnote}</p>
      )}
      {overview.interpretation && (
        <div className="month-snapshot-pulse insight-banner spending-overview-pulse">
          <span className="month-snapshot-pulse-label">What drove the change</span>
          <p>{overview.interpretation}</p>
        </div>
      )}
    </section>
  );
}
