import React from 'react';
import {
  PanelCard,
  PromptField,
} from '../content/NotebookPrimitives';
import {
  EditableBulletList,
} from '../meeting/MeetingFields';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { MeetingRundown } from '../meeting/MeetingRundown';
import { CarryForwardActions } from '../handoff/CarryForwardActions';
import { LockMonthControl } from '../handoff/LockMonthControl';
import { SectionPageShell } from './SectionPageShell';

export function CloseMonthPage({ data, month, section }) {
  const { close } = data;

  const decisionsMadeField = useMeetingNotes(sectionFieldKey(month.id, 'close', 'decisions-summary'));
  const openActionItemsField = useMeetingNotes(sectionFieldKey(month.id, 'close', 'open-actions'));

  const carryForwardSeeds = [...(close.carryForward ?? []), ...(close.revisit ?? [])];

  return (
    <SectionPageShell
      sectionId="close"
      section={section}
      month={month}
      data={data}
      subtitle={close.subtitle}
      badge="Close the month"
    >
      <div className="handoff-summary-row">
        <PanelCard title={`${month.label} summary`} className="handoff-summary-panel">
          <p className="panel-note">{close.summary}</p>
        </PanelCard>
        <MeetingRundown />
      </div>
      {close.readiness?.length > 0 && (
        <PanelCard title="Readiness checklist">
          <ul className="close-readiness-list">
            {close.readiness.map((item) => (
              <li key={item.label} className={item.done ? 'is-done' : 'is-pending'}>
                <span className="close-readiness-status" aria-hidden="true">{item.done ? '✓' : '○'}</span>
                <span>
                  <strong>{item.label}</strong>
                  {item.detail && <span className="close-readiness-detail"> — {item.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </PanelCard>
      )}
      <div className="story-split-grid handoff-split">
        <PanelCard title="Carry forward">
          <EditableBulletList
            storageKey={sectionFieldKey(month.id, 'close', 'carry-forward')}
            seedItems={carryForwardSeeds}
          />
        </PanelCard>
        <PanelCard title="Carry forward actions">
          <CarryForwardActions />
        </PanelCard>
      </div>
      <div className="story-split-grid handoff-split">
        <aside className="snapshot-side handoff-final-edits">
          <PromptField
            label="Decisions summary (optional)"
            value={decisionsMadeField.value}
            onChange={decisionsMadeField.setValue}
            placeholder="Document what you agreed to..."
          />
          <PromptField
            label="Open action items (optional)"
            value={openActionItemsField.value}
            onChange={openActionItemsField.setValue}
            placeholder="What is still in progress?"
          />
        </aside>
      </div>
      <LockMonthControl className="handoff-lock-control" />
    </SectionPageShell>
  );
}
