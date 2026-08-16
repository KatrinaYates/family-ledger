import React from 'react';
import { PanelSurface, PieChart, SectionBlock } from '../notebook';

const PIE_TONES = ['teal', 'coral', 'gold', 'lavender', 'green', 'blue'];

function buildPieItems(categories) {
  const items = categories?.items ?? [];

  if (categories?.canPercent) {
    const slices = items
      .map((item, index) => ({
        label: item.name,
        value: Number.isFinite(item.percent) ? item.percent : null,
        valueLabel: item.amount,
        tone: PIE_TONES[index % PIE_TONES.length],
      }))
      .filter((item) => item.value != null && item.value > 0);

    const shownPercent = slices.reduce((sum, item) => sum + item.value, 0);
    const remainingPercent = Math.max(0, 100 - shownPercent);

    if (remainingPercent > 1) {
      slices.push({
        label: 'Remaining spending',
        value: remainingPercent,
        valueLabel: `${remainingPercent}% of total`,
        tone: 'blue',
      });
    }

    return slices;
  }

  return items
    .map((item, index) => ({
      label: item.name,
      value: item.amountNum,
      valueLabel: item.amount,
      tone: PIE_TONES[index % PIE_TONES.length],
    }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0);
}

export function SpendingCategoryBars({ categories }) {
  const pieItems = buildPieItems(categories);

  return (
    <SectionBlock label="Where the Money Went" className="spending-categories">
      {!categories?.hasItems ? (
        <PanelSurface>
          <p className="panel-note">{categories?.emptyMessage}</p>
        </PanelSurface>
      ) : (
        <PieChart
          className="spending-category-chart"
          items={pieItems}
          centerLabel="Spending mix"
        />
      )}
    </SectionBlock>
  );
}
