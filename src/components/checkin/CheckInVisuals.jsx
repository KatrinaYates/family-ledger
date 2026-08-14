import React from 'react';
import {
  BarChart,
  NotebookBarCaption,
  NotebookBarFill,
  SegmentBar,
} from '../notebook/KitComponents';

/** Compact progress bar — delegates to NotebookBarCaption. */
export function ProgressBar({
  percent,
  label,
  ariaLabel,
  tone = 'teal',
  className = '',
  size = 'default',
}) {
  if (percent == null) return null;

  return (
    <NotebookBarCaption
      percent={percent}
      tone={`tone-${tone}`}
      caption={label}
      className={className}
      ariaLabel={ariaLabel || label}
      size={size}
    />
  );
}

export function StackedValueBar({ composition, ariaLabel, className = '' }) {
  if (!composition?.segments?.length) return null;

  return (
    <SegmentBar
      segments={composition.segments.map((segment) => ({
        ...segment,
        solid: segment.tone === 'coral' && segment.key === 'debt',
      }))}
      ariaLabel={ariaLabel}
      className={className}
    />
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

  const statusClass = status === 'Funded' ? 'is-funded' : status === 'Short' ? 'is-short' : '';

  return (
    <div className="check-in-mini-bar">
      <div className="check-in-mini-bar-header">
        <span>{label}</span>
        <strong>{valueLabel}</strong>
        {status && <span className={`check-in-mini-bar-status ${statusClass}`}>{status}</span>}
      </div>
      <NotebookBarFill
        percent={percent}
        tone={`tone-${tone}`}
        label={`${percent}%`}
        className="check-in-mini-bar-track"
        ariaLabel={ariaLabel || `${label}: ${valueLabel}, ${percent}%`}
        size="compact"
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
      <NotebookBarCaption
        percent={card.utilizationPercent}
        tone={card.utilizationPercent >= 80 ? 'tone-coral' : 'tone-blue'}
        caption={`${card.utilizationPercent}% of ${card.limitLabel} limit`}
        className="check-in-utilization-track"
        ariaLabel={`${card.name} balance ${card.balanceLabel}, ${card.utilizationPercent}% of ${card.limitLabel} credit limit`}
        size="compact"
      />
    </div>
  );
}

export { BarChart, NotebookBarCaption, NotebookBarFill, SegmentBar };
