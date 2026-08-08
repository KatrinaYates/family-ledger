import { useCallback, useEffect, useRef, useState } from 'react';
import { ledgerRepository } from '../repository';
import { dispatchMeetingUpdated } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

/**
 * Ledger-wide notes (inside cover, etc.) — not scoped to a month and not blocked by month lock.
 * @param {string} storageKey
 * @param {string} [initial]
 */
export function useLedgerNotes(storageKey, initial = '') {
    const { run } = useAsyncGuard();
    const [value, setValueState] = useState(initial);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const initialRef = useRef(initial);
    initialRef.current = initial;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setSaveError(null);
            try {
                const stored = await run(() => ledgerRepository.getMeetingEntry(null, storageKey));
                if (cancelled || stored === undefined) return;
                setValueState(typeof stored === 'string' ? stored : initialRef.current);
            } catch (err) {
                if (!cancelled) setSaveError(getErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [storageKey, run]);

    const setValue = useCallback(
        async (next) => {
            const resolved = typeof next === 'function' ? next(valueRef.current) : next;
            setValueState(resolved);
            setSaving(true);
            setSaveError(null);
            try {
                await ledgerRepository.saveMeetingEntry(null, storageKey, resolved);
                dispatchMeetingUpdated();
            } catch (err) {
                setSaveError(getErrorMessage(err));
            } finally {
                setSaving(false);
            }
        },
        [storageKey],
    );

    return { value, setValue, loading, saving, saveError };
}
