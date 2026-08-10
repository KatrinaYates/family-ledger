import React from 'react';

/** @param {{ percent: number, label?: string }} props */
function GoalProgressBar({ percent, label }) {
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="spending-category-bar-row future-goal-progress"
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${safePercent}% progress`}
    >
      <div className="spending-category-bar-meta">
        <span className="spending-category-bar-name">Progress</span>
        <span className="spending-category-bar-percent">{safePercent}%</span>
      </div>
      <div className="spending-category-bar-track">
        <span
          className="spending-category-bar-fill future-goal-bar-fill"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}

/** @param {{ goal: object }} props */
function FutureGoalRow({ goal }) {
  const {
    id,
    icon,
    title,
    current,
    target,
    progressPercent,
    monthlyProgress,
    monthlyProgressLabel,
    secondaryValue,
    secondaryLabel,
    context,
    caveat,
    childSplits,
  } = goal;

  const showPosition = current && target;
  const showProgress = progressPercent != null && showPosition;

  return (
    <article className="spending-pattern-row future-goal-row" aria-labelledby={`future-goal-${id}`}>
      <strong className="spending-pattern-title" id={`future-goal-${id}`}>
        {icon && <span aria-hidden="true">{icon}</span>}
        {icon && ' '}
        {title}
      </strong>

      {showPosition && (
        <span className="spending-pattern-detail">{current} of {target}</span>
      )}

      {showProgress && (
        <GoalProgressBar
          percent={progressPercent}
          label={`${title}: ${progressPercent}% of ${target}`}
        />
      )}

      {!showPosition && current && !target && (
        <span className="spending-pattern-detail">{current} remaining</span>
      )}

      {monthlyProgress && (
        <span className="spending-pattern-detail">
          <strong>{monthlyProgress}</strong>
          {monthlyProgressLabel && ` ${monthlyProgressLabel}`}
        </span>
      )}

      {secondaryValue && (
        <span className="spending-pattern-detail">
          {secondaryLabel === 'remaining' ? (
            <><strong>{secondaryValue}</strong> remaining</>
          ) : secondaryLabel === 'connected balance' ? (
            <><strong>{secondaryValue}</strong> connected balance</>
          ) : secondaryLabel === 'protected for the kids' ? (
            <><strong>{secondaryValue}</strong> protected for the kids</>
          ) : (
            <><strong>{secondaryValue}</strong> {secondaryLabel}</>
          )}
        </span>
      )}

      {childSplits?.length > 0 && (
        <p className="spending-pattern-support">{childSplits.join(' · ')}</p>
      )}

      {context && (
        <p className="panel-note future-goal-context">{context}</p>
      )}

      {caveat && (
        <p className="spending-pattern-support future-goal-caveat">* {caveat}</p>
      )}
    </article>
  );
}

/** @param {{ goalsLabel?: string, goals?: Array<object> }} props */
export function FutureGoals({ goalsLabel, goals }) {
  if (!goals?.length) return null;

  return (
    <section className="spending-block" aria-label={goalsLabel}>
      <h2 className="month-snapshot-section-heading">{goalsLabel}</h2>
      <div className="paper-surface spending-panel-surface">
        <ul className="spending-pattern-list future-goal-list">
          {goals.map((goal) => (
            <li key={goal.id}>
              <FutureGoalRow goal={goal} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
