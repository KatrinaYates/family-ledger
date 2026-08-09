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
} from '../meeting/MeetingFields';
import { meetingKey } from '../../utils/meetingKeys';

function kidGrowthLine(kid, monthLabel) {
  const hasGrowth = kid.monthAdded || kid.monthContributions || kid.monthInterest;
  if (!hasGrowth) return null;

  return (
    <p className="panel-note kids-savings-growth">
      {monthLabel} growth: <strong>{kid.monthAdded ?? '—'}</strong>
      {' '}
      ({kid.monthContributions ?? '—'} contributed + {kid.monthInterest ?? '—'} interest)
    </p>
  );
}

export function FuturePages({ page, totalInSection, data, month }) {
  const { future, meta } = data;
  const monthLabel = month?.label || meta?.month || 'This month';
  const year = meta?.year || 2026;
  const { retirement, kidsSavings } = future;

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
              label: `${monthLabel} contributions`,
              value: retirement.monthContributions,
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
                  storageKey={meetingKey(month.id, 'future', 1, 'still-to-define')}
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
        {kidsSavings.accounts.length > 0 && (
          <div className="kids-savings-section">
            <div className="kids-savings-grid" aria-label="Kids savings by child">
              {kidsSavings.accounts.map((kid) => (
                <PanelCard
                  key={kid.name}
                  title={kid.name}
                  total={kid.balance}
                  className="kids-savings-card"
                >
                  {kidGrowthLine(kid, monthLabel)}
                </PanelCard>
              ))}
            </div>
            {(kidsSavings.monthAdded || kidsSavings.note) && (
              <p className="panel-note kids-savings-household-note">
                {kidsSavings.monthAdded && (
                  <>
                    Household {monthLabel} total: <strong>{kidsSavings.monthAdded}</strong>
                    {' '}
                    ({kidsSavings.monthContributions} contributed + {kidsSavings.monthInterest} interest).
                    {' '}
                  </>
                )}
                {kidsSavings.note}
              </p>
            )}
          </div>
        )}
        <div className="story-split-grid">
          <PanelCard title="Shared goals" scrollLabel="Family financial goals">
            <EditableBulletList
              storageKey={meetingKey(month.id, 'future', 2, 'goals')}
              seedItems={future.goals}
            />
          </PanelCard>
          <PanelCard title="Upcoming expenses" scrollLabel="Upcoming expenses">
            <EditableBulletList
              storageKey={meetingKey(month.id, 'future', 2, 'upcoming')}
              seedItems={future.upcomingExpenses}
            />
          </PanelCard>
        </div>
      </PageWithNotes>
    </div>
  );
}
