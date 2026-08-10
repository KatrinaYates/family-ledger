import React from 'react';

function ChangeGroup({ title, items, tone }) {
  if (!items?.length) return null;

  return (
    <article className={`month-snapshot-priority-card tone-${tone}`}>
      <h3 className="month-snapshot-priority-label">{title}</h3>
      <ul className="spending-change-list">
        {items.map((item) => (
          <li key={item.category} className="spending-change-row">
            <div className="spending-change-row-main">
              <span className="spending-change-category">{item.category}</span>
              <span className={`spending-change-amount spending-change-${tone === 'focus' ? 'up' : 'down'}`}>
                {item.changeLabel}
              </span>
            </div>
            {item.reason && (
              <p className="spending-change-reason">{item.reason}</p>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function SpendingChangeSummary({ whatChanged }) {
  if (!whatChanged) return null;

  return (
    <section className="spending-block" aria-label={whatChanged.title}>
      <h2 className="month-snapshot-section-heading">{whatChanged.title}</h2>
      <div className="paper-surface spending-panel-surface">
        {whatChanged.hasChanges ? (
          <div className="spending-change-columns">
            <ChangeGroup
              title="Biggest increases"
              items={whatChanged.increased}
              tone="focus"
            />
            <ChangeGroup
              title="Biggest decreases"
              items={whatChanged.decreased}
              tone="win"
            />
          </div>
        ) : whatChanged.emptyMessage ? (
          <p className="panel-note">{whatChanged.emptyMessage}</p>
        ) : null}
      </div>
    </section>
  );
}
