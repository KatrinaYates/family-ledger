import React from 'react';
import {
  MetricKpiRow,
  NOTEBOOK_SYMBOLS,
  StatPills,
  StickyCard,
} from '../content/NotebookPrimitives';
import { CardGrid, PanelSurface, SectionBlock } from '../notebook';
import { PersistedEditableBulletList } from '../meeting/MeetingFields';
import { sectionFieldKey } from '../../utils/meetingKeys';
import {
  buildSnapshotEndingPosition,
  buildSnapshotGlanceKpis,
} from '../../utils/monthSnapshotLayout';
import { SectionPageShell } from './SectionPageShell';

const GLANCE_KPI_SYMBOLS = {
  Income: NOTEBOOK_SYMBOLS.cash,
  Spending: NOTEBOOK_SYMBOLS.focus,
  'Future progress': NOTEBOOK_SYMBOLS.win,
};

function hasReviewValue(value) {
  return value != null && String(value).trim() !== '' && String(value).trim() !== '—';
}

function mapGlanceKpis(kpis) {
  return kpis
    .filter((kpi) => hasReviewValue(kpi.value))
    .map((kpi) => ({
      ...kpi,
      icon: GLANCE_KPI_SYMBOLS[kpi.label] ?? NOTEBOOK_SYMBOLS.neutral,
    }));
}

export function MonthOverviewPage({ data, month, section }) {
  const { month: monthView } = data;
  const {
    kpis,
    futureProgress,
    endingPosition,
    endingPositionLabel,
    howItWent,
    atAGlanceLabel,
    humanContextLabel,
  } = monthView;

  const glanceKpis = mapGlanceKpis(buildSnapshotGlanceKpis(kpis, futureProgress));
  const glanceEndingPosition = buildSnapshotEndingPosition(endingPosition);
  const monthLabel = month.label || data.meta?.month || 'this month';

  const showGlance = glanceKpis.length > 0 || glanceEndingPosition.length > 0;
  const whatMadeDifferent = data.spending?.overview?.interpretation
    || howItWent.whatMadeDifferent;
  const priorityCards = [
    howItWent.biggestWin && {
      key: 'win',
      label: 'Biggest win',
      tone: 'win',
      body: howItWent.biggestWin,
    },
    howItWent.needsAttention && {
      key: 'focus',
      label: 'Needs attention',
      tone: 'focus',
      body: howItWent.needsAttention,
    },
    whatMadeDifferent && {
      key: 'context',
      label: `What made ${monthLabel} different`,
      tone: 'context',
      body: whatMadeDifferent,
    },
  ].filter(Boolean);
  const showHowItWent = Boolean(howItWent.pulse || priorityCards.length);

  return (
    <SectionPageShell
      sectionId="month"
      section={section}
      month={month}
      data={data}
      subtitle={monthView.subtitle}
    >
      <div className="month-snapshot-page">
        {showGlance && (
          <SectionBlock label={atAGlanceLabel} className="month-snapshot-glance">
            {glanceKpis.length > 0 && (
              <MetricKpiRow items={glanceKpis} className="month-snapshot-kpi-row" />
            )}
            {glanceEndingPosition.length > 0 && (
              <StatPills
                label={endingPositionLabel}
                items={glanceEndingPosition}
                className="month-snapshot-ending-position"
              />
            )}
          </SectionBlock>
        )}

        {showHowItWent && (
          <SectionBlock label={howItWent.heading} className="month-snapshot-how">
            {howItWent.pulse && (
              <StickyCard label="Overall financial pulse" tone="ready" fill layout="editorial">
                <p>{howItWent.pulse}</p>
              </StickyCard>
            )}
            {priorityCards.length > 0 && (
              <CardGrid columns={3} className="month-snapshot-priority-grid">
                {priorityCards.map((card) => (
                  <StickyCard
                    key={card.key}
                    variant="priority"
                    label={card.label}
                    tone={card.tone}
                    fill
                  >
                    {card.body}
                  </StickyCard>
                ))}
              </CardGrid>
            )}
          </SectionBlock>
        )}

        <SectionBlock label={humanContextLabel} className="month-snapshot-human">
          <PanelSurface>
            <p className="panel-note month-snapshot-human-hint">
              Things the data cannot automatically understand — reimbursements, guests, intentional choices, life events.
            </p>
            <PersistedEditableBulletList
              storageKey={sectionFieldKey(month.id, 'month', 'human-context')}
              seedItems={[]}
            />
          </PanelSurface>
        </SectionBlock>
      </div>
    </SectionPageShell>
  );
}
