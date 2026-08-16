import React from 'react';

const CHART_TONES = ['teal', 'coral', 'gold', 'lavender', 'green', 'blue'];

function formatValue(value, formatter) {
  if (formatter) return formatter(value);
  return typeof value === 'number' ? value.toLocaleString() : String(value ?? '');
}

/**
 * Part-to-whole chart for a small number of categories.
 * @param {{ items: Array<{label: string, value: number, valueLabel?: string, tone?: string}>, title?: string, centerLabel?: string, centerValue?: string, valueFormatter?: (value:number)=>string, className?: string }} props
 */
export function PieChart({
  items = [],
  title,
  centerLabel = 'Total',
  centerValue,
  valueFormatter,
  className = '',
}) {
  const validItems = items.filter((item) => Number.isFinite(item.value) && item.value > 0);
  const total = validItems.reduce((sum, item) => sum + item.value, 0);
  if (!total) return null;

  let cursor = 0;
  const gradientStops = validItems.map((item, index) => {
    const start = cursor;
    cursor += (item.value / total) * 100;
    const tone = item.tone || CHART_TONES[index % CHART_TONES.length];
    return `var(--chart-${tone}) ${start}% ${cursor}%`;
  });

  const summary = validItems
    .map((item) => `${item.label} ${Math.round((item.value / total) * 100)}%`)
    .join(', ');

  return (
    <figure className={`paper-surface notebook-pie-chart ${className}`.trim()}>
      {title && <figcaption className="notebook-chart-title">{title}</figcaption>}
      <div className="notebook-pie-layout">
        <div
          className="notebook-pie-visual"
          style={{ background: `conic-gradient(${gradientStops.join(', ')})` }}
          role="img"
          aria-label={summary}
        >
          <div className="notebook-pie-center">
            <span>{centerLabel}</span>
            <strong>{centerValue ?? formatValue(total, valueFormatter)}</strong>
          </div>
        </div>
        <ul className="notebook-chart-legend">
          {validItems.map((item, index) => {
            const tone = item.tone || CHART_TONES[index % CHART_TONES.length];
            const percent = Math.round((item.value / total) * 100);
            return (
              <li key={item.label}>
                <span className={`notebook-chart-swatch tone-${tone}`} aria-hidden="true" />
                <span className="notebook-chart-legend-label">{item.label}</span>
                <strong>{item.valueLabel ?? formatValue(item.value, valueFormatter)}</strong>
                <span className="notebook-chart-percent">{percent}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}

/**
 * Ordered trend line for month-over-month or other sequential values.
 * @param {{ points: Array<{label:string, value:number, valueLabel?:string}>, title?:string, valueFormatter?:(value:number)=>string, tone?:string, className?:string }} props
 */
export function TrendingGraph({
  points = [],
  title,
  valueFormatter,
  tone = 'teal',
  className = '',
}) {
  const validPoints = points.filter((point) => Number.isFinite(point.value));
  if (!validPoints.length) return null;

  const width = 640;
  const height = 220;
  const left = 48;
  const right = 18;
  const top = 20;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = validPoints.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin;
  const padding = spread === 0 ? Math.max(Math.abs(rawMax) * 0.08, 1) : spread * 0.12;
  const min = rawMin - padding;
  const max = rawMax + padding;
  const range = max - min || 1;

  const coords = validPoints.map((point, index) => {
    const x = validPoints.length === 1
      ? left + plotWidth / 2
      : left + (index / (validPoints.length - 1)) * plotWidth;
    const y = top + ((max - point.value) / range) * plotHeight;
    return { ...point, x, y };
  });

  const linePoints = coords.map(({ x, y }) => `${x},${y}`).join(' ');
  const areaPoints = `${left},${top + plotHeight} ${linePoints} ${left + plotWidth},${top + plotHeight}`;
  const first = validPoints[0].value;
  const last = validPoints[validPoints.length - 1].value;
  const delta = last - first;
  const deltaLabel = `${delta >= 0 ? '+' : ''}${formatValue(delta, valueFormatter)}`;

  return (
    <figure className={`paper-surface notebook-trend-chart tone-${tone} ${className}`.trim()}>
      <div className="notebook-trend-header">
        {title && <figcaption className="notebook-chart-title">{title}</figcaption>}
        {validPoints.length > 1 && (
          <span className={`notebook-trend-delta ${delta >= 0 ? 'is-up' : 'is-down'}`}>
            {deltaLabel}
          </span>
        )}
      </div>
      <svg
        className="notebook-trend-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={validPoints.map((point) => `${point.label}: ${point.valueLabel ?? formatValue(point.value, valueFormatter)}`).join(', ')}
      >
        {[0, 0.5, 1].map((ratio) => {
          const y = top + plotHeight * ratio;
          return <line key={ratio} x1={left} x2={left + plotWidth} y1={y} y2={y} className="notebook-trend-gridline" />;
        })}
        <polygon points={areaPoints} className="notebook-trend-area" />
        <polyline points={linePoints} className="notebook-trend-line" />
        {coords.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" className="notebook-trend-dot" />
            <text x={point.x} y={height - 14} textAnchor="middle" className="notebook-trend-axis-label">{point.label}</text>
          </g>
        ))}
      </svg>
      <div className="notebook-trend-values" aria-hidden="true">
        {validPoints.map((point) => (
          <span key={point.label}>
            <small>{point.label}</small>
            <strong>{point.valueLabel ?? formatValue(point.value, valueFormatter)}</strong>
          </span>
        ))}
      </div>
    </figure>
  );
}
