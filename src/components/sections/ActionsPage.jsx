import React from 'react';
import {
  PanelCard,
  ScrollBody,
  StickyCard,
} from '../content/NotebookPrimitives';
import { ActionPlan } from '../actions/ActionPlan';
import { SectionPageShell } from './SectionPageShell';

export function ActionsPage({ data, month, section }) {
  const { actions } = data;
  const actionItems = actions.items ?? [];
  const useCappedScroll = actionItems.length >= 10;

  return (
    <SectionPageShell sectionId="actions" section={section} month={month} data={data} subtitle={actions.page?.subtitle}>
      <StickyCard label="Monthly focus" tone="focus">
        <p>{actions.monthlyFocus}</p>
      </StickyCard>
      <PanelCard title="Action plan" className="actions-table-panel">
        {useCappedScroll ? (
          <ScrollBody label="Action items" capped>
            <ActionPlan seedRows={actionItems} />
          </ScrollBody>
        ) : (
          <ActionPlan seedRows={actionItems} />
        )}
      </PanelCard>
    </SectionPageShell>
  );
}
