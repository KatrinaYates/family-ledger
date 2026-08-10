import React from 'react';

/** @param {{ total?: string, components?: Array<{ label: string, value: string }> } | null | undefined} futureProgress */
export function FutureProgressKpi({ futureProgress }) {
  if (!futureProgress?.total || !futureProgress.components?.length) return null;

  return (
    <article className="paper-surface snapshot-kpi month-snapshot-future-progress">
      <div className="snapshot-kpi-top">
        <span><span aria-hidden="true">🌱</span> Future progress</span>
      </div>
      <strong className="snapshot-kpi-value">{futureProgress.total}</strong>
      <ul className="month-snapshot-future-progress-lines">
        {futureProgress.components.map((component) => (
          <li key={component.label}>
            <span>{component.label}</span>
            <strong>{component.value}</strong>
          </li>
        ))}
      </ul>
      <span className="snapshot-chip purple">This month</span>
    </article>
  );
}
