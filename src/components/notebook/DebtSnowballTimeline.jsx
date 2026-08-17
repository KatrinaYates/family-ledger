import React from 'react';
import './debt-snowball-timeline.css';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Gantt-style payoff chart that shows each debt's minimum-payment phase and
 * the later snowball/avalanche target phase.
 *
 * @param {{
 *   rows: Array<{
 *     id?: string,
 *     name: string,
 *     balanceLabel?: string,
 *     aprLabel?: string,
 *     aprAssumed?: boolean,
 *     payoffMonth: number,
 *     targetStartMonth?: number,
 *     payoffLabel?: string,
 *   }>,
 *   totalMonths: number,
 *   startLabel?: string,
 *   endLabel?: string,
 *   title?: string,
 *   className?: string,
 * }} props
 */
export function DebtSnowballTimeline({
  rows = [],
  totalMonths,
  startLabel = 'Now',
  endLabel = 'Debt free',
  title,
  className = '',
}) {
  const validRows = rows.filter((row) => row?.name && Number.isFinite(row.payoffMonth) && row.payoffMonth > 0);
  const horizon = Math.max(1, Number(totalMonths) || Math.max(1, ...validRows.map((row) => row.payoffMonth)));
  if (!validRows.length) return null;

  const tickStep = horizon <= 12 ? 2 : horizon <= 30 ? 3 : horizon <= 60 ? 6 : 12;
  const ticks = [0];
  for (let month = tickStep; month < horizon; month += tickStep) ticks.push(month);
  if (ticks[ticks.length - 1] !== horizon) ticks.push(horizon);

  const summary = validRows
    .map((row) => `${row.name}: snowball starts month ${Math.max(1, row.targetStartMonth || 1)}, paid off ${row.payoffLabel || `month ${row.payoffMonth}`}${row.aprAssumed ? ', APR assumed 0%' : ''}`)
    .join(', ');

  return (
    <figure className={`paper-surface debt-snowball-timeline ${className}`.trim()}>
      {title && <figcaption className="notebook-chart-title">{title}</figcaption>}

      <div className="debt-snowball-legend" aria-hidden="true">
        <span><i className="is-minimum" /> Minimum / regular payments</span>
        <span><i className="is-snowball" /> Snowball target</span>
        <span><i className="is-payoff" /> Paid off</span>
      </div>

      <div className="debt-snowball-scroll" role="img" aria-label={summary}>
        <div className="debt-snowball-chart" style={{ '--snowball-columns': ticks.length }}>
          <div className="debt-snowball-axis-label">Debt</div>
          <div className="debt-snowball-axis">
            {ticks.map((month, index) => {
              const left = `${(month / horizon) * 100}%`;
              const label = index === 0 ? startLabel : index === ticks.length - 1 ? endLabel : `+${month} mo`;
              return (
                <span key={month} className="debt-snowball-tick" style={{ left }}>
                  <i aria-hidden="true" />
                  <b>{label}</b>
                </span>
              );
            })}
          </div>

          {validRows.map((row, index) => {
            const payoffMonth = clamp(row.payoffMonth, 0, horizon);
            const targetStart = clamp(row.targetStartMonth || 1, 0, payoffMonth);
            const minimumWidth = (targetStart / horizon) * 100;
            const snowballWidth = ((payoffMonth - targetStart) / horizon) * 100;
            const payoffLeft = (payoffMonth / horizon) * 100;

            return (
              <React.Fragment key={row.id || row.name || index}>
                <div className="debt-snowball-row-label">
                  <strong>{row.name}</strong>
                  <span>
                    {row.balanceLabel && <b>{row.balanceLabel}</b>}
                    {row.aprLabel && <small>{row.aprLabel}</small>}
                    {row.aprAssumed && <small className="is-assumed">APR missing · 0% assumed</small>}
                  </span>
                </div>

                <div className="debt-snowball-row-track">
                  {ticks.map((month) => (
                    <i
                      key={month}
                      className="debt-snowball-gridline"
                      style={{ left: `${(month / horizon) * 100}%` }}
                      aria-hidden="true"
                    />
                  ))}
                  <div className="debt-snowball-base" style={{ width: `${payoffLeft}%` }} aria-hidden="true" />
                  {minimumWidth > 0 && (
                    <div
                      className="debt-snowball-phase is-minimum"
                      style={{ left: 0, width: `${minimumWidth}%` }}
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className="debt-snowball-phase is-snowball"
                    style={{ left: `${minimumWidth}%`, width: `${Math.max(snowballWidth, 0.9)}%` }}
                    aria-hidden="true"
                  />
                  <span className="debt-snowball-payoff-dot" style={{ left: `${payoffLeft}%` }} aria-hidden="true" />
                  <span className="debt-snowball-payoff-label" style={{ left: `${payoffLeft}%` }}>
                    {row.payoffLabel || `Month ${row.payoffMonth}`}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
