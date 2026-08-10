import React from 'react';
import {
  PanelCard,
  PromptField,
} from '../content/NotebookPrimitives';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { cfoDecisionOutcomeKey, sectionFieldKey } from '../../utils/meetingKeys';
import { EditableQuestions } from '../meeting/MeetingFields';
import { SectionPageShell } from './SectionPageShell';

function MeetingUpdate({ update }) {
  if (!update?.metrics?.length) return null;

  return (
    <PanelCard title={update.label || 'Meeting Update'} className="meeting-update-card">
      <p className="panel-note">{update.note}</p>
      <div className="meeting-update-list">
        {update.metrics.map((metric) => (
          <p className="panel-note" key={metric.label}>
            <strong>{metric.label}</strong>: {metric.monthEnd} at month-end → {metric.current} latest connected{' '}
            <span>({metric.change})</span>
          </p>
        ))}
      </div>
      {update.debtBreakdown && (
        <p className="panel-note">
          Latest connected debt detail: {update.debtBreakdown.creditCards} credit cards + {update.debtBreakdown.loans} loans.
        </p>
      )}
      {update.coverageNote && <p className="panel-note">{update.coverageNote}</p>}
    </PanelCard>
  );
}

function CfoOutcomeReadout({ monthId, outcome }) {
  const { value } = useMeetingNotes(cfoDecisionOutcomeKey(monthId, outcome.number));

  return (
    <article className="decisions-outcome-card paper-surface">
      <h3 className="decisions-outcome-title">Priority {outcome.number}: {outcome.title}</h3>
      {outcome.why && <p className="panel-note">{outcome.why}</p>}
      <p className="panel-note decisions-outcome-text">
        {value?.trim() ? value : 'No decision recorded yet — fill in on the CFO section.'}
      </p>
    </article>
  );
}

export function DecisionsPage({ data, month, section }) {
  const { decisions } = data;

  const surprisedField = useMeetingNotes(sectionFieldKey(month.id, 'decisions', 'surprised'));
  const stressfulField = useMeetingNotes(sectionFieldKey(month.id, 'decisions', 'stressful'));
  const parkingLotField = useMeetingNotes(sectionFieldKey(month.id, 'decisions', 'parking-lot'));

  return (
    <SectionPageShell
      sectionId="decisions"
      section={section}
      month={month}
      data={data}
      subtitle={decisions.subtitle}
      badge="Talk together"
      badgeVariant="talk"
    >
      <MeetingUpdate update={decisions.currentUpdate} />
      {decisions.cfoOutcomes?.length > 0 && (
        <section className="decisions-cfo-outcomes" aria-label="CFO decisions">
          <h2 className="section-inline-heading">From CFO recommendations</h2>
          {decisions.cfoOutcomes.map((outcome) => (
            <CfoOutcomeReadout key={outcome.number} monthId={month.id} outcome={outcome} />
          ))}
        </section>
      )}
      <div className="meeting-prompt-grid decisions-prompt-grid">
        <PromptField label="What surprised us?" value={surprisedField.value} onChange={surprisedField.setValue} />
        <PromptField label="What felt stressful?" value={stressfulField.value} onChange={stressfulField.setValue} />
        <PromptField label="Parking lot" value={parkingLotField.value} onChange={parkingLotField.setValue} />
      </div>
      <PanelCard title="Open questions">
        <EditableQuestions
          storageKey={sectionFieldKey(month.id, 'decisions', 'questions')}
          seedQuestions={decisions.questions}
        />
      </PanelCard>
      {decisions.insight && (
        <PanelCard title="Meeting insight">
          <p className="panel-note">{decisions.insight}</p>
        </PanelCard>
      )}
    </SectionPageShell>
  );
}
