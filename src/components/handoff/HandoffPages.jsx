import React from 'react';
import {
  PanelCard,
  PromptField,
  ScrollBody,
  SectionPageHeader,
  StickyCard,
} from '../content/NotebookPrimitives';
import { useLocalNotes } from '../../hooks/useLocalNotes';
import {
  EditableBulletList,
  PageWithNotes,
  meetingKey,
} from '../meeting/MeetingFields';
import { MeetingRundown } from '../meeting/MeetingRundown';

export function HandoffPages({ page, totalInSection, data, month }) {
  const { handoff, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;

  const [decisionsMade, setDecisionsMade] = useLocalNotes('fl-july-handoff-decisions');
  const [openActionItems, setOpenActionItems] = useLocalNotes('fl-july-handoff-open-actions');
  const [helpful, setHelpful] = useLocalNotes('fl-july-handoff-helpful');
  const [repetitive, setRepetitive] = useLocalNotes('fl-july-handoff-repetitive');
  const [missing, setMissing] = useLocalNotes('fl-july-handoff-missing');
  const [ideas, setIdeas] = useLocalNotes('fl-july-handoff-ideas');

  const carryForwardSeeds = [...handoff.carryForward, ...handoff.revisit];

  if (page === 1) {
    return (
      <div className="snapshot-page handoff-page-1">
        <PageWithNotes pageId="handoff-1">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Section 09 · Page ${page} of ${totalInSection}`}
            title="Summary & Carry Forward"
            subtitle={handoff.summaryPage.subtitle}
            badge="For August"
          />
          <div className="handoff-summary-row">
            <PanelCard title="July summary" className="handoff-summary-panel">
              <p className="panel-note">{handoff.summary}</p>
            </PanelCard>
            <MeetingRundown />
          </div>
          <div className="story-split-grid handoff-split">
            <PanelCard title="Carry forward" scrollLabel="Carry forward items">
              <EditableBulletList
                storageKey={meetingKey('handoff', 1, 'carry-forward')}
                seedItems={carryForwardSeeds}
              />
            </PanelCard>
            <aside className="snapshot-side">
              <PromptField
                label="Final edits (optional) — Decisions made this meeting"
                value={decisionsMade}
                onChange={setDecisionsMade}
                placeholder="Document what you agreed to..."
              />
              <PromptField
                label="Final edits (optional) — Open action items"
                value={openActionItems}
                onChange={setOpenActionItems}
                placeholder="What is still in progress?"
              />
            </aside>
          </div>
        </PageWithNotes>
      </div>
    );
  }

  return (
    <div className="snapshot-page handoff-page-2">
      <SectionPageHeader
        eyebrow={`${monthLabel} ${year} · CFO Handoff · Page ${page} of ${totalInSection}`}
        title="Ledger Feedback"
        subtitle={handoff.feedbackPage.subtitle}
        badge="Final page"
        badgeVariant="final"
      />
      <div className="handoff-feedback-grid">
        <PanelCard title="How was this ledger?" className="handoff-feedback-panel">
          <ScrollBody label="Ledger feedback">
            <PromptField
              label="What was helpful?"
              value={helpful}
              onChange={setHelpful}
              placeholder="Sections, data, or prompts that worked..."
            />
            <PromptField
              label="What felt repetitive?"
              value={repetitive}
              onChange={setRepetitive}
              placeholder="Skip or shorten next time..."
            />
            <PromptField
              label="What was missing?"
              value={missing}
              onChange={setMissing}
              placeholder="Data or topics to add..."
            />
          </ScrollBody>
        </PanelCard>
        <StickyCard label="Ideas for the next ledger" tone="default">
          <textarea
            className="inline-notes-area"
            value={ideas}
            onChange={(e) => setIdeas(e.target.value)}
            placeholder="Layout, sections, or data you'd change next month..."
            rows={6}
          />
        </StickyCard>
      </div>
    </div>
  );
}
