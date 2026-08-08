import React from 'react';
import {
  PanelCard,
  ScrollBody,
  SectionPageHeader,
  StickyCard,
} from '../content/NotebookPrimitives';
import { ActionPlan } from './ActionPlan';
import { PageWithNotes } from '../meeting/MeetingFields';

export function ActionsPages({ page, totalInSection, data, month }) {
  const { actions, meta } = data;
  const monthLabel = month?.label || meta?.month || 'This month';
  const year = meta?.year || 2026;

  return (
    <div className="snapshot-page actions-page">
      <PageWithNotes pageId="actions-1">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Section 07 · Page ${page} of ${totalInSection}`}
          title="Action Items"
          subtitle={actions.page.subtitle}
          badge="Next steps"
        />
        <StickyCard label="Monthly focus" tone="focus">
          <p>{actions.monthlyFocus}</p>
        </StickyCard>
        <PanelCard title="Action plan" className="actions-table-panel" scrollLabel="Action items">
          <ScrollBody label="Action items">
            <ActionPlan seedRows={actions.items} />
          </ScrollBody>
        </PanelCard>
      </PageWithNotes>
    </div>
  );
}
