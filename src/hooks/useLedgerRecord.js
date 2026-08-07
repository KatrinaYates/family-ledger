import { useCallback, useEffect, useState } from 'react';
import { ledgerRepository } from '../repository';
import { WORKFLOW_UPDATED_EVENT } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

/** @param {string | null | undefined} monthId */
export function useLedgerRecord(monthId) {
    const { run } = useAsyncGuard();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(Boolean(monthId));
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        if (!monthId) {
            setRecord(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const meta = await run(() => ledgerRepository.getLedgerRecord(monthId));
            if (meta !== undefined) {
                setRecord(meta);
            }
        } catch (err) {
            setRecord(null);
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
        window.addEventListener(WORKFLOW_UPDATED_EVENT, handleUpdate);
        return () => window.removeEventListener(WORKFLOW_UPDATED_EVENT, handleUpdate);
    }, [refresh]);

    return { record, loading, error, refresh };
}
