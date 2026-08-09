import React, { useState } from 'react';
import { useMonthContext } from '../../context/MonthContext';
import { useWorkflow } from '../../hooks/useWorkflow';
import { ledgerRepository } from '../../repository';
import { dispatchWorkflowUpdated } from '../../utils/meetingEvents';
import { getErrorMessage } from '../../utils/getErrorMessage';

export function LockMonthControl({ className = '' }) {
  const { monthId, month } = useMonthContext();
  const { workflow, version, loading, refresh } = useWorkflow(monthId);
  const [confirming, setConfirming] = useState(false);
  const [unlockConfirming, setUnlockConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  if (loading) {
    return (
      <div className={`lock-month-control is-loading ${className}`.trim()}>
        <p className="lock-month-hint">Loading lock status…</p>
      </div>
    );
  }

  if (workflow.status === 'locked') {
    const handleUnlock = async () => {
      if (!unlockConfirming) {
        setUnlockConfirming(true);
        setSaveError(null);
        return;
      }
      setSaving(true);
      setSaveError(null);
      try {
        await ledgerRepository.unlockMonth(monthId, undefined, version != null ? { expectedVersion: version } : undefined);
        dispatchWorkflowUpdated();
        await refresh();
        setUnlockConfirming(false);
      } catch (err) {
        setSaveError(getErrorMessage(err));
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className={`lock-month-control is-locked ${className}`.trim()}>
        <p>
          <strong>{month.label} is locked.</strong>{' '}
          {workflow.lockedAt && (
            <span>Locked {new Date(workflow.lockedAt).toLocaleString()}.</span>
          )}
        </p>
        <p className="lock-month-hint">Meeting notes are read-only. Action items remain editable.</p>
        {saveError && <p className="field-save-error" role="alert">{saveError}</p>}
        <button type="button" className="lock-month-btn" onClick={handleUnlock} disabled={saving}>
          {saving ? 'Unlocking…' : unlockConfirming ? `Confirm unlock ${month.label}` : `Unlock ${month.label}`}
        </button>
        {unlockConfirming && !saving && (
          <button type="button" className="meeting-add-btn" onClick={() => setUnlockConfirming(false)}>
            Cancel
          </button>
        )}
      </div>
    );
  }

  const handleLock = async () => {
    if (!confirming) {
      setConfirming(true);
      setSaveError(null);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await ledgerRepository.lockMonth(monthId, version != null ? { expectedVersion: version } : undefined);
      dispatchWorkflowUpdated();
      await refresh();
      setConfirming(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`lock-month-control ${className}`.trim()}>
      <p className="lock-month-hint">
        When you are done with the {month.label} meeting, lock this month to protect your notes.
      </p>
      {saveError && <p className="field-save-error" role="alert">{saveError}</p>}
      <button type="button" className="lock-month-btn" onClick={handleLock} disabled={saving}>
        {saving ? 'Locking…' : confirming ? `Confirm lock ${month.label}` : `Lock ${month.label}`}
      </button>
      {confirming && !saving && (
        <button type="button" className="meeting-add-btn" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      )}
    </div>
  );
}
