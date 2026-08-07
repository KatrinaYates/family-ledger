import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_WORKFLOW } from '../data/defaultWorkflow';
import { ledgerRepository } from '../repository';
import { WORKFLOW_UPDATED_EVENT } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

/** @param {string | null | undefined} monthId */
export function useWorkflow(monthId) {
    const { run } = useAsyncGuard();
    const [workflow, setWorkflow] = useState(DEFAULT_WORKFLOW);
    const [version, setVersion] = useState(null);
    const [loading, setLoading] = useState(Boolean(monthId));
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        if (!monthId) {
            setWorkflow(DEFAULT_WORKFLOW);
            setVersion(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await run(async () => {
                const wf = await ledgerRepository.getWorkflow(monthId);
                const record = await ledgerRepository.getLedgerRecord(monthId);
                return { wf, record };
            });

            if (result != null) {
                setWorkflow(result.wf ?? DEFAULT_WORKFLOW);
                setVersion(result.record?.version ?? null);
            }
        } catch (err) {
            setWorkflow(DEFAULT_WORKFLOW);
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
        const handleUpdate = () => refresh();
        window.addEventListener(WORKFLOW_UPDATED_EVENT, handleUpdate);
        return () => window.removeEventListener(WORKFLOW_UPDATED_EVENT, handleUpdate);
    }, [refresh]);

    return { workflow, version, loading, error, refresh };
}
