import { useEffect, useState } from 'react';
import { dispatchMeetingUpdated } from '../utils/meetingEvents';

export function useLocalNotes(key, initial = '') {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
      dispatchMeetingUpdated();
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);

  return [value, setValue];
}
