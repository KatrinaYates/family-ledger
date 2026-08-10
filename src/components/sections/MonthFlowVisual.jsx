import React from 'react';

export function MonthFlowVisual({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <section className="month-snapshot-flow paper-surface" aria-label="Money flow this month">
      <h2 className="month-snapshot-section-heading">Money flow</h2>
      <ol className="month-snapshot-flow-steps">
        {items.map((step, index) => (
          <li key={step.label} className="month-snapshot-flow-step">
            <div className="month-snapshot-flow-step-body">
              <span className="month-snapshot-flow-label">{step.label}</span>
              <strong className="month-snapshot-flow-value">{step.value}</strong>
            </div>
            {index < items.length - 1 && (
              <span className="month-snapshot-flow-arrow" aria-hidden="true">↓</span>
            )}
          </li>
        ))}
      </ol>
      <p className="month-snapshot-flow-note panel-note">
        Broad month-end picture — not a strict accounting reconciliation.
      </p>
    </section>
  );
}
