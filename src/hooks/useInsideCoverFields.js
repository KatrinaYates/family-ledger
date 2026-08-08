import { useCallback, useEffect, useRef, useState } from 'react';
import { ledgerRepository } from '../repository';
import { dispatchMeetingUpdated } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { ledgerInsideKey } from '../utils/meetingKeys';
import { useAsyncGuard } from './useAsyncGuard';

const FIELD_DEFS = [
    { id: 'names', metaKey: 'names' },
    { id: 'started', metaKey: null },
    { id: 'motto', metaKey: 'motto' },
    { id: 'why-we-meet', metaKey: null },
];

/**
 * Loads all inside-cover fields in one request batch so the page does not flash
 * placeholder copy while individual entries resolve.
 * @param {object | undefined} meta
 * @param {{ enabled?: boolean }} [options]
 */
export function useInsideCoverFields(meta, { enabled = true } = {}) {
    const { run } = useAsyncGuard();
    const metaRef = useRef(meta);
    metaRef.current = meta;

    const [values, setValues] = useState(null);
    const [loading, setLoading] = useState(enabled);
    const [saveError, setSaveError] = useState(null);
    const [savingField, setSavingField] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setSaveError(null);
        try {
            const next = await run(async () => {
                const loaded = {};
                for (const { id, metaKey } of FIELD_DEFS) {
                    const stored = await ledgerRepository.getMeetingEntry(null, ledgerInsideKey(id));
                    const metaFallback = metaKey ? metaRef.current?.[metaKey] : '';
                    loaded[id] = typeof stored === 'string' ? stored : (metaFallback ?? '');
                }
                return loaded;
            });
            if (next) setValues(next);
        } catch (err) {
            setSaveError(getErrorMessage(err));
            setValues(Object.fromEntries(FIELD_DEFS.map(({ id }) => [id, ''])));
        } finally {
            setLoading(false);
        }
    }, [run]);

    useEffect(() => {
        if (!enabled) {
            setLoading(true);
            return undefined;
        }
        load();
        return undefined;
    }, [enabled, load]);

    const setField = useCallback(async (id, next) => {
        const resolved = typeof next === 'function'
            ? next(values?.[id] ?? '')
            : next;
        setValues((previous) => ({ ...(previous ?? {}), [id]: resolved }));
        setSavingField(id);
        setSaveError(null);
        try {
            await ledgerRepository.saveMeetingEntry(null, ledgerInsideKey(id), resolved);
            dispatchMeetingUpdated();
        } catch (err) {
            setSaveError(getErrorMessage(err));
        } finally {
            setSavingField(null);
        }
    }, [values]);

    const fields = values
        ? FIELD_DEFS.map(({ id }) => ({
            id,
            value: values[id] ?? '',
            setValue: (next) => setField(id, next),
            saving: savingField === id,
        }))
        : [];

    return { loading, saveError, fields, reload: load };
}
