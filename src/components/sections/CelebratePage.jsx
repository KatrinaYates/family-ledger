import React from 'react';
import {
  NOTEBOOK_SYMBOLS,
  PromptField,
  StickyCard,
  SummaryPanel,
} from '../content/NotebookPrimitives';
import {
  CardGrid,
  DecorativeStickyNote,
  SectionBlock,
} from '../notebook';
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
    { label: 'Biggest win', value: celebrate.biggestWin, icon: NOTEBOOK_SYMBOLS.win },
    { label: 'Best habit', value: celebrate.bestHabit, icon: NOTEBOOK_SYMBOLS.ready },
    { label: 'Money saved', value: celebrate.moneySaved, icon: NOTEBOOK_SYMBOLS.cash },
    { label: 'Debt reduced', value: celebrate.debtReduced, icon: NOTEBOOK_SYMBOLS.focus },
  ].filter((row) => hasMeaningfulValue(row.value));

  const summaryRows = winRows.map((row) => ({
    icon: row.icon,
    title: row.label,
    text: row.value,
  }));

  return (
    <SectionPageShell sectionId="celebrate" section={section} month={month} data={data} subtitle={celebrate.page?.subtitle}>
      <div
        className="celebrate-review-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        <SectionBlock label="Progress Worth Noticing" className="celebrate-progress">
          <CardGrid layout="mainSidebar">
            <SummaryPanel title="What went well" rows={summaryRows} />
            <aside className="snapshot-side">
              <DecorativeStickyNote tone="green" title="Tiny celebration counts" fill>
                Progress is easier to repeat when we actually notice it. Pick one thing from this month that deserves a little credit.
              </DecorativeStickyNote>
            </aside>
          </CardGrid>
        </SectionBlock>

        <SectionBlock label="Make It Personal" className="celebrate-personal">
          <CardGrid columns={2} className="celebrate-prompt-grid">
            <PromptField
              label="How should we celebrate?"
              value={familyRewardField.value}
              onChange={familyRewardField.setValue}
              placeholder="A small reward, family activity, or something fun..."
            />
            <PromptField
              label="What are we grateful for?"
              value={gratitudeField.value}
              onChange={gratitudeField.setValue}
              placeholder="A person, habit, opportunity, or moment from this month..."
            />
          </CardGrid>
        </SectionBlock>

        {celebrate.page?.motto && (
          <StickyCard label="Carry this with us" tone="family" fill prose>
            {celebrate.page.motto}
          </StickyCard>
        )}
      </div>
    </SectionPageShell>
  );
}
