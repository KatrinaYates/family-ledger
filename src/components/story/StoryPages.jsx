import React from 'react';
import {
  DashedList,
  GroupedLists,
  MetricKpiRow,
  PanelCard,
  SectionPageHeader,
  StatPills,
  StickyCard,
  SummaryPanel,
  ScrollBody,
} from '../content/NotebookPrimitives';
import {
  EditableBulletList,
  PageWithNotes,
} from '../meeting/MeetingFields';
import { meetingKey } from '../../utils/meetingKeys';

export function StoryPages({ page, totalInSection, data, month }) {
  const { story, meta } = data;
  const monthLabel = month?.label || meta?.month || 'This month';
  const year = meta?.year || 2026;

  if (page === 1) {
    const { overview, income } = story;
    return (
      <div className="snapshot-page story-page-1">
        <PageWithNotes pageId="story-1">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Section 02 · Page ${page} of ${totalInSection}`}
            title="Monthly Story"
            subtitle={overview.subtitle}
            badge="Income focus"
          />
          <MetricKpiRow items={overview.kpis} />
          <PanelCard
            title="Income breakdown"
            className="story-income-panel story-income-full"
            scrollLabel="Income sources"
          >
            <GroupedLists groups={income.groups} />
          </PanelCard>
        </PageWithNotes>
      </div>
    );
  }

  if (page === 2) {
    const { billsPage, bills, lifestyle } = story;
    return (
      <div className="snapshot-page story-page-2">
        <PageWithNotes pageId="story-2">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Monthly Story · Page ${page} of ${totalInSection}`}
            title="Bills & Lifestyle"
            subtitle={billsPage.subtitle}
            badge="Story continued"
            badgeVariant="continued"
          />
          <div className="story-split-grid">
            <PanelCard
              title="Bills and housing"
              className="story-bills-panel"
              scrollLabel="Bills and housing"
            >
              <DashedList items={bills.items} />
            </PanelCard>
            <PanelCard
              title="Lifestyle spending"
              className="story-lifestyle-panel"
              scrollLabel="Lifestyle categories"
            >
              <DashedList items={lifestyle.items} />
            </PanelCard>
          </div>
        </PageWithNotes>
      </div>
    );
  }

  const { endingPage, savings, investments, debtPayments } = story;
  const hasUnclearSavings = Array.isArray(savings.missing) && savings.missing.length > 0;

  return (
    <div className="snapshot-page story-page-3">
      <PageWithNotes pageId="story-3">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Monthly Story · Page ${page} of ${totalInSection}`}
          title="Ending Position"
          subtitle={endingPage.subtitle}
          badge="Final story page"
          badgeVariant="final"
        />
        <StatPills items={endingPage.endingPills} />
        <div className="snapshot-grid-main story-ending-main">
          <SummaryPanel title={story.explanation.title} rows={endingPage.explanationRows} />
          <aside className="snapshot-side">
            <StickyCard label={`${monthLabel} retirement`} tone="win">
              <p><strong>{investments.monthContributions ?? investments.julyContributions}</strong> contributed across employee, match, profit-sharing, and after-tax.</p>
            </StickyCard>
            {hasUnclearSavings && (
              <StickyCard label="Still unclear" tone="missing">
                <ScrollBody label="Unclear savings items" className="scroll-body-compact">
                  <EditableBulletList
                    storageKey={meetingKey(month.id, 'story', 3, 'unclear-savings')}
                    seedItems={savings.missing}
                  />
                </ScrollBody>
              </StickyCard>
            )}
            <StickyCard label="Debt payments" tone="default">
              <ScrollBody label="Debt payments" className="scroll-body-compact">
                <DashedList items={debtPayments.items} />
              </ScrollBody>
            </StickyCard>
          </aside>
        </div>
      </PageWithNotes>
    </div>
  );
}
