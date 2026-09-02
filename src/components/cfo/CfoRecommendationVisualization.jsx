import React from 'react';
import { BarChart, PieChart, TrendingGraph } from '../notebook';
import { formatCurrencyDetailed } from '../../data/spendingAnalysis.js';
import { canRenderCfoVisualization } from '../../utils/cfoVisualization.js';

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Render a chart only when ChatGPT supplied complete numeric visualization config.
 * @param {{ visualization?: object, className?: string }} props
 */
export function CfoRecommendationVisualization({ visualization, className = '' }) {
  if (!canRenderCfoVisualization(visualization)) return null;

  const currencyFormatter = (value) => formatCurrencyDetailed(value, true);

  if (visualization.type === 'balance_comparison' || visualization.type === 'payment_comparison') {
    const { currentValue, projectedValue, currentLabel, projectedLabel } = visualization;
    if (!isFiniteNumber(currentValue) || !isFiniteNumber(projectedValue)) return null;

    const items = [
      {
        name: currentLabel || 'Current',
        amount: formatCurrencyDetailed(currentValue, true),
        percent: 100,
        barWidth: 100,
      },
      {
        name: projectedLabel || 'After',
        amount: formatCurrencyDetailed(projectedValue, true),
        percent: currentValue > 0 ? Math.round((projectedValue / currentValue) * 100) : 0,
        barWidth: currentValue > 0 ? Math.min(100, Math.round((projectedValue / currentValue) * 100)) : 0,
      },
    ];

    return (
      <div className={`cfo-recommendation-visualization ${className}`.trim()}>
        <BarChart variant="group" items={items} showPercent={false} />
        <p className="panel-note cfo-recommendation-visualization-caption">
          {currentLabel || 'Current'}: {formatCurrencyDetailed(currentValue, true)}
          {' → '}
          {projectedLabel || 'After'}: {formatCurrencyDetailed(projectedValue, true)}
        </p>
      </div>
    );
  }

  if (visualization.type === 'allocation') {
    const items = (visualization.items ?? [])
      .filter((item) => isFiniteNumber(item.value))
      .map((item) => ({ label: item.label, value: item.value }));

    if (!items.length) return null;

    return (
      <div className={`cfo-recommendation-visualization ${className}`.trim()}>
        <PieChart items={items} valueFormatter={currencyFormatter} />
      </div>
    );
  }

  if (visualization.type === 'timeline') {
    const points = (visualization.items ?? visualization.points ?? [])
      .filter((item) => isFiniteNumber(item.value))
      .map((item) => ({
        label: item.label,
        value: item.value,
      }));

    if (points.length < 2) return null;

    return (
      <div className={`cfo-recommendation-visualization ${className}`.trim()}>
        <TrendingGraph
          points={points}
          valueFormatter={currencyFormatter}
        />
      </div>
    );
  }

  return null;
}
