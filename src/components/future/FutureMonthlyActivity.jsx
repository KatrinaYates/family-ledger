import React from 'react';

/** @param {{ activityLabel?: string, monthlyActivity?: Array<object> }} props */
export function FutureMonthlyActivity({ activityLabel, monthlyActivity }) {
  if (!monthlyActivity?.length) return null;

  return (
    <section className="spending-block" aria-label={activityLabel}>
      <h2 className="month-snapshot-section-heading">{activityLabel}</h2>
      <div className="paper-surface spending-panel-surface">
        <ul className="spending-change-list">
          {monthlyActivity.map((item) => (
            <li key={`${item.label}-${item.value}`} className="spending-change-row">
              <div className="spending-change-row-main">
                <span className="spending-change-category">{item.label}</span>
                <span className={`spending-change-amount ${item.type === 'contribution' ? 'spending-change-down' : ''}`.trim()}>
                  {item.value}
                </span>
              </div>
              {item.context && (
                <p className="spending-change-reason">{item.context}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
