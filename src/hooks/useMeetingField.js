import { useCallback, useEffect, useState } from 'react';
import { useMonthContext } from '../context/MonthContext';
import { ledgerRepository } from '../repository';
import { meetingKey as buildMeetingKey } from '../utils/meetingKeys';
import { dispatchMeetingUpdated } from '../utils/meetingEvents';

/** @param {string} storageKey @param {string} [initial] */
export function useMeetingNotes(storageKey, initial = '') {
    const { monthId, workflow } = useMonthContext();
    const isLocked = workflow.status === 'locked';

    const [value, setValueState] = useState(() => {
        const stored = ledgerRepository.getMeetingEntry(monthId, storageKey);
        return typeof stored === 'string' ? stored : initial;
    });

    useEffect(() => {
        const stored = ledgerRepository.getMeetingEntry(monthId, storageKey);
        setValueState(typeof stored === 'string' ? stored : initial);
    }, [monthId, storageKey, initial]);

    const setValue = useCallback(
        (next) => {
            if (isLocked) return;
            const resolved = typeof next === 'function' ? next(value) : next;
            setValueState(resolved);
            ledgerRepository.saveMeetingEntry(monthId, storageKey, resolved);
            dispatchMeetingUpdated();
        },
        [isLocked, monthId, storageKey, value],
    );

    return [value, setValue, isLocked];
}

/** @param {string} storageKey @param {() => unknown} initialFactory */
export function useMeetingJson(storageKey, initialFactory) {
    const { monthId, workflow } = useMonthContext();
    const isLocked = workflow.status === 'locked';

    const [value, setValueState] = useState(() => {
        const stored = ledgerRepository.getMeetingEntry(monthId, storageKey);
        if (stored != null) return stored;
        return initialFactory();
    });

    useEffect(() => {
        const stored = ledgerRepository.getMeetingEntry(monthId, storageKey);
        if (stored != null) {
            setValueState(stored);
        } else {
            setValueState(initialFactory());
        }
    }, [monthId, storageKey, initialFactory]);

    const setValue = useCallback(
        (next) => {
            if (isLocked) return;
            const resolved = typeof next === 'function' ? next(value) : next;
            setValueState(resolved);
            ledgerRepository.saveMeetingEntry(monthId, storageKey, resolved);
            dispatchMeetingUpdated();
        },
        [isLocked, monthId, storageKey, value],
    );

    return [value, setValue, isLocked];
}

/** @param {string} section @param {number | string} page @param {string} field @param {string} [initial] */
export function useMeetingField(section, page, field, initial = '') {
    const { monthId } = useMonthContext();
    const key = buildMeetingKey(monthId, section, page, field);
    return useMeetingNotes(key, initial);
}
