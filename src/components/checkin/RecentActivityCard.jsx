import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';
import { TrendingGraph } from '../notebook';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function RecentActivityCard({ recentActivity }) {
  if (!recentActivity) return null;

  const hasSpend = recentActivity.sevenDaySpendLabel;
  const items = recentActivity.items ?? [];
  const hasItems = items.length > 0;
  const trendPoints = (recentActivity.dailyBars ?? []).map((bar) => ({
    label: bar.label,
    value: bar.value,
    valueLabel: bar.valueLabel,
  }));
  const hasTrend = trendPoints.length > 0;

  if (!hasSpend && !hasItems && !hasTrend) return null;

  return (
    <PanelCard
      title="Recent activity"
      scrollLabel="Recent spending and transactions"
      className="check-in-card check-in-activity-card"
    >
      {hasSpend && (
        <p className="check-in-activity-spend">
          <span>7-day spend</span>
          <strong>{recentActivity.sevenDaySpendLabel}</strong>
        </p>
      )}

      {hasTrend && (
        <TrendingGraph
          points={trendPoints}
          title="Daily spending"
          valueFormatter={formatCurrency}
          tone="coral"
          className="check-in-activity-chart"
        />
      )}

      {recentActivity.summary && (
        <p className="check-in-card-lead">{recentActivity.summary}</p>
      )}

      {hasItems && (
        <ul className="check-in-activity-list">
          {items.map((item, index) => (
            <li key={`${item.label || item.description || 'item'}-${index}`}>
              <span>{item.label || item.description || item.name}</span>
              {item.amount != null && <strong>{item.amount}</strong>}
              {item.date && <time dateTime={item.date}>{item.date}</time>}
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
