export const MEETING_UPDATED_EVENT = 'fl-meeting-updated';
export const WORKFLOW_UPDATED_EVENT = 'fl-workflow-updated';
export const ACTIONS_UPDATED_EVENT = 'fl-actions-updated';
export const LEDGER_MONTHS_UPDATED_EVENT = 'fl-ledger-months-updated';
export const LEDGER_MONTH_UPDATED_EVENT = 'fl-ledger-month-updated';

export function dispatchMeetingUpdated() {
  window.dispatchEvent(new CustomEvent(MEETING_UPDATED_EVENT));
}

export function dispatchWorkflowUpdated() {
  window.dispatchEvent(new CustomEvent(WORKFLOW_UPDATED_EVENT));
}

export function dispatchActionsUpdated() {
  window.dispatchEvent(new CustomEvent(ACTIONS_UPDATED_EVENT));
}

export function dispatchLedgerMonthsUpdated() {
  window.dispatchEvent(new CustomEvent(LEDGER_MONTHS_UPDATED_EVENT));
}

/** @param {string} [monthId] */
export function dispatchLedgerMonthUpdated(monthId) {
  window.dispatchEvent(new CustomEvent(LEDGER_MONTH_UPDATED_EVENT, { detail: { monthId } }));
}
