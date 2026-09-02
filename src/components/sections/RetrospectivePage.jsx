import React, { useMemo } from 'react';
import {
  PanelHeading,
  PromptField,
  ScrollBody,
  StickyCard,
} from '../content/NotebookPrimitives';
import { CardGrid, CollapsiblePanel, PanelSurface, SectionBlock } from '../notebook';
import { ActionPlan } from '../actions/ActionPlan';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';
import { SectionPageShell } from './SectionPageShell';

const EMPTY_ACTION_ITEMS = [];

const RETROSPECTIVE_PROMPTS = [
  { field: 'worked-well', label: 'What worked well?' },
  { field: 'did-not-work', label: 'What did not work for us?' },
  { field: 'try-differently', label: 'What should we try differently next month?' },
  { field: 'keep-doing', label: 'What do we want to keep doing?' },
];

function RetrospectivePrompt({ monthId, field, label }) {
  const notes = useMeetingNotes(sectionFieldKey(monthId, 'retrospective', field));
  return (
    <PromptField
      label={label}
      value={notes.value}
      onChange={notes.setValue}
      readOnly={notes.isLocked}
      saveError={notes.saveError}
      saving={notes.saving}
    />
  );
}

function QuestionResponse({ monthId, question }) {
  if (question.allowResponse === false) {
    return (
      <div className="retrospective-question-item retrospective-question-item--read-only">
        {question.context && (
          <p className="panel-note retrospective-question-context">{question.context}</p>
        )}
        <p className="panel-note retrospective-question-read-only">
          <strong>{question.question}</strong>
        </p>
      </div>
    );
  }

  const notes = useMeetingNotes(sectionFieldKey(monthId, 'retrospective', `question-${question.id}`));

  return (
    <div className="retrospective-question-item">
      {question.context && (
        <p className="panel-note retrospective-question-context">{question.context}</p>
      )}
      <PromptField
        label={question.question}
        value={notes.value}
        onChange={notes.setValue}
        readOnly={notes.isLocked}
        saveError={notes.saveError}
        saving={notes.saving}
      />
    </div>
  );
}

export function RetrospectivePage({ data, month, section }) {
  const { retrospective, actions } = data;
  const actionItems = useMemo(
    () => actions?.items ?? EMPTY_ACTION_ITEMS,
    [actions?.items],
  );
  const useCappedScroll = actionItems.length >= 10;
  const questions = retrospective?.questionsToConsider ?? [];
  const hasGenericFallback = questions.some((item) => item.isGenericFallback);
  const responseCount = questions.filter((item) => item.allowResponse !== false).length;

  return (
    <SectionPageShell
      sectionId="retrospective"
      section={section}
      month={month}
      data={data}
      subtitle={retrospective?.subtitle}
    >
      <div
        className="retrospective-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        <SectionBlock label="Look Back" className="retrospective-prompts">
          <CardGrid columns={2} className="retrospective-prompt-grid">
            {RETROSPECTIVE_PROMPTS.map((prompt) => (
              <RetrospectivePrompt
                key={prompt.field}
                monthId={month.id}
                field={prompt.field}
                label={prompt.label}
              />
            ))}
          </CardGrid>
        </SectionBlock>

        <SectionBlock label="What We're Doing Next" className="retrospective-actions">
          {actions?.monthlyFocus && (
            <StickyCard label="This month's focus" tone="context" fill>
              <p>{actions.monthlyFocus}</p>
            </StickyCard>
          )}
          <PanelSurface className="panel-stack actions-table-panel action-plan-table-surface">
            <PanelHeading title="Action plan" />
            {useCappedScroll ? (
              <ScrollBody label="Action items" capped>
                <ActionPlan seedRows={actionItems} />
              </ScrollBody>
            ) : (
              <div className="panel-body">
                <ActionPlan seedRows={actionItems} />
              </div>
            )}
          </PanelSurface>
        </SectionBlock>

        {questions.length > 0 && (
          <SectionBlock label="Dig Deeper" className="retrospective-questions">
            <CollapsiblePanel
              title="Questions to Consider"
              count={responseCount}
              defaultOpen={false}
            >
              {hasGenericFallback && (
                <p className="panel-note retrospective-generic-note">
                  These starter questions are not based on this month&apos;s specific financial analysis.
                </p>
              )}
              <CardGrid columns={1} className="retrospective-question-grid">
                {questions.map((question) => (
                  <QuestionResponse key={question.id} monthId={month.id} question={question} />
                ))}
              </CardGrid>
            </CollapsiblePanel>
          </SectionBlock>
        )}
      </div>
    </SectionPageShell>
  );
}
