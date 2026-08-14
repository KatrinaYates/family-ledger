import React from 'react';
import { StickyCard } from '../content/NotebookPrimitives';
import { MoneyBlockGrid, SectionBlock } from '../notebook';

export function SpendingOverview({ overview }) {
  if (!overview) return null;

  const changeTone =
    overview.direction === 'down' ? 'tone-spending-down'
      : overview.direction === 'up' ? 'tone-spending-up'
        : '';

  return (
    <SectionBlock label="Spending Overview" className="spending-overview">
      <MoneyBlockGrid
        className="spending-overview-grid"
        prior={{ label: overview.priorLabel, value: overview.priorTotal }}
        current={{ label: overview.currentLabel, value: overview.currentTotal }}
        change={{
          label: 'Change',
          value: overview.changeAmount,
          subtitle: overview.changePercent && overview.changePercent !== '—'
            ? overview.changePercent
            : undefined,
          tone: changeTone,
        }}
      />
      {overview.footnote && (
        <p className="panel-note spending-overview-footnote">{overview.footnote}</p>
      )}
      {overview.interpretation && (
        <StickyCard label="What drove the change" tone="context" fill className="spending-overview-pulse">
          <p>{overview.interpretation}</p>
        </StickyCard>
      )}
    </SectionBlock>
  );
}
