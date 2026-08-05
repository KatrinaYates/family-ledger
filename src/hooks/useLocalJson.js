import { useEffect, useState } from 'react';
import { dispatchMeetingUpdated } from '../utils/meetingEvents';

export function useLocalJson(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored != null) return JSON.parse(stored);
    } catch {
      /* ignore parse errors */
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      dispatchMeetingUpdated();
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);

  return [value, setValue];
}
