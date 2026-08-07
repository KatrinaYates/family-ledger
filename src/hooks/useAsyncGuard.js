import { useCallback, useRef } from 'react';

/**
 * Guards async work against stale responses when deps change quickly.
 * @returns {{ run: <T>(task: () => Promise<T>) => Promise<T | undefined>, isLatest: (id: number) => boolean }}
 */
export function useAsyncGuard() {
    const requestIdRef = useRef(0);

    const run = useCallback(async (task) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        try {
            const result = await task();
            if (requestIdRef.current !== requestId) {
                return undefined;
            }
            return result;
        } catch (error) {
            if (requestIdRef.current !== requestId) {
                return undefined;
            }
            throw error;
        }
    }, []);

    const isLatest = useCallback((id) => requestIdRef.current === id, []);

    return { run, isLatest };
}
