export const MEETING_UPDATED_EVENT = 'fl-meeting-updated';

export function dispatchMeetingUpdated() {
  window.dispatchEvent(new CustomEvent(MEETING_UPDATED_EVENT));
}
