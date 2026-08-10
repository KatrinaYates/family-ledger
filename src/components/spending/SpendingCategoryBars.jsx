import React from 'react';

export function SpendingCategoryBars({ categories }) {
  return (
    <section className="spending-block" aria-label="Where the money went">
      <h2 className="month-snapshot-section-heading">Where the Money Went</h2>
      <div className="paper-surface spending-panel-surface">
        {!categories?.hasItems ? (
          <p className="panel-note">{categories?.emptyMessage}</p>
        ) : (
          <ul className="spending-category-bars">
            {categories.items.map((cat) => (
              <li key={cat.name} className="spending-category-bar-row">
                <div className="spending-category-bar-meta">
                  <span className="spending-category-bar-name">{cat.name}</span>
                  <span className="spending-category-bar-amount">{cat.amount}</span>
                  {categories.canPercent && cat.percent != null && (
                    <span className="spending-category-bar-percent">{cat.percent}%</span>
                  )}
                </div>
                {categories.canPercent && cat.barWidth != null && (
                  <div className="spending-category-bar-track" aria-hidden="true">
                    <span
                      className="spending-category-bar-fill"
                      style={{ width: `${cat.barWidth}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
