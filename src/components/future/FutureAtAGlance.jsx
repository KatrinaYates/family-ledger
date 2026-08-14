import React from 'react';
import { Illustration } from '../LedgerComponents';
import { ComposedMoneyGrid, SectionBlock } from '../notebook/KitComponents';
import { buildFutureProgressParts } from '../../utils/futureProgressParts';

/** @param {{ atAGlanceLabel?: string, futureProgress?: { total?: string, components?: Array<{ label: string, value: string }> }, summary?: string }} props */
export function FutureAtAGlance({ atAGlanceLabel, futureProgress, summary }) {
  if (!futureProgress?.total) return null;

  const parts = buildFutureProgressParts(futureProgress.components ?? []);

  return (
    <SectionBlock label={atAGlanceLabel} className="future-glance">
      <Illustration name="sunflower" className="future-glance-doodle" />
      <ComposedMoneyGrid
        className="future-progress-composed"
        parts={parts}
        total={{
          value: futureProgress.total,
          caption: 'moved toward our future this month',
        }}
      />
      {summary && (
        <p className="panel-note future-progress-summary">{summary}</p>
      )}
    </SectionBlock>
  );
}
