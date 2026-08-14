import React from 'react';
import {
  PanelHeading,
  ScrollBody,
} from '../content/NotebookPrimitives';
import { PanelSurface, DecorativeStickyNote } from '../notebook';
import { ActionPlan } from '../actions/ActionPlan';
import { SectionPageShell } from './SectionPageShell';

export function ActionsPage({ data, month, section }) {
  const { actions } = data;
  const actionItems = actions.items ?? [];
  const useCappedScroll = actionItems.length >= 10;

  return (
    <SectionPageShell sectionId="actions" section={section} month={month} data={data} subtitle={actions.page?.subtitle}>
      <div className="actions-page-focus">
        <DecorativeStickyNote tone="green" title="Monthly focus">
          {actions.monthlyFocus}
        </DecorativeStickyNote>
      </div>
      <PanelSurface className="panel-stack actions-table-panel">
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
    </SectionPageShell>
  );
}
