import React from 'react';

const DESTINATION_META = {
  Retirement: { icon: '🌱', label: 'Retirement', tone: 'growth' },
  'Kids savings': { icon: '♥', label: 'For the kids', tone: 'family' },
  'Emergency fund': { icon: '🛟', label: 'Safety', tone: 'safety' },
  'Other savings': { icon: '✦', label: 'Other', tone: 'safety' },
  'Debt payments': { icon: '💳', label: 'Debt paid', tone: 'debt' },
};

/** @param {{ atAGlanceLabel?: string, futureProgress?: { total?: string, components?: Array<{ label: string, value: string }> }, summary?: string }} props */
export function FutureAtAGlance({ atAGlanceLabel, futureProgress, summary }) {
  if (!futureProgress?.total) return null;

  const components = futureProgress.components ?? [];

  return (
    <section className="spending-block" aria-label={atAGlanceLabel}>
      <h2 className="month-snapshot-section-heading">{atAGlanceLabel}</h2>
      <article className="paper-surface spending-panel-surface future-hero-panel">
        <div className="future-hero-body">
          <div className="future-hero-emblem" aria-hidden="true">🌱</div>
          <p className="future-hero-amount">{futureProgress.total}</p>
          <p className="future-hero-caption">moved toward our future this month</p>

          {components.length > 0 && (
            <div className="future-progress-path" role="img" aria-label="Future-directed contributions this month">
              <ol className="future-progress-destinations">
                {components.map((component) => {
                  const meta = DESTINATION_META[component.label] ?? {
                    icon: '→',
                    label: component.label,
                    tone: 'safety',
                  };
                  const isDebt = component.label === 'Debt payments';
                  const amount = isDebt
                    ? component.value
                    : `+${String(component.value).replace(/^\+/, '')}`;
                  return (
                    <li
                      key={component.label}
                      className={`future-progress-destination tone-${meta.tone}`}
                    >
                      <span className="future-progress-destination-icon" aria-hidden="true">
                        {meta.icon}
                      </span>
                      <span className="future-progress-destination-label">{meta.label}</span>
                      <strong className={`future-progress-destination-amount ${isDebt ? 'is-debt' : ''}`.trim()}>
                        {amount}
                      </strong>
                      <span className="future-progress-destination-dot" aria-hidden="true" />
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {summary && (
          <p className="panel-note future-hero-summary">{summary}</p>
        )}
      </article>
    </section>
  );
}
