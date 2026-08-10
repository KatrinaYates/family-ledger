import React from 'react';
import {
  EditableBulletList,
} from '../meeting/MeetingFields';
import {
  MetricKpiRow,
  PanelCard,
  StickyCard,
  SummaryPanel,
} from '../content/NotebookPrimitives';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';

export function MonthOverviewPage({ data, month, section }) {
  const { month: monthView } = data;
  const { whatChanged, contextSummary, kpis, pulseInsight } = monthView;

  const concernRows = (whatChanged.concerns ?? []).map((row) => ({
    icon: row.icon ?? '💡',
    title: row.title,
    text: row.text,
  }));

  return (
    <SectionPageShell sectionId="month" section={section} month={month} data={data} subtitle={monthView.subtitle}>
      {kpis.length > 0 && <MetricKpiRow items={kpis} />}
      <div className="snapshot-grid-main">
        <SummaryPanel
          title="What changed"
          rows={[
            ...(whatChanged.wins ? [{ icon: '🏆', title: 'Biggest win', text: whatChanged.wins }] : []),
            ...(whatChanged.shifts ? [{ icon: '🎯', title: 'Biggest focus', text: whatChanged.shifts }] : []),
            ...concernRows,
          ]}
        />
        <aside className="snapshot-side">
          {contextSummary.closing && (
            <StickyCard label="Month in one line" tone="win">
              <p>{contextSummary.closing}</p>
            </StickyCard>
          )}
          {contextSummary.rows?.length > 0 && (
            <PanelCard title="What explains the month">
              <SummaryPanel rows={contextSummary.rows} />
            </PanelCard>
          )}
          <StickyCard label="Human context" tone="default">
            <EditableBulletList
              storageKey={sectionFieldKey(month.id, 'month', 'human-context')}
              seedItems={[]}
            />
          </StickyCard>
        </aside>
      </div>
      {pulseInsight && (
        <p className="panel-note month-pulse-insight">{pulseInsight}</p>
      )}
    </SectionPageShell>
  );
}
