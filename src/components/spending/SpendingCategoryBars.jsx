import React from 'react';
import { BarChart, PanelSurface, SectionBlock } from '../notebook';

export function SpendingCategoryBars({ categories }) {
  return (
    <SectionBlock label="Where the Money Went" className="spending-categories">
      {!categories?.hasItems ? (
        <PanelSurface>
          <p className="panel-note">{categories?.emptyMessage}</p>
        </PanelSurface>
      ) : (
        <BarChart
          className="spending-category-chart"
          variant="group"
          items={categories.items}
          showPercent={categories.canPercent}
        />
      )}
    </SectionBlock>
  );
}
