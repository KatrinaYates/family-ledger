import React from 'react';
import { SectionPageShell } from './SectionPageShell';
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
        <div className="spending-split-row">
          <SpendingCategoryBars categories={spending.categories} />
          <SpendingChangeSummary whatChanged={spending.whatChanged} />
        </div>
        <div className="spending-split-row">
          <SpendingWatch spendingWatch={spending.spendingWatch} monthId={month.id} />
          <NotableSpending notableSpending={spending.notableSpending} monthId={month.id} />
        </div>
        <SpendingTakeaway monthId={month.id} />
      </div>
    </SectionPageShell>
  );
}
