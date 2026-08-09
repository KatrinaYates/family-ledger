import React, { useState } from 'react';
import {
  PanelCard,
  PromptField,
  SectionPageHeader,
} from '../content/NotebookPrimitives';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { meetingConversationKey } from '../../utils/meetingKeys';
import { meetingKey } from '../../utils/meetingKeys';
import { EditableQuestions, PageWithNotes } from './MeetingFields';

function MeetingUpdate({ update }) {
  if (!update?.metrics?.length) return null;

  return (
    <PanelCard title={update.label || 'Meeting Update'} className="meeting-update-card">
      <p className="panel-note">{update.note}</p>
      <div className="meeting-update-list">
        {update.metrics.map((metric) => (
          <p className="panel-note" key={metric.label}>
            <strong>{metric.label}</strong>: {metric.monthEnd} at month-end → {metric.current} latest connected{' '}
            <span>({metric.change})</span>
          </p>
        ))}
      </div>
      {update.debtBreakdown && (
        <p className="panel-note">
          Latest connected debt detail: {update.debtBreakdown.creditCards} credit cards + {update.debtBreakdown.loans} loans.
        </p>
      )}
      {update.coverageNote && <p className="panel-note">{update.coverageNote}</p>}
    </PanelCard>
  );
}

export function MeetingPages({ page, totalInSection, data, month }) {
  const { meeting, meta } = data;
  const monthLabel = month?.label || meta?.month || 'This month';
  const year = meta?.year || 2026;

  const surprisedField = useMeetingNotes(meetingConversationKey(month.id, 'surprised'));
  const feltGoodField = useMeetingNotes(meetingConversationKey(month.id, 'feltGood'));
  const feltStressfulField = useMeetingNotes(meetingConversationKey(month.id, 'feltStressful'));
  const decisionsField = useMeetingNotes(meetingConversationKey(month.id, 'decisions'));
  const parkingLotField = useMeetingNotes(meetingConversationKey(month.id, 'parkingLot'));

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
          <MeetingUpdate update={meeting.currentUpdate} />
          <div className="meeting-prompt-grid">
            <PromptField label="What surprised us?" value={surprisedField.value} onChange={surprisedField.setValue} />
            <PromptField label="What felt good?" value={feltGoodField.value} onChange={feltGoodField.setValue} />
            <PromptField label="What felt stressful?" value={feltStressfulField.value} onChange={feltStressfulField.setValue} />
            <PromptField label="Decisions we made" value={decisionsField.value} onChange={decisionsField.setValue} />
            <PromptField label="Parking lot" value={parkingLotField.value} onChange={parkingLotField.setValue} />
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
