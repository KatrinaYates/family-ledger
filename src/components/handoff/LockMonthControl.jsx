import React, { useEffect, useRef, useState } from 'react';
import { MonthLockPanel } from '../content/NotebookPrimitives';
import { useMonthContext } from '../../context/MonthContext';
import { useWorkflow } from '../../hooks/useWorkflow';
import { ledgerRepository } from '../../repository';
import { dispatchWorkflowUpdated } from '../../utils/meetingEvents';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { MONTH_LOCK_SCROLL_KEY } from '../MonthLockStatus.jsx';

export function LockMonthControl({ className = '' }) {
  const { monthId, month } = useMonthContext();
  const { workflow, version, loading, refresh } = useWorkflow(monthId);
  const controlRef = useRef(null);
  const [confirming, setConfirming] = useState(false);
  const [unlockConfirming, setUnlockConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const scrollTarget = sessionStorage.getItem(MONTH_LOCK_SCROLL_KEY);
    if (scrollTarget !== monthId || !controlRef.current) return;
    sessionStorage.removeItem(MONTH_LOCK_SCROLL_KEY);
    const timer = window.setTimeout(() => {
      controlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      controlRef.current?.focus({ preventScroll: true });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [monthId, loading]);

  if (loading) {
    return (
      <MonthLockPanel
        ref={controlRef}
        className={className}
        status="loading"
      />
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
      <MonthLockPanel
        ref={controlRef}
        className={className}
        monthLabel={month.label}
        status="locked"
        lockedAt={workflow.lockedAt}
        confirming={unlockConfirming}
        saving={saving}
        saveError={saveError}
        onPrimaryClick={handleUnlock}
        onCancelClick={() => {
          setUnlockConfirming(false);
          setSaveError(null);
        }}
      />
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
    <MonthLockPanel
      ref={controlRef}
      className={className}
      monthLabel={month.label}
      status="unlocked"
      confirming={confirming}
      saving={saving}
      saveError={saveError}
      onPrimaryClick={handleLock}
      onCancelClick={() => {
        setConfirming(false);
        setSaveError(null);
      }}
    />
  );
}
