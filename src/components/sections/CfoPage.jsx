import React from 'react';
import {
  PanelCard,
  SummaryPanel,
  WarningBanner,
} from '../content/NotebookPrimitives';
import { EditableDecisionList } from '../meeting/MeetingFields';
import { cfoDecisionKey, cfoDecisionOutcomeKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';

function PriorityCard({ priority, monthId }) {
  const summaryRows = [
    { icon: '🎯', title: 'Why this matters', text: priority.why },
    { icon: '✨', title: 'Potential benefit', text: priority.benefit },
    { icon: '📊', title: 'Difficulty', text: priority.difficulty },
  ];

  if (priority.suggestedFunds) {
    summaryRows.push({
      icon: '💰',
      title: 'Suggested funds',
      text: priority.suggestedFunds.join(' · '),
    });
  }

  return (
    <article className="cfo-tier-card paper-surface panel-stack">
      <header className="cfo-tier-card-header">
        <span className="cfo-tier-label">{priority.tierLabel}</span>
        <h2 className="cfo-tier-title">{priority.title}</h2>
      </header>
      <div className="snapshot-grid-main cfo-tier-grid">
        <SummaryPanel title="Recommendation detail" rows={summaryRows}>
          {priority.note && <WarningBanner>{priority.note}</WarningBanner>}
        </SummaryPanel>
        <aside className="snapshot-side">
          <PanelCard title="Decisions to make">
            <EditableDecisionList
              storageKey={cfoDecisionKey(monthId, priority.number)}
              outcomeStorageKey={cfoDecisionOutcomeKey(monthId, priority.number)}
              seedDecisions={priority.decisions}
            />
          </PanelCard>
        </aside>
      </div>
    </article>
  );
}

export function CfoPage({ data, month, section }) {
  const { cfo } = data;

  return (
    <SectionPageShell sectionId="cfo" section={section} month={month} data={data} subtitle={cfo.overview?.subtitle}>
      <div className="cfo-tier-stack">
        {cfo.priorities.map((priority) => (
          <PriorityCard key={priority.number} priority={priority} monthId={month.id} />
        ))}
      </div>
    </SectionPageShell>
  );
}
