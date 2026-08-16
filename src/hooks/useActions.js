import { useCallback, useEffect, useState } from 'react';
import { useMonthContext } from '../context/MonthContext';
import { ledgerRepository } from '../repository';
import {
  ACTION_STATUSES,
  actionStatusLabel,
  createActionEntity,
  createActionFromSeed,
} from '../utils/actionUtils';
import { dispatchActionsUpdated, ACTIONS_UPDATED_EVENT } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

export function useActions() {
  const { monthId, workflow } = useMonthContext();
  const isLocked = workflow.status === 'locked';
  const { run } = useAsyncGuard();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await run(() => ledgerRepository.listActionsForMonth(monthId));
      if (rows != null) {
        setActions(rows);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [monthId, run]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener(ACTIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(ACTIONS_UPDATED_EVENT, handleUpdate);
  }, [refresh]);

  const seedIfEmpty = useCallback(
    async (seeds = []) => {
      if (!seeds.length) return;
      setSaving(true);
      setSaveError(null);
      try {
        const existing = await ledgerRepository.listActions({ originMonthId: monthId });
        if (existing.length > 0) return;
        for (const seed of seeds) {
          await ledgerRepository.saveAction(createActionFromSeed(seed, monthId));
        }
        dispatchActionsUpdated();
        await refresh();
      } catch (err) {
        setSaveError(getErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [monthId, refresh],
  );

  const addAction = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await ledgerRepository.saveAction(createActionEntity({ originMonthId: monthId }));
      dispatchActionsUpdated();
      await refresh();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [monthId, refresh]);

  const updateAction = useCallback(
    async (id, patch) => {
      // Keep controlled inputs responsive immediately. Waiting for the repository
      // round-trip here causes React to re-render the old value while the user is typing.
      setActions((previous) => previous.map((action) => (
        action.id === id ? { ...action, ...patch } : action
      )));
      setSaving(true);
      setSaveError(null);
      try {
        await ledgerRepository.updateAction(id, patch);
        dispatchActionsUpdated();
      } catch (err) {
        setSaveError(getErrorMessage(err));
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const removeAction = useCallback(
    async (id) => {
      setSaving(true);
      setSaveError(null);
      try {
        await ledgerRepository.deleteAction(id);
        dispatchActionsUpdated();
        await refresh();
      } catch (err) {
        setSaveError(getErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  return {
    actions,
    loading,
    error,
    saving,
    saveError,
    isLocked,
    seedIfEmpty,
    addAction,
    updateAction,
    removeAction,
    statusOptions: ACTION_STATUSES,
    actionStatusLabel,
  };
}
