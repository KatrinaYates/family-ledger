import React from 'react';

/** @param {{ saved?: string, invested?: string } | null | undefined} futureProgress */
export function FutureProgressKpi({ futureProgress }) {
  if (!futureProgress) return null;

  const lines = [];
  if (futureProgress.saved) {
    lines.push({ key: 'saved', text: `${futureProgress.saved} saved` });
  }
  if (futureProgress.invested) {
    lines.push({ key: 'invested', text: `${futureProgress.invested} invested` });
  }
  if (!lines.length) return null;

  return (
    <article className="paper-surface snapshot-kpi month-snapshot-future-progress">
      <div className="snapshot-kpi-top">
        <span><span aria-hidden="true">🌱</span> Future progress</span>
      </div>
      <ul className="month-snapshot-future-progress-lines">
        {lines.map((line) => (
          <li key={line.key}>
            <strong>{line.text}</strong>
          </li>
        ))}
      </ul>
      <span className="snapshot-chip purple">Toward future goals</span>
    </article>
  );
}
