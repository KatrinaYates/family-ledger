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

export function useActions() {
  const { monthId } = useMonthContext();
  const [actions, setActions] = useState(() => ledgerRepository.listActionsForMonth(monthId));

  const refresh = useCallback(() => {
    setActions(ledgerRepository.listActionsForMonth(monthId));
  }, [monthId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener(ACTIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(ACTIONS_UPDATED_EVENT, handleUpdate);
  }, [refresh]);

  const seedIfEmpty = useCallback(
    (seeds = []) => {
      const existing = ledgerRepository.listActions({ originMonthId: monthId });
      if (existing.length > 0 || !seeds.length) return;
      for (const seed of seeds) {
        ledgerRepository.saveAction(createActionFromSeed(seed, monthId));
      }
      dispatchActionsUpdated();
      refresh();
    },
    [monthId, refresh],
  );

  const addAction = useCallback(() => {
    ledgerRepository.saveAction(createActionEntity({ originMonthId: monthId }));
    dispatchActionsUpdated();
    refresh();
  }, [monthId, refresh]);

  const updateAction = useCallback(
    (id, patch) => {
      ledgerRepository.updateAction(id, patch);
      dispatchActionsUpdated();
      refresh();
    },
    [refresh],
  );

  const removeAction = useCallback(
    (id) => {
      ledgerRepository.deleteAction(id);
      dispatchActionsUpdated();
      refresh();
    },
    [refresh],
  );

  return {
    actions,
    seedIfEmpty,
    addAction,
    updateAction,
    removeAction,
    statusOptions: ACTION_STATUSES,
    actionStatusLabel,
  };
}
