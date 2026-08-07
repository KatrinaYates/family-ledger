import React from 'react';
import {
  PanelCard,
  PromptField,
  ScrollBody,
  SectionPageHeader,
  StickyCard,
} from '../content/NotebookPrimitives';
import {
  EditableBulletList,
  PageWithNotes,
} from '../meeting/MeetingFields';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { handoffKey, meetingKey } from '../../utils/meetingKeys';
import { MeetingRundown } from '../meeting/MeetingRundown';
import { CarryForwardActions } from './CarryForwardActions';
import { LockMonthControl } from './LockMonthControl';

export function HandoffPages({ page, totalInSection, data, month }) {
  const { handoff, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;

  const decisionsMadeField = useMeetingNotes(handoffKey(month.id, 'decisions'));
  const openActionItemsField = useMeetingNotes(handoffKey(month.id, 'open-actions'));
  const helpfulField = useMeetingNotes(handoffKey(month.id, 'helpful'));
  const repetitiveField = useMeetingNotes(handoffKey(month.id, 'repetitive'));
  const missingField = useMeetingNotes(handoffKey(month.id, 'missing'));
  const ideasField = useMeetingNotes(handoffKey(month.id, 'ideas'));

  const carryForwardSeeds = [...handoff.carryForward, ...handoff.revisit];

  if (page === 1) {
    return (
      <div className="snapshot-page handoff-page-1">
        <PageWithNotes pageId="handoff-1">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Section 09 · Page ${page} of ${totalInSection}`}
            title="Summary & Carry Forward"
            subtitle={handoff.summaryPage.subtitle}
            badge="Handoff"
          />
          <div className="handoff-summary-row">
            <PanelCard title={`${monthLabel} summary`} className="handoff-summary-panel">
              <p className="panel-note">{handoff.summary}</p>
            </PanelCard>
            <MeetingRundown />
          </div>
          <div className="story-split-grid handoff-split">
            <PanelCard title="Carry forward" scrollLabel="Carry forward items">
              <EditableBulletList
                storageKey={meetingKey(month.id, 'handoff', 1, 'carry-forward')}
                seedItems={carryForwardSeeds}
              />
            </PanelCard>
            <PanelCard title="Carry forward actions" scrollLabel="Open action items">
              <CarryForwardActions />
            </PanelCard>
          </div>
          <LockMonthControl className="handoff-lock-control" />
          <div className="story-split-grid handoff-split">
            <aside className="snapshot-side handoff-final-edits">
              <PromptField
                label="Final edits (optional) — Decisions made this meeting"
                value={decisionsMadeField.value}
                onChange={decisionsMadeField.setValue}
                placeholder="Document what you agreed to..."
              />
              <PromptField
                label="Final edits (optional) — Open action items"
                value={openActionItemsField.value}
                onChange={openActionItemsField.setValue}
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
              value={helpfulField.value}
              onChange={helpfulField.setValue}
              placeholder="Sections, data, or prompts that worked..."
            />
            <PromptField
              label="What felt repetitive?"
              value={repetitiveField.value}
              onChange={repetitiveField.setValue}
              placeholder="Skip or shorten next time..."
            />
            <PromptField
              label="What was missing?"
              value={missingField.value}
              onChange={missingField.setValue}
              placeholder="Data or topics to add..."
            />
          </ScrollBody>
        </PanelCard>
        <StickyCard label="Ideas for the next ledger" tone="default">
          <textarea
            className="inline-notes-area"
            value={ideasField.value}
            onChange={(e) => ideasField.setValue(e.target.value)}
            placeholder="Layout, sections, or data you'd change next month..."
            rows={6}
            readOnly={ideasField.isLocked}
          />
          {ideasField.saveError && (
            <p className="field-save-error" role="alert">{ideasField.saveError}</p>
          )}
        </StickyCard>
      </div>
    </div>
  );
}
