export const MEETING_UPDATED_EVENT = 'fl-meeting-updated';
export const WORKFLOW_UPDATED_EVENT = 'fl-workflow-updated';
export const ACTIONS_UPDATED_EVENT = 'fl-actions-updated';

export function dispatchMeetingUpdated() {
  window.dispatchEvent(new CustomEvent(MEETING_UPDATED_EVENT));
}

export function dispatchWorkflowUpdated() {
  window.dispatchEvent(new CustomEvent(WORKFLOW_UPDATED_EVENT));
}

export function dispatchActionsUpdated() {
  window.dispatchEvent(new CustomEvent(ACTIONS_UPDATED_EVENT));
}
