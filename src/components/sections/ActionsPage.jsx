import React from 'react';
import {
  NOTEBOOK_SYMBOLS,
  PanelHeading,
  ScrollBody,
  TopicBand,
} from '../content/NotebookPrimitives';
import {
  DecorativeStickyNote,
  PanelSurface,
  SectionBlock,
} from '../notebook';
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
          <DecorativeStickyNote tone="blue" title="This month’s focus" fill>
            {actions.monthlyFocus}
          </DecorativeStickyNote>
        )}

        <SectionBlock label="What We’re Doing" className="action-plan-commitments">
          <TopicBand
            icon={NOTEBOOK_SYMBOLS.ready}
            label="Meeting commitments"
            title="Own it · date it · finish it"
            description="Keep each action specific enough that we know who owns it, when it is due, and what done looks like."
          />
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
