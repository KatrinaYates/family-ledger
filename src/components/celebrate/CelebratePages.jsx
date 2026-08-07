import React from 'react';
import {
  DetailRows,
  PanelCard,
  PromptField,
  SectionPageHeader,
  StickyCard,
} from '../content/NotebookPrimitives';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { celebrateKey } from '../../utils/meetingKeys';
import { PageWithNotes } from '../meeting/MeetingFields';

export function CelebratePages({ page, totalInSection, data, month }) {
  const { celebrate, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;

  const [familyReward, setFamilyReward] = useMeetingNotes(celebrateKey(month.id, 'reward'));
  const [gratitude, setGratitude] = useMeetingNotes(celebrateKey(month.id, 'gratitude'));

  const winRows = [
    { label: 'Biggest win', value: celebrate.biggestWin },
    { label: 'Best habit', value: celebrate.bestHabit },
    { label: 'Money saved', value: celebrate.moneySaved },
    { label: 'Debt reduced', value: celebrate.debtReduced },
  ];

  return (
    <div className="snapshot-page celebrate-page">
      <PageWithNotes pageId="celebrate-1">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Section 08 · Page ${page} of ${totalInSection}`}
          title="Wins & Gratitude"
          subtitle={celebrate.page.subtitle}
          badge="Celebrate"
        />
        <div className="snapshot-grid-main">
          <PanelCard title="Progress to notice">
            <DetailRows rows={winRows} />
          </PanelCard>
          <aside className="snapshot-side">
            <StickyCard label="Financial motto" tone="win">
              <p>{celebrate.page.motto}</p>
            </StickyCard>
            <PromptField
              label="Family reward"
              value={familyReward}
              onChange={setFamilyReward}
              placeholder="How should we celebrate this month?"
            />
            <PromptField
              label="Gratitude"
              value={gratitude}
              onChange={setGratitude}
              placeholder="What are we thankful for?"
            />
          </aside>
        </div>
      </PageWithNotes>
    </div>
  );
}
