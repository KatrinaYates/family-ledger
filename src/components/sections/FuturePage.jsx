import React from 'react';
import {
  MetricKpiRow,
  PanelCard,
  StickyCard,
} from '../content/NotebookPrimitives';
import { EditableBulletList } from '../meeting/MeetingFields';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';

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

export function FuturePage({ data, month, section }) {
  const { future } = data;
  const monthLabel = month?.label || data?.meta?.month || 'This month';
  const { retirement, kidsSavings } = future;

  return (
    <SectionPageShell
      sectionId="future"
      section={section}
      month={month}
      data={data}
      subtitle={future.retirementPage?.subtitle}
    >
      <div className="future-kpi-row">
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
      </div>
      <div className="future-top-row">
        <PanelCard title="What we know" className="future-known-panel">
          <p className="panel-note">{retirement.goalNote}</p>
        </PanelCard>
        <StickyCard label="Still to define" tone="missing">
          <EditableBulletList
            storageKey={sectionFieldKey(month.id, 'future', 'still-to-define')}
            seedItems={['Target retirement age', 'Desired retirement income', 'Contribution percentages']}
          />
        </StickyCard>
      </div>
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
      <div className="story-split-grid future-goals-grid">
        <PanelCard title="Shared goals">
          <EditableBulletList
            storageKey={sectionFieldKey(month.id, 'future', 'goals')}
            seedItems={future.goals}
          />
        </PanelCard>
        <PanelCard title="Upcoming expenses">
          <EditableBulletList
            storageKey={sectionFieldKey(month.id, 'future', 'upcoming')}
            seedItems={future.upcomingExpenses}
          />
        </PanelCard>
      </div>
    </SectionPageShell>
  );
}
