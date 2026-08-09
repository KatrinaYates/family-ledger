import { useCallback, useEffect, useState } from 'react';
import { ledgerRepository } from '../repository';
import { WORKFLOW_UPDATED_EVENT, LEDGER_MONTH_UPDATED_EVENT } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

/** @param {string | null | undefined} monthId */
export function useLedgerMonth(monthId) {
    const { run } = useAsyncGuard();
    const [data, setData] = useState(null);
    const [version, setVersion] = useState(null);
    const [loading, setLoading] = useState(Boolean(monthId));
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        if (!monthId) {
            setData(null);
            setVersion(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const hasData = await ledgerRepository.hasLedgerData(monthId);
            if (!hasData) {
                setData(null);
                setVersion(null);
                return;
            }

            const [monthData, record] = await run(async () => {
                const view = await ledgerRepository.getMonth(monthId);
                const meta = await ledgerRepository.getLedgerRecord(monthId);
                return [view, meta];
            });

            if (monthData != null) {
                setData(monthData);
                setVersion(record?.version ?? null);
            }
        } catch (err) {
            setData(null);
            setVersion(null);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [monthId, run]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        const handleUpdate = (event) => {
            const updatedMonthId = event?.detail?.monthId;
            if (updatedMonthId && updatedMonthId !== monthId) return;
            refresh();
        };
        window.addEventListener(WORKFLOW_UPDATED_EVENT, handleUpdate);
        window.addEventListener(LEDGER_MONTH_UPDATED_EVENT, handleUpdate);
        return () => {
            window.removeEventListener(WORKFLOW_UPDATED_EVENT, handleUpdate);
            window.removeEventListener(LEDGER_MONTH_UPDATED_EVENT, handleUpdate);
        };
    }, [monthId, refresh]);

    return { data, version, loading, error, refresh };
}
