import React from 'react';
import {
  PanelHeading,
  ScrollBody,
  StickyCard,
} from '../content/NotebookPrimitives';
import { PanelSurface, SectionBlock } from '../notebook';
import { ActionPlan } from '../actions/ActionPlan';
import { SectionPageShell } from './SectionPageShell';

export function ActionsPage({ data, month, section }) {
  const { actions } = data;
  const actionItems = actions.items ?? [];
  const useCappedScroll = actionItems.length >= 10;

  return (
    <SectionPageShell
      sectionId="actions"
      section={section}
      month={month}
      data={data}
      subtitle={actions.page?.subtitle}
      badge="Follow through"
      badgeVariant="continued"
    >
      <div
        className="action-plan-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        {actions.monthlyFocus && (
          <StickyCard label="This month’s focus" tone="context" fill>
            <p>{actions.monthlyFocus}</p>
          </StickyCard>
        )}

        <SectionBlock label="What We’re Doing" className="action-plan-commitments">
          <p className="panel-note action-plan-intro">
            These are the commitments that came out of the meeting. Keep each one specific enough to own, date, and finish.
          </p>
          <PanelSurface className="panel-stack actions-table-panel action-plan-table-surface">
            <PanelHeading title="Action plan" />
            {useCappedScroll ? (
              <ScrollBody label="Action items" capped>
                <ActionPlan seedRows={actionItems} />
              </ScrollBody>
            ) : (
              <div className="panel-body">
                <ActionPlan seedRows={actionItems} />
              </div>
            )}
          </PanelSurface>
        </SectionBlock>
      </div>
    </SectionPageShell>
  );
}
