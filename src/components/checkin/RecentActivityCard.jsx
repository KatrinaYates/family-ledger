import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';

export function RecentActivityCard({ recentActivity }) {
  if (!recentActivity) return null;

  const hasSpend = recentActivity.sevenDaySpendLabel;
  const items = recentActivity.items ?? [];
  const hasItems = items.length > 0;

  if (!hasSpend && !hasItems) return null;

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
