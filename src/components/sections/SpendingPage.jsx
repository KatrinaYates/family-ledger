import React from 'react';
import { SectionPageShell } from './SectionPageShell';
import { CardGrid } from '../notebook';
import { SpendingOverview } from '../spending/SpendingOverview';
import { SpendingCategoryBars } from '../spending/SpendingCategoryBars';
import { SpendingChangeSummary } from '../spending/SpendingChangeSummary';
import { SpendingWatch } from '../spending/SpendingWatch';
import { NotableSpending } from '../spending/NotableSpending';
import { SpendingTakeaway } from '../spending/SpendingTakeaway';

export function SpendingPage({ data, month, section }) {
  const { spending } = data;

  return (
    <SectionPageShell
      sectionId="spending"
      section={section}
      month={month}
      data={data}
      subtitle={spending.subtitle}
    >
      <div className="spending-page">
        <SpendingOverview overview={spending.overview} />

        <CardGrid layout="mainSidebar" className="spending-detail-row">
          <SpendingCategoryBars categories={spending.categories} />
          <SpendingChangeSummary whatChanged={spending.whatChanged} />
        </CardGrid>

        <CardGrid layout="mainSidebar" className="spending-secondary-row">
          <SpendingWatch spendingWatch={spending.spendingWatch} monthId={month.id} />
          <div className="spending-side-stack">
            <NotableSpending notableSpending={spending.notableSpending} monthId={month.id} />
            <SpendingTakeaway monthId={month.id} />
          </div>
        </CardGrid>
      </div>
    </SectionPageShell>
  );
}
