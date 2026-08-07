import React from 'react';
import {
  PanelCard,
  SectionPageHeader,
  SummaryPanel,
  WarningBanner,
} from '../content/NotebookPrimitives';
import {
  EditableDecisionList,
  PageWithNotes,
} from '../meeting/MeetingFields';
import { meetingKey } from '../../utils/meetingKeys';

export function CfoPages({ page, totalInSection, data, month }) {
  const { cfo, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;
  const priority = cfo.priorities[page - 1];

  if (!priority) return null;

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
    <div className={`snapshot-page cfo-page-${page}`}>
      <PageWithNotes pageId={`cfo-${page}`}>
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Section 04 · Page ${page} of ${totalInSection}`}
          title={priority.title}
          subtitle={page === 1 ? cfo.overview.subtitle : `Priority ${priority.number} of ${totalInSection}`}
          badge={`Priority ${priority.number}`}
        />
        <div className="snapshot-grid-main">
          <SummaryPanel title="Recommendation detail" rows={summaryRows}>
            {priority.note && <WarningBanner>{priority.note}</WarningBanner>}
          </SummaryPanel>
          <aside className="snapshot-side">
            <PanelCard title="Decisions to make" scrollLabel="CFO decision options">
              <EditableDecisionList
                storageKey={meetingKey(month.id, 'cfo', page, 'decisions')}
                seedDecisions={priority.decisions}
              />
            </PanelCard>
          </aside>
        </div>
      </PageWithNotes>
    </div>
  );
}
