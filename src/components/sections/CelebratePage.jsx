import React from 'react';
import {
  DetailRows,
  PanelCard,
  PromptField,
  StickyCard,
} from '../content/NotebookPrimitives';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';

export function CelebratePage({ data, month, section }) {
  const { celebrate } = data;

  const familyRewardField = useMeetingNotes(sectionFieldKey(month.id, 'celebrate', 'reward'));
  const gratitudeField = useMeetingNotes(sectionFieldKey(month.id, 'celebrate', 'gratitude'));

  const winRows = [
    { label: 'Biggest win', value: celebrate.biggestWin },
    { label: 'Best habit', value: celebrate.bestHabit },
    { label: 'Money saved', value: celebrate.moneySaved },
    { label: 'Debt reduced', value: celebrate.debtReduced },
  ];

  return (
    <SectionPageShell sectionId="celebrate" section={section} month={month} data={data} subtitle={celebrate.page?.subtitle}>
      <div className="snapshot-grid-main">
        <PanelCard title="Progress to notice">
          <DetailRows rows={winRows} />
        </PanelCard>
        <aside className="snapshot-side">
          <StickyCard label="Financial motto" tone="win">
            <p>{celebrate.page?.motto}</p>
          </StickyCard>
          <PromptField
            label="Family reward"
            value={familyRewardField.value}
            onChange={familyRewardField.setValue}
            placeholder="How should we celebrate this month?"
          />
          <PromptField
            label="Gratitude"
            value={gratitudeField.value}
            onChange={gratitudeField.setValue}
            placeholder="What are we thankful for?"
          />
        </aside>
      </div>
    </SectionPageShell>
  );
}
