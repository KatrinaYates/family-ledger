import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';
import { CardGrid, SectionBlock } from '../notebook';
import { EditableBulletList } from '../meeting/MeetingFields';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { MeetingRundown } from '../meeting/MeetingRundown';
import { CarryForwardActions } from '../handoff/CarryForwardActions';
import { LockMonthControl } from '../handoff/LockMonthControl';
import { SectionPageShell } from './SectionPageShell';

export function CloseMonthPage({ data, month, section }) {
  const { close } = data;
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
      <div
        className="close-month-review-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        <SectionBlock label="Review Before Closing" className="close-month-review">
          <CardGrid columns={2} className="close-month-summary-grid">
            <PanelCard title={`${month.label} summary`} className="handoff-summary-panel">
              <p className="panel-note">{close.summary}</p>
            </PanelCard>
            <MeetingRundown />
          </CardGrid>
        </SectionBlock>

        {close.readiness?.length > 0 && (
          <SectionBlock label="Ready to Close?" className="close-month-readiness">
            <PanelCard title="Readiness checklist">
              <ul className="close-readiness-list">
                {close.readiness.map((item) => (
                  <li key={item.label} className={item.done ? 'is-done' : 'is-pending'}>
                    <span className="close-readiness-status" aria-hidden="true">{item.done ? '✓' : '○'}</span>
                    <span>
                      <strong>{item.label}</strong>
                      {item.detail && <span className="close-readiness-detail"> · {item.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </PanelCard>
          </SectionBlock>
        )}

        <SectionBlock label="Carry Into Next Month" className="close-month-carry-forward">
          <CardGrid columns={2} className="close-month-carry-grid">
            <PanelCard title="Notes to carry forward">
              <EditableBulletList
                storageKey={sectionFieldKey(month.id, 'close', 'carry-forward')}
                seedItems={carryForwardSeeds}
              />
            </PanelCard>
            <PanelCard title="Open actions to carry forward">
              <CarryForwardActions />
            </PanelCard>
          </CardGrid>
        </SectionBlock>

        <SectionBlock label="Finish" className="close-month-finish">
          <LockMonthControl className="handoff-lock-control" />
        </SectionBlock>
      </div>
    </SectionPageShell>
  );
}
