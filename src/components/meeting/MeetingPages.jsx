import React from 'react';
import {
  PanelCard,
  PromptField,
  SectionPageHeader,
} from '../content/NotebookPrimitives';
import { useLocalNotes } from '../../hooks/useLocalNotes';
import { EditableQuestions, PageWithNotes, meetingKey } from './MeetingFields';

export function MeetingPages({ page, totalInSection, data, month }) {
  const { meeting, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;

  const [surprised, setSurprised] = useLocalNotes('fl-july-meeting-surprised');
  const [feltGood, setFeltGood] = useLocalNotes('fl-july-meeting-feltGood');
  const [feltStressful, setFeltStressful] = useLocalNotes('fl-july-meeting-feltStressful');
  const [decisions, setDecisions] = useLocalNotes('fl-july-meeting-decisions');
  const [parkingLot, setParkingLot] = useLocalNotes('fl-july-meeting-parkingLot');

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
          <div className="prompt-grid">
            <PromptField
              label="What surprised us?"
              value={surprised}
              onChange={setSurprised}
              placeholder="Capture reactions without blame..."
            />
            <PromptField
              label="What felt good?"
              value={feltGood}
              onChange={setFeltGood}
              placeholder="Wins, relief, progress..."
            />
            <PromptField
              label="What felt stressful?"
              value={feltStressful}
              onChange={setFeltStressful}
              placeholder="Pressure points worth naming..."
            />
            <PromptField
              label="Decisions we made"
              value={decisions}
              onChange={setDecisions}
              placeholder="What did we agree to today?"
            />
            <PromptField
              label="Parking lot"
              value={parkingLot}
              onChange={setParkingLot}
              placeholder="Topics to revisit later..."
            />
          </div>
        </PageWithNotes>
      </div>
    );
  }

  return (
    <div className="snapshot-page meeting-page-2">
      <PageWithNotes pageId="meeting-2">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Money Meeting · Page ${page} of ${totalInSection}`}
          title="Questions & Notes"
          subtitle={meeting.questionsPage.subtitle}
          badge="Final meeting page"
          badgeVariant="final"
        />
        <div className="snapshot-grid-main">
          <PanelCard title="Open questions" scrollLabel="Meeting questions">
            <EditableQuestions
              storageKey={meetingKey('meeting', 2, 'questions')}
              seedQuestions={meeting.questions}
            />
          </PanelCard>
        </div>
      </PageWithNotes>
    </div>
  );
}
