import React from 'react';
import {
  PanelCard,
  PromptField,
  SectionPageHeader,
} from '../content/NotebookPrimitives';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { meetingConversationKey } from '../../utils/meetingKeys';
import { meetingKey } from '../../utils/meetingKeys';
import { EditableQuestions, PageWithNotes } from './MeetingFields';

export function MeetingPages({ page, totalInSection, data, month }) {
  const { meeting, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;

  const [surprised, setSurprised] = useMeetingNotes(meetingConversationKey(month.id, 'surprised'));
  const [feltGood, setFeltGood] = useMeetingNotes(meetingConversationKey(month.id, 'feltGood'));
  const [feltStressful, setFeltStressful] = useMeetingNotes(meetingConversationKey(month.id, 'feltStressful'));
  const [decisions, setDecisions] = useMeetingNotes(meetingConversationKey(month.id, 'decisions'));
  const [parkingLot, setParkingLot] = useMeetingNotes(meetingConversationKey(month.id, 'parkingLot'));

  if (page === 1) {
    return (
      <div className="snapshot-page meeting-page-1">
        <PageWithNotes pageId="meeting-1">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Section 06 · Page ${page} of ${totalInSection}`}
            title="Conversation Prompts"
            subtitle={meeting.promptsPage.subtitle}
            badge="Talk together"
            badgeVariant="talk"
          />
          <div className="meeting-prompt-grid">
            <PromptField label="What surprised us?" value={surprised} onChange={setSurprised} />
            <PromptField label="What felt good?" value={feltGood} onChange={setFeltGood} />
            <PromptField label="What felt stressful?" value={feltStressful} onChange={setFeltStressful} />
            <PromptField label="Decisions we made" value={decisions} onChange={setDecisions} />
            <PromptField label="Parking lot" value={parkingLot} onChange={setParkingLot} />
          </div>
        </PageWithNotes>
      </div>
    );
  }

  return (
    <div className="snapshot-page meeting-page-2">
      <PageWithNotes pageId="meeting-2">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Section 06 · Page ${page} of ${totalInSection}`}
          title="Open Questions"
          subtitle={meeting.questionsPage.subtitle}
          badge="Still thinking"
        />
        <PanelCard title="Questions to revisit">
          <EditableQuestions
            storageKey={meetingKey(month.id, 'meeting', 2, 'questions')}
            seedQuestions={meeting.questions}
          />
        </PanelCard>
        <PanelCard title="Meeting insight">
          <p className="panel-note">{meeting.insight}</p>
        </PanelCard>
      </PageWithNotes>
    </div>
  );
}
