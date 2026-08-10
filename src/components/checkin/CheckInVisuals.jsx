import React from 'react';

export function ProgressBar({
  percent,
  label,
  ariaLabel,
  tone = 'teal',
  className = '',
}) {
  if (percent == null) return null;
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={`check-in-progress check-in-progress-${tone} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || label}
    >
      <div
        className="check-in-progress-fill"
        style={{ width: `${safePercent}%` }}
      />
      {label && <span className="check-in-progress-label">{label}</span>}
    </div>
  );
}

export function StackedValueBar({ composition, ariaLabel, className = '' }) {
  if (!composition?.segments?.length) return null;

  const summary = composition.segments
    .map((segment) => `${segment.label} ${segment.valueLabel} (${segment.percent}%)`)
    .join(', ');

  return (
    <div className={`check-in-stacked ${className}`.trim()}>
      <div
        className="check-in-stacked-track"
        role="img"
        aria-label={ariaLabel || summary}
      >
        {composition.segments.map((segment) => (
          <div
            key={segment.key}
            className={`check-in-stacked-segment tone-${segment.tone}`}
            style={{ width: `${segment.percent}%` }}
            title={`${segment.label}: ${segment.valueLabel} (${segment.percent}%)`}
          />
        ))}
      </div>
      <ul className="check-in-stacked-legend" aria-hidden="true">
        {composition.segments.map((segment) => (
          <li key={segment.key} className={`legend-item tone-${segment.tone}`}>
            <span className="legend-swatch" />
            <span className="legend-label">{segment.label}</span>
            <strong className="legend-value">{segment.valueLabel}</strong>
            <span className="legend-percent">{segment.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MiniBalanceBar({
  label,
  valueLabel,
  percent,
  status,
  ariaLabel,
  tone = 'teal',
}) {
  if (percent == null) return null;
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="check-in-mini-bar">
      <div className="check-in-mini-bar-header">
        <span>{label}</span>
        <strong>{valueLabel}</strong>
        {status && <span className={`check-in-mini-bar-status ${status}`}>{status}</span>}
      </div>
      <ProgressBar
        percent={safePercent}
        tone={tone}
        ariaLabel={ariaLabel || `${label}: ${valueLabel}, ${safePercent}%`}
        className="check-in-mini-bar-track"
      />
    </div>
  );
}

export function MiniBarChart({ bars, ariaLabel, className = '' }) {
  if (!bars?.length) return null;

  const summary = bars
    .map((bar) => `${bar.label} ${bar.valueLabel}`)
    .join(', ');

  return (
    <div className={`check-in-mini-chart ${className}`.trim()}>
      <div
        className="check-in-mini-chart-bars"
        role="img"
        aria-label={ariaLabel || summary}
      >
        {bars.map((bar) => (
          <div key={bar.key} className="check-in-mini-chart-col">
            <div className="check-in-mini-chart-bar-wrap">
              <div
                className="check-in-mini-chart-bar"
                style={{ height: `${bar.heightPercent}%` }}
                title={`${bar.label}: ${bar.valueLabel}`}
              />
            </div>
            <span className="check-in-mini-chart-label">{bar.label}</span>
            <span className="check-in-mini-chart-value">{bar.valueLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UtilizationBar({ card }) {
  if (card.utilizationPercent == null) return null;

  return (
    <div className="check-in-utilization">
      <div className="check-in-utilization-header">
        <span>{card.name}</span>
        <strong>{card.balanceLabel}</strong>
      </div>
      <ProgressBar
        percent={card.utilizationPercent}
        label={`${card.utilizationPercent}% of ${card.limitLabel} limit`}
        tone={card.utilizationPercent >= 80 ? 'coral' : 'blue'}
        ariaLabel={`${card.name} balance ${card.balanceLabel}, ${card.utilizationPercent}% of ${card.limitLabel} credit limit`}
        className="check-in-utilization-track"
      />
    </div>
  );
}
