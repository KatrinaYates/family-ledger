import { useCallback, useEffect, useMemo, useState } from 'react';
import { enrichCheckIn } from '../data/enrichCheckIn';
import { ledgerRepository } from '../repository';
import { CHECK_IN_UPDATED_EVENT } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

export function useFinancialCheckIn() {
  const { run } = useAsyncGuard();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const row = await run(() => ledgerRepository.getLatestFinancialCheckIn());
      if (row !== undefined) {
        setSnapshot(row);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener(CHECK_IN_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CHECK_IN_UPDATED_EVENT, handleUpdate);
  }, [refresh]);

  const enriched = useMemo(() => enrichCheckIn(snapshot), [snapshot]);

  return {
    snapshot,
    enriched,
    loading,
    error,
    refresh,
    hasCheckIn: Boolean(snapshot),
  };
}
