import React from 'react';

/** @param {{ comingUpLabel?: string, comingUp?: Array<object> }} props */
export function FutureComingUp({ comingUpLabel, comingUp }) {
  const items = comingUp ?? [];

  return (
    <section
      className={`future-coming-up ${items.length === 0 ? 'is-empty' : ''}`.trim()}
      aria-label={comingUpLabel}
    >
      <article className="paper-surface spending-panel-surface">
        <h2 className="spending-watch-module-label future-footer-panel-label">
          {comingUpLabel}
        </h2>

        {items.length === 0 ? (
          <p className="future-coming-up-empty">Nothing major on the horizon.</p>
        ) : (
          <ul className="future-coming-up-list">
            {items.map((item) => (
              <li key={item.id ?? item.title} className="future-coming-up-item">
                <span className="future-coming-up-title">{item.title}</span>
                {item.amount && (
                  <strong className="future-coming-up-amount">{item.amount}</strong>
                )}
                {(item.date || item.context) && (
                  <span className="future-coming-up-meta">
                    {[item.date, item.context].filter(Boolean).join(' · ')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
