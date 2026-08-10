import React from 'react';

/** @param {{ comingUpLabel?: string, comingUp?: Array<object> }} props */
export function FutureComingUp({ comingUpLabel, comingUp }) {
  const items = comingUp ?? [];

  return (
    <section className="spending-block" aria-label={comingUpLabel}>
      <h2 className="month-snapshot-section-heading">{comingUpLabel}</h2>
      <div className="paper-surface spending-panel-surface">
        {items.length === 0 ? (
          <p className="panel-note">Nothing major is currently on the horizon.</p>
        ) : (
          <ul className="spending-change-list">
            {items.map((item) => (
              <li key={item.id ?? item.title} className="spending-change-row">
                <div className="spending-change-row-main">
                  <span className="spending-change-category">{item.title}</span>
                  {item.amount && (
                    <span className="spending-change-amount">{item.amount}</span>
                  )}
                </div>
                {(item.date || item.context) && (
                  <p className="spending-change-reason">
                    {[item.date, item.context].filter(Boolean).join(' · ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
