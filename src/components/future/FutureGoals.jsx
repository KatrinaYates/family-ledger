import React from 'react';

/** @param {{ percent: number, current?: string, target?: string, title?: string }} props */
function EmergencyTrack({ percent, current, target, title }) {
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="future-goal-track"
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={title ? `${title}: ${safePercent}% of ${target}` : `${safePercent}% progress`}
    >
      <div className="future-goal-track-rail">
        <span
          className="future-goal-track-fill"
          style={{ width: `${safePercent}%` }}
        />
        <span
          className="future-goal-track-marker"
          style={{ left: `${safePercent}%` }}
          aria-hidden="true"
        />
        <span className="future-goal-track-target" aria-hidden="true" title="Target" />
      </div>
      <span className="future-goal-track-percent">{safePercent}%</span>
    </div>
  );
}

/** @param {{ goal: object }} props */
function EmergencyGoal({ goal }) {
  const {
    icon,
    title,
    current,
    target,
    progressPercent,
    monthlyProgress,
    secondaryValue,
    context,
  } = goal;

  return (
    <article
      className="paper-surface spending-panel-surface future-goal-panel"
      aria-labelledby={`future-goal-${goal.id}`}
    >
      <h3 className="future-goal-title" id={`future-goal-${goal.id}`}>
        {icon && <span className="future-goal-title-icon" aria-hidden="true">{icon}</span>}
        {title}
      </h3>

      {current && target && (
        <div className="future-goal-range">
          <span className="future-goal-range-current">{current}</span>
          <span className="future-goal-range-target">{target}</span>
        </div>
      )}

      {progressPercent != null && current && target && (
        <EmergencyTrack
          percent={progressPercent}
          current={current}
          target={target}
          title={title}
        />
      )}

      <div className="future-goal-stats">
        {monthlyProgress && (
          <span className="future-goal-stat future-goal-stat-positive">
            {monthlyProgress} this month
          </span>
        )}
        {secondaryValue && (
          <span className="future-goal-stat">
            {secondaryValue} to go
          </span>
        )}
      </div>

      {context && (
        <p className="future-goal-annotation">{context}</p>
      )}
    </article>
  );
}

/** @param {{ goal: object }} props */
function DebtGoal({ goal }) {
  const {
    icon,
    title,
    current,
    monthlyProgress,
    monthlyProgressLabel,
    caveat,
  } = goal;

  return (
    <article
      className="paper-surface spending-panel-surface future-goal-panel"
      aria-labelledby={`future-goal-${goal.id}`}
    >
      <h3 className="future-goal-title" id={`future-goal-${goal.id}`}>
        {icon && <span className="future-goal-title-icon" aria-hidden="true">{icon}</span>}
        {title}
      </h3>

      {current && (
        <p className="future-debt-remaining">
          <span className="future-debt-remaining-value">{current}</span>
          <span className="future-debt-remaining-label">remaining</span>
        </p>
      )}

      {monthlyProgress && (
        <div className="future-debt-flow">
          <span className="future-debt-flow-kicker">This month</span>
          <div className="future-debt-flow-graphic" aria-hidden="true">
            <span className="future-debt-flow-arrow">↓</span>
            <span className="future-debt-flow-line" />
            <span className="future-debt-flow-node" />
          </div>
          <p className="future-debt-flow-amount">{monthlyProgress}</p>
          {monthlyProgressLabel && (
            <p className="future-debt-flow-caption">{monthlyProgressLabel}</p>
          )}
        </div>
      )}

      {caveat && (
        <p className="future-data-note">{caveat}</p>
      )}
    </article>
  );
}

/** @param {{ goal: object }} props */
function RetirementGoal({ goal }) {
  const { title, monthlyProgress, secondaryValue, caveat } = goal;

  return (
    <article
      className="paper-surface spending-panel-surface future-goal-panel"
      aria-labelledby={`future-goal-${goal.id}`}
    >
      <h3 className="future-goal-title" id={`future-goal-${goal.id}`}>
        <span className="future-goal-title-icon" aria-hidden="true">🌱</span>
        {title ?? 'Retirement'}
      </h3>
      {monthlyProgress && (
        <p className="future-pair-amount">{monthlyProgress}</p>
      )}
      <p className="future-pair-caption">this month</p>
      {secondaryValue && (
        <p className="future-pair-balance">
          {secondaryValue}
          <span className="future-pair-balance-label"> connected</span>
        </p>
      )}
      {caveat && (
        <p className="future-data-note future-data-note-inline">* {caveat}</p>
      )}
    </article>
  );
}

/** @param {{ goal: object }} props */
function KidsGoal({ goal }) {
  const { title, monthlyProgress, secondaryValue, childSplits, context } = goal;

  return (
    <article
      className="paper-surface spending-panel-surface future-goal-panel"
      aria-labelledby={`future-goal-${goal.id}`}
    >
      <h3 className="future-goal-title" id={`future-goal-${goal.id}`}>
        <span className="future-goal-title-icon" aria-hidden="true">♥</span>
        {title ?? 'Kids savings'}
      </h3>
      {monthlyProgress && (
        <p className="future-pair-amount">{monthlyProgress}</p>
      )}
      <p className="future-pair-caption">this month</p>
      {secondaryValue && (
        <p className="future-pair-balance">
          {secondaryValue}
          <span className="future-pair-balance-label"> protected</span>
        </p>
      )}
      {childSplits?.length > 0 && (
        <ul className="future-kids-splits">
          {childSplits.map((split) => (
            <li key={split}>{split}</li>
          ))}
        </ul>
      )}
      {context && !childSplits?.length && (
        <p className="future-data-note future-data-note-inline">{context}</p>
      )}
    </article>
  );
}

/** @param {{ goal: object }} props */
function GenericGoal({ goal }) {
  return (
    <article
      className="paper-surface spending-panel-surface future-goal-panel"
      aria-labelledby={`future-goal-${goal.id}`}
    >
      <h3 className="future-goal-title" id={`future-goal-${goal.id}`}>
        {goal.icon && <span className="future-goal-title-icon" aria-hidden="true">{goal.icon}</span>}
        {goal.title}
      </h3>
      {goal.current && goal.target && (
        <p className="future-goal-range-simple">{goal.current} of {goal.target}</p>
      )}
      {goal.monthlyProgress && (
        <p className="future-goal-stat future-goal-stat-positive">{goal.monthlyProgress}</p>
      )}
      {goal.context && <p className="future-data-note">{goal.context}</p>}
      {goal.caveat && <p className="future-data-note">{goal.caveat}</p>}
    </article>
  );
}

const KNOWN_TYPES = new Set(['emergency-fund', 'debt', 'retirement', 'kids-savings']);

/** @param {{ goalsLabel?: string, goals?: Array<object> }} props */
export function FutureGoals({ goalsLabel, goals }) {
  if (!goals?.length) return null;

  const emergency = goals.find((g) => g.type === 'emergency-fund');
  const debt = goals.find((g) => g.type === 'debt');
  const retirement = goals.find((g) => g.type === 'retirement');
  const kids = goals.find((g) => g.type === 'kids-savings');
  const other = goals.filter((g) => !KNOWN_TYPES.has(g.type));

  return (
    <section className="spending-block future-goals" aria-label={goalsLabel}>
      <h2 className="month-snapshot-section-heading">{goalsLabel}</h2>

      <div className="future-goal-grid">
        {emergency && <EmergencyGoal goal={emergency} />}
        {debt && <DebtGoal goal={debt} />}
        {retirement && <RetirementGoal goal={retirement} />}
        {kids && <KidsGoal goal={kids} />}
        {other.map((goal) => (
          <GenericGoal key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  );
}
