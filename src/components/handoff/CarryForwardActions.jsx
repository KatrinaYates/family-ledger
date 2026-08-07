import React, { useCallback, useEffect, useState } from 'react';
import { months } from '../../data/months';
import { useMonthContext } from '../../context/MonthContext';
import { ledgerRepository } from '../../repository';
import { actionStatusLabel } from '../../utils/actionUtils';
import { dispatchActionsUpdated, ACTIONS_UPDATED_EVENT } from '../../utils/meetingEvents';

function getNextMonthId(monthId) {
  const index = months.findIndex((month) => month.id === monthId);
  return index >= 0 && index < months.length - 1 ? months[index + 1].id : null;
}

export function CarryForwardActions() {
  const { monthId, month } = useMonthContext();
  const nextMonthId = getNextMonthId(monthId);
  const nextMonth = months.find((entry) => entry.id === nextMonthId);
  const [candidates, setCandidates] = useState(() => ledgerRepository.listCarryForwardCandidates(monthId));

  const refresh = useCallback(() => {
    setCandidates(ledgerRepository.listCarryForwardCandidates(monthId));
  }, [monthId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener(ACTIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(ACTIONS_UPDATED_EVENT, handleUpdate);
  }, [refresh]);

  const carryForward = (actionId) => {
    if (!nextMonthId) return;
    ledgerRepository.carryForwardAction(actionId, nextMonthId);
    dispatchActionsUpdated();
    refresh();
  };

  if (!candidates.length) {
    return (
      <p className="carry-forward-empty">
        No open action items to carry forward from {month.label}.
      </p>
    );
  }

  return (
    <div className="carry-forward-actions">
      <p className="carry-forward-intro">
        Carry open actions into {nextMonth?.label ?? 'the next month'} explicitly — they will not appear there automatically.
      </p>
      <ul className="carry-forward-list">
        {candidates.map((action) => (
          <li key={action.id} className="carry-forward-item">
            <div className="carry-forward-item-body">
              <strong>{action.title || 'Untitled action'}</strong>
              <span className="carry-forward-meta">
                {action.owner && `${action.owner} · `}
                {actionStatusLabel(action.status)}
              </span>
            </div>
            {nextMonthId && (
              <button
                type="button"
                className="meeting-add-btn"
                onClick={() => carryForward(action.id)}
              >
                Carry to {nextMonth?.label ?? nextMonthId}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
