import React from 'react';
import {
  ChangeTable,
  DashedList,
  MetricKpiRow,
  MomChangeCard,
  PanelCard,
  RankedTable,
  StickyCard,
} from '../content/NotebookPrimitives';
import {
  EditableBulletList,
  EditableQuestions,
} from '../meeting/MeetingFields';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';

export function SpendingPage({ data, month, section }) {
  const { spending } = data;
  const { overview, topCategories, changes, bigPurchases, questions, changesPage, comparisonLabels } = spending;
  const { priorLabel, currentLabel } = changesPage?.comparisonLabels ?? comparisonLabels ?? {};

  const categoryRows = (topCategories ?? []).map((cat) => ({
    key: cat.name,
    cells: [cat.rank, cat.name, cat.amount],
  }));

  return (
    <SectionPageShell sectionId="spending" section={section} month={month} data={data} subtitle={overview?.subtitle}>
      <div className="spending-hero-row">
        <MetricKpiRow items={[
          {
            icon: '🛍️',
            label: `${data.meta?.month || month.label} spending`,
            value: spending.total,
            chip: { text: 'Excl. transfers', tone: 'blue' },
          },
          {
            icon: '📅',
            label: 'Prior month spending',
            value: spending.priorMonth,
            chip: { text: 'Prior month', tone: 'purple' },
          },
        ]} />
        <MomChangeCard
          priorLabel="Month-over-month"
          priorValue=""
          changeLabel={overview?.changeLabel}
        />
      </div>
      <div className="spending-top-row">
        <PanelCard title="Top categories" className="spending-categories-panel">
          <RankedTable
            columns={['#', 'Category', 'Amount']}
            rows={categoryRows}
          />
        </PanelCard>
        <aside className="snapshot-side spending-unexpected-side">
          <StickyCard label="Likely unexpected" tone="focus">
            <EditableBulletList
              storageKey={sectionFieldKey(month.id, 'spending', 'unexpected')}
              seedItems={spending.unexpected}
            />
          </StickyCard>
        </aside>
      </div>
      <div className="story-split-grid spending-page-2-grid">
        <PanelCard title="Largest changes from prior month" className="spending-changes-panel">
          <ChangeTable
            rows={changes}
            priorLabel={priorLabel}
            currentLabel={currentLabel}
          />
        </PanelCard>
        <div className="spending-page-2-side">
          <PanelCard title="Big purchases">
            <DashedList items={bigPurchases} />
          </PanelCard>
          <PanelCard title="Discussion questions">
            <EditableQuestions
              storageKey={sectionFieldKey(month.id, 'spending', 'questions')}
              seedQuestions={questions}
            />
          </PanelCard>
        </div>
      </div>
    </SectionPageShell>
  );
}
