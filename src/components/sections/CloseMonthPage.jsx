import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';
import { CardGrid, SectionBlock } from '../notebook';
import { EditableBulletList } from '../meeting/MeetingFields';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { MeetingRundown } from '../meeting/MeetingRundown';
import { CarryForwardActions } from '../handoff/CarryForwardActions';
import { LockMonthControl } from '../handoff/LockMonthControl';
import { SectionPageShell } from './SectionPageShell';
import { useActions } from '../../hooks/useActions';

function buildLiveActionReadiness(actions, loading, error) {
  if (loading) {
    return {
      label: 'Action items assigned',
      done: false,
      detail: 'Checking owners and due dates…',
    };
  }

  if (error) {
    return {
      label: 'Action items assigned',
      done: false,
      detail: 'Could not verify action assignments',
    };
  }

  const openActions = actions.filter((action) => !['done', 'deferred'].includes(action.status));
  if (!openActions.length) {
    return {
      label: 'Action items assigned',
      done: true,
      detail: 'No open actions',
    };
  }

  const missingOwner = openActions.filter((action) => !String(action.owner ?? '').trim()).length;
  const missingDueDate = openActions.filter((action) => !action.dueDate).length;
  const done = missingOwner === 0 && missingDueDate === 0;

  if (done) {
    return {
      label: 'Action items assigned',
      done: true,
      detail: `${openActions.length} open ${openActions.length === 1 ? 'action has' : 'actions have'} an owner and due date`,
    };
  }

  const gaps = [];
  if (missingOwner) gaps.push(`${missingOwner} need ${missingOwner === 1 ? 'an owner' : 'owners'}`);
  if (missingDueDate) gaps.push(`${missingDueDate} need due ${missingDueDate === 1 ? 'date' : 'dates'}`);

  return {
    label: 'Action items assigned',
    done: false,
    detail: gaps.join(' · '),
  };
}

export function CloseMonthPage({ data, month, section }) {
  const { close } = data;
  const { actions, loading: actionsLoading, error: actionsError } = useActions();
  const carryForwardSeeds = [...(close.carryForward ?? []), ...(close.revisit ?? [])];
  const actionReadiness = buildLiveActionReadiness(actions, actionsLoading, actionsError);
  const readiness = (close.readiness ?? []).map((item) => (
    item.label === 'Action items assigned' ? actionReadiness : item
  ));

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

        {readiness.length > 0 && (
          <SectionBlock label="Ready to Close?" className="close-month-readiness">
            <PanelCard title="Readiness checklist">
              <ul className="close-readiness-list">
                {readiness.map((item) => (
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
