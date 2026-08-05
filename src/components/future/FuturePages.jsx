import React from 'react';
import {
  MetricKpiRow,
  PanelCard,
  SectionPageHeader,
  StickyCard,
} from '../content/NotebookPrimitives';
import {
  EditableBulletList,
  PageWithNotes,
  meetingKey,
} from '../meeting/MeetingFields';

export function FuturePages({ page, totalInSection, data, month }) {
  const { future, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;
  const { retirement } = future;

  if (page === 1) {
    return (
      <div className="snapshot-page future-page-1">
        <PageWithNotes pageId="future-1">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Section 05 · Page ${page} of ${totalInSection}`}
            title="Retirement Progress"
            subtitle={future.retirementPage.subtitle}
            badge="Long-term view"
          />
          <MetricKpiRow items={[
            {
              icon: '🌱',
              label: 'Retirement balance',
              value: retirement.balance,
              chip: { text: 'Connected accounts', tone: 'purple' },
            },
            {
              icon: '📥',
              label: 'July contributions',
              value: retirement.julyContributions,
              chip: { text: 'Still investing', tone: 'green' },
            },
          ]} />
          <div className="snapshot-grid-main">
            <PanelCard title="What we know">
              <p className="panel-note">{retirement.goalNote}</p>
            </PanelCard>
            <aside className="snapshot-side">
              <StickyCard label="Still to define" tone="missing">
                <EditableBulletList
                  storageKey={meetingKey('future', 1, 'still-to-define')}
                  seedItems={['Target retirement age', 'Desired retirement income', 'Contribution percentages']}
                />
              </StickyCard>
            </aside>
          </div>
        </PageWithNotes>
      </div>
    );
  }

  return (
    <div className="snapshot-page future-page-2">
      <PageWithNotes pageId="future-2">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Retirement & Future · Page ${page} of ${totalInSection}`}
          title="Goals & Upcoming"
          subtitle={future.goalsPage.subtitle}
          badge="Final future page"
          badgeVariant="final"
        />
        <div className="story-split-grid">
          <PanelCard title="Shared goals" scrollLabel="Family financial goals">
            <EditableBulletList
              storageKey={meetingKey('future', 2, 'goals')}
              seedItems={future.goals}
            />
          </PanelCard>
          <PanelCard title="Upcoming expenses" scrollLabel="Upcoming expenses">
            <EditableBulletList
              storageKey={meetingKey('future', 2, 'upcoming')}
              seedItems={future.upcomingExpenses}
            />
          </PanelCard>
        </div>
      </PageWithNotes>
    </div>
  );
}
