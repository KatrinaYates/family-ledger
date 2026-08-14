import React from 'react';
import {
  PanelCard,
  PromptField,
  QuestionList,
  StickyCard,
} from '../content/NotebookPrimitives';
import { CardGrid, PanelSurface, SectionBlock } from '../notebook';
import { EditableDecisionList } from '../meeting/MeetingFields';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import {
  cfoDecisionKey,
  cfoDecisionOutcomeKey,
  sectionFieldKey,
} from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';
import './reviewPages.css';

function MeetingUpdate({ update }) {
  if (!update?.metrics?.length) return null;

  return (
    <SectionBlock label="Since Month-End" className="decisions-current-update">
      <PanelSurface>
        {update.note && <p className="panel-note">{update.note}</p>}
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
            Latest connected debt: {update.debtBreakdown.creditCards} credit cards + {update.debtBreakdown.loans} loans.
          </p>
        )}
        {update.coverageNote && <p className="panel-note">{update.coverageNote}</p>}
      </PanelSurface>
    </SectionBlock>
  );
}

function DecisionCard({ monthId, outcome }) {
  return (
    <PanelSurface className="decisions-commitment-card">
      <span className="panel-module__label">Priority {outcome.number}</span>
      <h3 className="decisions-outcome-title">{outcome.title}</h3>
      {outcome.why && <p className="panel-note">{outcome.why}</p>}
      <EditableDecisionList
        storageKey={cfoDecisionKey(monthId, outcome.number)}
        outcomeStorageKey={cfoDecisionOutcomeKey(monthId, outcome.number)}
        seedDecisions={outcome.options ?? []}
      />
    </PanelSurface>
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
      badge="Decide together"
      badgeVariant="talk"
    >
      <div
        className="decisions-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        <MeetingUpdate update={decisions.currentUpdate} />

        {decisions.cfoOutcomes?.length > 0 && (
          <SectionBlock label="What Are We Deciding?" className="decisions-cfo-outcomes">
            <p className="panel-note decisions-section-intro">
              The CFO page gave us recommendations. This is where we turn them into our own decisions.
            </p>
            <div className="decisions-commitment-stack">
              {decisions.cfoOutcomes.map((outcome) => (
                <DecisionCard key={outcome.number} monthId={month.id} outcome={outcome} />
              ))}
            </div>
          </SectionBlock>
        )}

        <SectionBlock label="What We Want to Remember" className="decisions-context">
          <CardGrid columns={3} className="meeting-prompt-grid decisions-prompt-grid">
            <PromptField
              label="What surprised us?"
              value={surprisedField.value}
              onChange={surprisedField.setValue}
            />
            <PromptField
              label="What felt stressful?"
              value={stressfulField.value}
              onChange={stressfulField.setValue}
            />
            <PromptField
              label="Parking lot"
              value={parkingLotField.value}
              onChange={parkingLotField.setValue}
            />
          </CardGrid>
        </SectionBlock>

        {decisions.questions?.length > 0 && (
          <SectionBlock label="Questions Still Open" className="decisions-open-questions">
            <PanelCard>
              <QuestionList
                editable
                storageKey={sectionFieldKey(month.id, 'decisions', 'questions')}
                items={decisions.questions}
              />
            </PanelCard>
          </SectionBlock>
        )}

        {decisions.insight && (
          <StickyCard label="Meeting lens" tone="context" fill>
            <p>{decisions.insight}</p>
          </StickyCard>
        )}
      </div>
    </SectionPageShell>
  );
}
