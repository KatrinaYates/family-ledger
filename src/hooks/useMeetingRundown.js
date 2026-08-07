import { useCallback, useEffect, useState } from 'react';
import { collectMeetingRundown } from '../utils/collectMeetingRundown';
import { MEETING_UPDATED_EVENT, ACTIONS_UPDATED_EVENT } from '../utils/meetingEvents';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAsyncGuard } from './useAsyncGuard';

/** @param {string | null | undefined} monthId */
export function useMeetingRundown(monthId) {
  const { run } = useAsyncGuard();
  const [rundown, setRundown] = useState({ sections: [], generatedAt: null });
  const [loading, setLoading] = useState(Boolean(monthId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!monthId) {
      setRundown({ sections: [], generatedAt: null });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await run(() => collectMeetingRundown(monthId));
      if (next != null) {
        setRundown(next);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [monthId, run]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const prefix = `fl-${monthId}-`;
    const onStorage = (event) => {
      if (event.key?.startsWith(prefix) || event.key === 'fl-actions') refresh();
    };
    const onMeetingUpdated = () => refresh();
    const onActionsUpdated = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(MEETING_UPDATED_EVENT, onMeetingUpdated);
    window.addEventListener(ACTIONS_UPDATED_EVENT, onActionsUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(MEETING_UPDATED_EVENT, onMeetingUpdated);
      window.removeEventListener(ACTIONS_UPDATED_EVENT, onActionsUpdated);
    };
  }, [monthId, refresh]);

  return { rundown, loading, error, refresh };
}
