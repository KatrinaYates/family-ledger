import React from 'react';
import { NotebookKitPage as BaseNotebookKitPage } from './NotebookKitPage.jsx';
import { KitSample, KitVariant } from './KitComponents.jsx';
import { PieChart, TrendingGraph } from './ChartComponents.jsx';

const PIE_SAMPLE = [
  { label: 'Housing', value: 2410, valueLabel: '$2,410', tone: 'teal' },
  { label: 'Groceries', value: 892, valueLabel: '$892', tone: 'coral' },
  { label: 'Kids', value: 640, valueLabel: '$640', tone: 'gold' },
  { label: 'Other', value: 1158, valueLabel: '$1,158', tone: 'lavender' },
];

const TREND_SAMPLE = [
  { label: 'Mar', value: 124800, valueLabel: '$124.8k' },
  { label: 'Apr', value: 128100, valueLabel: '$128.1k' },
  { label: 'May', value: 132900, valueLabel: '$132.9k' },
  { label: 'Jun', value: 138400, valueLabel: '$138.4k' },
  { label: 'Jul', value: 142800, valueLabel: '$142.8k' },
];

function ChartsKitSample() {
  return (
    <KitSample
      name="PieChart · TrendingGraph"
      usage="PieChart: part-to-whole breakdowns with 2–6 categories. TrendingGraph: ordered month-over-month movement such as net worth, spending, debt, or savings."
      isNew
    >
      <KitVariant label="Pie chart · spending mix">
        <PieChart
          title="Where the money went"
          items={PIE_SAMPLE}
          centerLabel="Tracked"
          centerValue="$5,100"
        />
      </KitVariant>
      <KitVariant label="Trending graph · net worth">
        <TrendingGraph
          title="Net worth trend"
          points={TREND_SAMPLE}
          valueFormatter={(value) => `$${Math.abs(value / 1000).toFixed(1)}k`}
        />
      </KitVariant>
    </KitSample>
  );
}

/**
 * Extends the base Notebook Kit without duplicating its large catalog file.
 * The base page currently has no hooks, so its element tree can be cloned and
 * the chart sample inserted directly into the existing Metrics & charts section.
 */
export function NotebookKitPageWithCharts() {
  const basePage = BaseNotebookKitPage();
  const pageChildren = React.Children.toArray(basePage.props.children).map((child) => {
    if (child?.props?.id !== 'metrics') return child;

    return React.cloneElement(
      child,
      child.props,
      ...React.Children.toArray(child.props.children),
      <ChartsKitSample key="pie-trending-charts" />,
    );
  });

  return React.cloneElement(basePage, basePage.props, ...pageChildren);
}
