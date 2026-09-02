import React from 'react';
import { StickyCard } from '../content/NotebookPrimitives';
import { BarChart } from '../notebook/KitComponents';
import { SectionBlock } from '../notebook';

const GOAL_TONES = {
  'emergency-fund': 'safety',
  debt: 'focus',
  retirement: 'win',
  'kids-savings': 'family',
};

/** Source values sometimes combine current + target (e.g. "$413.93 / $1,000"). */
function primaryGoalAmount(current, target) {
  if (!current) return null;
  const text = String(current).trim();
  if (target && text.includes('/')) {
    return text.split('/')[0].trim();
  }
  return text;
}

/** @param {{ goal: object }} props */
function GoalCard({ goal }) {
  const tone = GOAL_TONES[goal.type] ?? 'ready';
  const {
    title,
    current,
    target,
    progressPercent,
    monthlyProgress,
    monthlyProgressLabel,
    secondaryValue,
    context,
    caveat,
    childSplits,
  } = goal;

  const primaryAmount = primaryGoalAmount(current, target);

  return (
    <StickyCard label={title} tone={tone} fill className="future-goal-card">
      {(primaryAmount || target || current) && (
        <div className="future-goal-metric-row">
          {primaryAmount && <strong className="future-goal-metric">{primaryAmount}</strong>}
          {target && <span className="future-goal-metric-sub">/ {target}</span>}
          {current && !target && goal.type === 'debt' && (
            <span className="future-goal-metric-sub">remaining</span>
          )}
        </div>
      )}

      {progressPercent != null && current && target && (
        <BarChart variant="solo" percent={progressPercent} fillTone="tone-teal" embedded />
      )}

      {monthlyProgress && (
        <p className="future-goal-detail">
          <strong>{monthlyProgress}</strong>
          {monthlyProgressLabel ? ` ${monthlyProgressLabel}` : ' this month'}
        </p>
      )}

      {secondaryValue && goal.type !== 'emergency-fund' && (
        <p className="future-goal-detail">
          <strong>{secondaryValue}</strong>
          {goal.type === 'retirement' && ' connected'}
          {goal.type === 'kids-savings' && ' protected'}
          {goal.type === 'emergency-fund' && ' to go'}
        </p>
      )}

      {secondaryValue && goal.type === 'emergency-fund' && (
        <p className="future-goal-detail">{secondaryValue} to go</p>
      )}

      {childSplits?.length > 0 && (
        <ul className="future-goal-splits">
          {childSplits.map((split) => (
            <li key={split}>{split}</li>
          ))}
        </ul>
      )}

      {context && (
        <p className="future-goal-handwritten">{context}</p>
      )}

      {caveat && (
        <p className="future-goal-note">{caveat}</p>
      )}
    </StickyCard>
  );
}

/** @param {{ goalsLabel?: string, goals?: Array<object> }} props */
export function FutureGoals({ goalsLabel, goals }) {
  if (!goals?.length) return null;

  return (
    <SectionBlock label={goalsLabel} className="future-goals">
      <div className="future-goals-grid">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </SectionBlock>
  );
}
