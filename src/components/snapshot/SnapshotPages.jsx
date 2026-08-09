import React from 'react';
import {
  AllocationTable,
  ContributionBlock,
  DebtGroups,
  DashedList,
  MetricKpiRow,
  PanelCard,
  PanelHeading,
  SectionPageHeader,
  StickyCard,
  SummaryPanel,
  WarningBanner,
} from '../content/NotebookPrimitives';
import {
  EditableChecklist,
  MeetingEmergencyBand,
  PageWithNotes,
} from '../meeting/MeetingFields';
import { meetingKey } from '../../utils/meetingKeys';

export function SnapshotPages({ page, totalInSection, data, month }) {
  const { snapshot, meta } = data;
  const monthLabel = month?.label || meta?.month || 'This month';
  const year = meta?.year || 2026;

  if (page === 1) {
    const { overview } = snapshot;
    return (
      <div className="snapshot-page snapshot-page-1">
        <PageWithNotes pageId="snapshot-1">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Section 01 · Page ${page} of ${totalInSection}`}
            title="Financial Snapshot"
            subtitle={overview.subtitle}
            badge="Draft · needs review"
            badgeVariant="draft"
          />
          <MetricKpiRow items={overview.kpis} />
          <div className="snapshot-grid-main">
            <SummaryPanel
              title="What the headline numbers mean"
              rows={overview.summaryRows}
              scrollLabel="Headline number summaries"
            />
            <aside className="snapshot-side">
              <StickyCard label="Biggest win" tone="win">
                <p>{overview.biggestWin}</p>
              </StickyCard>
              <StickyCard label="Biggest focus" tone="focus">
                <p>{overview.biggestFocus}</p>
              </StickyCard>
              <StickyCard label="Missing before lock" tone="missing">
                <EditableChecklist
                  storageKey={meetingKey(month.id, 'snapshot', 1, 'missing-before-lock')}
                  seedItems={overview.missingBeforeLock}
                />
              </StickyCard>
            </aside>
          </div>
        </PageWithNotes>
      </div>
    );
  }

  if (page === 2) {
    const { cash, retirement, emergencyFund } = snapshot;
    const cashSummary = [
      {
        icon: '💸',
        label: 'Available household cash',
        value: cash.availableTotal,
        chip: { text: 'Spendable', tone: 'green' },
      },
      {
        icon: '🔒',
        label: 'Protected cash',
        value: cash.protectedTotal,
        chip: { text: 'Bills · kids · savings', tone: 'yellow' },
      },
      {
        icon: '🌱',
        label: 'Retirement',
        value: retirement.totalExact || retirement.total,
        chip: { text: retirement.protectionLabel, tone: 'purple' },
      },
    ];
    if (cash.unclassifiedTotal) {
      cashSummary.push({
        icon: '❓',
        label: 'Needs classification',
        value: cash.unclassifiedTotal,
        chip: { text: 'Review', tone: 'watch' },
      });
    }

    return (
      <div className="snapshot-page snapshot-page-2">
        <PageWithNotes pageId="snapshot-2">
          <SectionPageHeader
            eyebrow={`${monthLabel} ${year} · Financial Snapshot · Page ${page} of ${totalInSection}`}
            title="Cash & Retirement"
            subtitle="What was truly available at month-end versus money already protected for bills, kids, savings, and retirement."
            badge="Snapshot continued"
            badgeVariant="continued"
          />
          <MetricKpiRow items={cashSummary} />
          <div className="snapshot-cash-grid">
            <PanelCard
              title="Cash allocation"
              total={cash.totalExact || cash.total}
              scrollLabel="Cash accounts"
            >
              <AllocationTable rows={cash.accounts} />
            </PanelCard>
            <PanelCard
              title="Retirement accounts"
              total={retirement.totalExact || retirement.total}
              scrollLabel="Retirement accounts"
              footer={(
                <>
                  <ContributionBlock
                    label={`${monthLabel} contributions recorded`}
                    value={retirement.monthContributions}
                    note={retirement.contributionNote}
                  />
                  {retirement.note && <WarningBanner>{retirement.note}</WarningBanner>}
                </>
              )}
            >
              <DashedList items={retirement.accountsSorted || retirement.accounts} />
            </PanelCard>
            <MeetingEmergencyBand
              storageKey={meetingKey(month.id, 'snapshot', 2, 'emergency-checks')}
              label="Emergency fund status"
              title={emergencyFund.headline}
              description={emergencyFund.description}
              checks={emergencyFund.checks}
            />
          </div>
        </PageWithNotes>
      </div>
    );
  }

  const { debt, debtPage } = snapshot;
  return (
    <div className="snapshot-page snapshot-page-3">
      <PageWithNotes pageId="snapshot-3">
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Financial Snapshot · Page ${page} of ${totalInSection}`}
          title="Debt & Status"
          subtitle={debtPage.subtitle}
          badge="Final snapshot page"
          badgeVariant="final"
        />
        <div className="snapshot-debt-grid snapshot-debt-grid-compact">
          <section className="paper-surface snapshot-large-panel panel-stack debt-detail-panel">
            <PanelHeading title="Connected debt detail" total={debt.total} />
            <div className="panel-body debt-detail-body">
              <DebtGroups loans={debt.loans} creditCards={debt.creditCards} large />
            </div>
            <div className="panel-footer">
              <WarningBanner>{debt.insight}</WarningBanner>
            </div>
          </section>
          <aside className="snapshot-final-side">
            <StickyCard label="Overall status" tone="default">
              <h2>{debtPage.overallStatus.title}</h2>
              <p>{debtPage.overallStatus.text}</p>
            </StickyCard>
            <StickyCard label="Financial health score" tone="no-score">
              <h2>{debtPage.healthScore.title}</h2>
              <p>{debtPage.healthScore.text}</p>
            </StickyCard>
            <StickyCard label="Ready to lock when" tone="ready">
              <EditableChecklist
                storageKey={meetingKey(month.id, 'snapshot', 3, 'ready-to-lock')}
                seedItems={debtPage.readyToLock}
              />
            </StickyCard>
          </aside>
        </div>
      </PageWithNotes>
    </div>
  );
}
