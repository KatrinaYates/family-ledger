import { useCallback, useEffect, useRef, useState } from 'react';
import { useMonthContext } from '../context/MonthContext';
import { ledgerRepository } from '../repository';
import { sectionFieldKey } from '../utils/meetingKeys';
import { dispatchMeetingUpdated } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

/** @type {Map<string, Promise<void>>} */
const meetingSaveQueues = new Map();

/** @param {string} storageKey @param {() => Promise<void>} saveFn */
function enqueueMeetingSave(storageKey, saveFn) {
    const previous = meetingSaveQueues.get(storageKey) ?? Promise.resolve();
    const next = previous
        .catch(() => undefined)
        .then(saveFn);
    meetingSaveQueues.set(storageKey, next);
    return next;
}

/** @param {string} storageKey @param {string} [initial] */
export function useMeetingNotes(storageKey, initial = '') {
    const { monthId, workflow } = useMonthContext();
    const isLocked = workflow.status === 'locked';
    const { run } = useAsyncGuard();
    const [value, setValueState] = useState(initial);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const valueRef = useRef(value);
    const hasLocalEditsRef = useRef(false);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        hasLocalEditsRef.current = false;
    }, [monthId, storageKey]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setSaveError(null);
            try {
                const stored = await run(() => ledgerRepository.getMeetingEntry(monthId, storageKey));
                if (cancelled || stored === undefined || hasLocalEditsRef.current) return;
                setValueState(typeof stored === 'string' ? stored : initial);
            } catch (err) {
                if (!cancelled) setSaveError(getErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [monthId, storageKey, initial, run]);

    const setValue = useCallback(
        async (next) => {
            if (isLocked) return;
            const resolved = typeof next === 'function' ? next(valueRef.current) : next;
            hasLocalEditsRef.current = true;
            setValueState(resolved);
            setSaving(true);
            setSaveError(null);

            const savePromise = enqueueMeetingSave(storageKey, async () => {
                await ledgerRepository.saveMeetingEntry(monthId, storageKey, resolved);
                dispatchMeetingUpdated();
            });

            try {
                await savePromise;
            } catch (err) {
                setSaveError(getErrorMessage(err));
            } finally {
                if (meetingSaveQueues.get(storageKey) === savePromise) {
                    setSaving(false);
                }
            }
        },
        [isLocked, monthId, storageKey],
    );

    return { value, setValue, isLocked, loading, saving, saveError };
}

/** @param {string} storageKey @param {() => unknown} initialFactory */
export function useMeetingJson(storageKey, initialFactory) {
    const { monthId, workflow } = useMonthContext();
    const isLocked = workflow.status === 'locked';
    const { run } = useAsyncGuard();
    const initialFactoryRef = useRef(initialFactory);
    initialFactoryRef.current = initialFactory;

    const [value, setValueState] = useState(() => initialFactory());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const valueRef = useRef(value);
    const hasLocalEditsRef = useRef(false);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        hasLocalEditsRef.current = false;
    }, [monthId, storageKey]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setSaveError(null);
            try {
                const stored = await run(() => ledgerRepository.getMeetingEntry(monthId, storageKey));
                if (cancelled || stored === undefined || hasLocalEditsRef.current) return;
                if (stored != null) {
                    setValueState(stored);
                } else {
                    setValueState(initialFactoryRef.current());
                }
            } catch (err) {
                if (!cancelled) setSaveError(getErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [monthId, storageKey, run]);

    const setValue = useCallback(
        async (next) => {
            if (isLocked) return;
            const resolved = typeof next === 'function' ? next(valueRef.current) : next;
            hasLocalEditsRef.current = true;
            setValueState(resolved);
            setSaving(true);
            setSaveError(null);

            const savePromise = enqueueMeetingSave(storageKey, async () => {
                await ledgerRepository.saveMeetingEntry(monthId, storageKey, resolved);
                dispatchMeetingUpdated();
            });

            try {
                await savePromise;
            } catch (err) {
                setSaveError(getErrorMessage(err));
            } finally {
                if (meetingSaveQueues.get(storageKey) === savePromise) {
                    setSaving(false);
                }
            }
        },
        [isLocked, monthId, storageKey],
    );

    return { value, setValue, isLocked, loading, saving, saveError };
}

/** @param {string} section @param {string} field @param {string} [initial] */
export function useMeetingField(section, field, initial = '') {
    const { monthId } = useMonthContext();
    const key = sectionFieldKey(monthId, section, field);
    return useMeetingNotes(key, initial);
}
