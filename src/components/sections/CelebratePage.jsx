import React from 'react';
import {
  DetailRows,
  PanelCard,
  PromptField,
  StickyCard,
} from '../content/NotebookPrimitives';
import { CardGrid, SectionBlock } from '../notebook';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';

function hasMeaningfulValue(value) {
  if (value == null) return false;
  const text = String(value).trim();
  return Boolean(text && text !== '—' && text !== '-');
}

export function CelebratePage({ data, month, section }) {
  const { celebrate } = data;

  const familyRewardField = useMeetingNotes(sectionFieldKey(month.id, 'celebrate', 'reward'));
  const gratitudeField = useMeetingNotes(sectionFieldKey(month.id, 'celebrate', 'gratitude'));

  const winRows = [
    { label: 'Biggest win', value: celebrate.biggestWin },
    { label: 'Best habit', value: celebrate.bestHabit },
    { label: 'Money saved', value: celebrate.moneySaved },
    { label: 'Debt reduced', value: celebrate.debtReduced },
  ].filter((row) => hasMeaningfulValue(row.value));

  return (
    <SectionPageShell sectionId="celebrate" section={section} month={month} data={data} subtitle={celebrate.page?.subtitle}>
      <div
        className="celebrate-review-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        <SectionBlock label="Progress Worth Noticing" className="celebrate-progress">
          <PanelCard title="What went well">
            <DetailRows rows={winRows} />
          </PanelCard>
        </SectionBlock>

        <SectionBlock label="Make It Personal" className="celebrate-personal">
          <CardGrid columns={2} className="celebrate-prompt-grid">
            <PromptField
              label="How should we celebrate?"
              value={familyRewardField.value}
              onChange={familyRewardField.setValue}
              placeholder="A small reward, family activity, or something fun..."
              readOnly={familyRewardField.isLocked}
              saveError={familyRewardField.saveError}
              saving={familyRewardField.saving}
            />
            <PromptField
              label="What are we grateful for?"
              value={gratitudeField.value}
              onChange={gratitudeField.setValue}
              placeholder="A person, habit, opportunity, or moment from this month..."
              readOnly={gratitudeField.isLocked}
              saveError={gratitudeField.saveError}
              saving={gratitudeField.saving}
            />
          </CardGrid>
        </SectionBlock>

        {celebrate.page?.motto && (
          <StickyCard label="Carry this with us" tone="family" fill prose layout="editorial">
            {celebrate.page.motto}
          </StickyCard>
        )}
      </div>
    </SectionPageShell>
  );
}
