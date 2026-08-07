import React, { useState } from 'react';
import { useMonthContext } from '../../context/MonthContext';
import { ledgerRepository } from '../../repository';
import { dispatchWorkflowUpdated } from '../../utils/meetingEvents';

export function LockMonthControl({ className = '' }) {
  const { monthId, month, workflow } = useMonthContext();
  const [confirming, setConfirming] = useState(false);

  if (workflow.status === 'locked') {
    return (
      <div className={`lock-month-control is-locked ${className}`.trim()}>
        <p>
          <strong>{month.label} is locked.</strong>{' '}
          {workflow.lockedAt && (
            <span>Locked {new Date(workflow.lockedAt).toLocaleString()}.</span>
          )}
        </p>
        <p className="lock-month-hint">Meeting notes are read-only. Action items remain editable.</p>
      </div>
    );
  }

  const handleLock = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    ledgerRepository.lockMonth(monthId);
    dispatchWorkflowUpdated();
    setConfirming(false);
  };

  return (
    <div className={`lock-month-control ${className}`.trim()}>
      <p className="lock-month-hint">
        When you are done with the {month.label} meeting, lock this month to protect your notes.
      </p>
      <button type="button" className="lock-month-btn" onClick={handleLock}>
        {confirming ? `Confirm lock ${month.label}` : `Lock ${month.label}`}
      </button>
      {confirming && (
        <button type="button" className="meeting-add-btn" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      )}
    </div>
  );
}
