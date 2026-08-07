import { useCallback, useEffect, useState } from 'react';
import { ledgerRepository } from '../repository';
import { LEDGER_MONTHS_UPDATED_EVENT } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

export function useLedgerMonths() {
    const { run } = useAsyncGuard();
    const [monthIds, setMonthIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const ids = await run(() => ledgerRepository.listNavigableMonthIds());
            if (ids != null) {
                setMonthIds(ids);
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
        window.addEventListener(LEDGER_MONTHS_UPDATED_EVENT, handleUpdate);
        return () => window.removeEventListener(LEDGER_MONTHS_UPDATED_EVENT, handleUpdate);
    }, [refresh]);

    return { monthIds, loading, error, refresh };
}
