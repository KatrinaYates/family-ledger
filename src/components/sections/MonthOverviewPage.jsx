import React from 'react';
import { EditableBulletList } from '../meeting/MeetingFields';
import { MetricKpiRow } from '../content/NotebookPrimitives';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';
import { FutureProgressKpi } from './FutureProgressKpi';

function PriorityCard({ label, tone, children }) {
  if (!children?.trim()) return null;
  return (
    <article className={`month-snapshot-priority-card tone-${tone}`}>
      <h3 className="month-snapshot-priority-label">{label}</h3>
      <p className="month-snapshot-priority-text">{children}</p>
    </article>
  );
}

function EndingPositionStrip({ label, items }) {
  if (!items?.length) return null;
  return (
    <div className="month-snapshot-ending-position" aria-label={label}>
      <div className="month-snapshot-ending-position-label">{label}</div>
      <div className="stat-pills month-snapshot-ending-position-pills">
        {items.map((item) => (
          <div key={item.label} className="stat-pill paper-surface">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
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

  const showGlance = kpis.length > 0 || futureProgress;

  return (
    <SectionPageShell
      sectionId="month"
      section={section}
      month={month}
      data={data}
      subtitle={monthView.subtitle}
    >
      {showGlance && (
        <section className="month-snapshot-glance" aria-label={atAGlanceLabel}>
          <h2 className="month-snapshot-section-heading">{atAGlanceLabel}</h2>
          <div className="month-snapshot-kpi-grid">
            {kpis.length > 0 && (
              <MetricKpiRow items={kpis} className="month-snapshot-kpi-row" />
            )}
            <FutureProgressKpi futureProgress={futureProgress} />
          </div>
          <EndingPositionStrip label={endingPositionLabel} items={endingPosition} />
        </section>
      )}

      {(howItWent.pulse || howItWent.biggestWin || howItWent.needsAttention || howItWent.whatMadeDifferent) && (
        <section className="month-snapshot-how" aria-label={howItWent.heading}>
          <h2 className="month-snapshot-section-heading">{howItWent.heading}</h2>
          {howItWent.pulse && (
            <div className="month-snapshot-pulse insight-banner">
              <span className="month-snapshot-pulse-label">Overall financial pulse</span>
              <p>{howItWent.pulse}</p>
            </div>
          )}
          <div className="month-snapshot-priority-grid">
            <PriorityCard label="Biggest win" tone="win">
              {howItWent.biggestWin}
            </PriorityCard>
            <PriorityCard label="Needs attention" tone="focus">
              {howItWent.needsAttention}
            </PriorityCard>
            <PriorityCard label={`What made ${month.label || data.meta?.month || 'this month'} different`} tone="context">
              {howItWent.whatMadeDifferent}
            </PriorityCard>
          </div>
        </section>
      )}

      <section className="month-snapshot-human paper-surface">
        <h2 className="month-snapshot-section-heading">{humanContextLabel}</h2>
        <p className="panel-note month-snapshot-human-hint">
          Things the data cannot automatically understand — reimbursements, guests, intentional choices, life events.
        </p>
        <EditableBulletList
          storageKey={sectionFieldKey(month.id, 'month', 'human-context')}
          seedItems={[]}
        />
      </section>
    </SectionPageShell>
  );
}
