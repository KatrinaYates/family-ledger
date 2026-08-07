import React from 'react';
import {
  ChangeTable,
  DashedList,
  MetricKpiRow,
  MomChangeCard,
  PanelCard,
  RankedTable,
  SectionPageHeader,
  StickyCard,
} from '../content/NotebookPrimitives';
import {
  EditableBulletList,
  EditableQuestions,
  PageWithNotes,
} from '../meeting/MeetingFields';
import { meetingKey } from '../../utils/meetingKeys';

export function SpendingPages({ page, totalInSection, data, month }) {
  const { spending, meta } = data;
  const monthLabel = month?.label || 'July';
  const year = meta?.year || 2026;

  if (page === 1) {
    const { overview, topCategories } = spending;
    const categoryRows = (topCategories ?? []).map((cat) => ({
      key: cat.name,
      cells: [cat.rank, cat.name, cat.amount],
    }));

    return (
      <div className="snapshot-page spending-page-1">
        <PageWithNotes pageId="spending-1">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Section 03 · Page ${page} of ${totalInSection}`}
            title="Spending Insights"
            subtitle={overview.subtitle}
            badge="By category"
          />
          <div className="spending-hero-row">
            <MetricKpiRow items={[
              {
                icon: '🛍️',
                label: 'July spending',
                value: spending.total,
                chip: { text: 'Excl. transfers', tone: 'blue' },
              },
              {
                icon: '📅',
                label: 'June spending',
                value: spending.priorMonth,
                chip: { text: 'Prior month', tone: 'purple' },
              },
            ]} />
            <MomChangeCard
              priorLabel="Month-over-month"
              priorValue=""
              changeLabel={overview.changeLabel}
            />
          </div>
          <div className="snapshot-grid-main spending-category-grid">
            <PanelCard title="Top categories" className="spending-table-panel" scrollLabel="Spending categories">
              <RankedTable
                columns={['#', 'Category', 'Amount']}
                rows={categoryRows}
              />
            </PanelCard>
            <aside className="snapshot-side">
              <StickyCard label="Likely unexpected" tone="focus">
                <EditableBulletList
                  storageKey={meetingKey(month.id, 'spending', 1, 'unexpected')}
                  seedItems={spending.unexpected}
                />
              </StickyCard>
            </aside>
          </div>
        </PageWithNotes>
      </div>
    );
  }

  const { changes, bigPurchases, questions } = spending;
  return (
    <div className="snapshot-page spending-page-2">
      <PageWithNotes pageId="spending-2">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Spending · Page ${page} of ${totalInSection}`}
          title="Changes & Purchases"
          subtitle="What shifted from June and which purchases stood out."
          badge="Final spending page"
          badgeVariant="final"
        />
        <div className="story-split-grid spending-page-2-grid">
          <PanelCard title="Largest changes from June" className="spending-changes-panel" scrollLabel="Category changes">
            <ChangeTable rows={changes} />
          </PanelCard>
          <div className="spending-page-2-side">
            <PanelCard title="Big purchases" scrollLabel="Big purchases" className="spending-purchases-panel">
              <DashedList items={bigPurchases} />
            </PanelCard>
            <PanelCard title="Discussion questions" scrollLabel="Discussion questions" className="spending-questions-panel">
              <EditableQuestions
                storageKey={meetingKey(month.id, 'spending', 2, 'questions')}
                seedQuestions={questions}
              />
            </PanelCard>
          </div>
        </div>
      </PageWithNotes>
    </div>
  );
}
