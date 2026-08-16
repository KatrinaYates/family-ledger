/** @typedef {'not_started' | 'in_progress' | 'done' | 'deferred'} ActionStatus */

export const ACTION_STATUSES = ['not_started', 'in_progress', 'done', 'deferred'];

export const DEFAULT_ACTION_OWNER_OPTIONS = [
  { value: '', label: 'Unassigned' },
  { value: 'Katrina', label: 'Katrina' },
  { value: 'Tyler', label: 'Tyler' },
  { value: 'Clay', label: 'Clay' },
  { value: 'Cole', label: 'Cole' },
];

export const ACTION_STATUS_LABELS = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
  deferred: 'Deferred',
};

/** @param {string} status */
export function actionStatusLabel(status) {
  return ACTION_STATUS_LABELS[status] ?? status;
}

/** @param {string} label */
export function actionStatusFromLabel(label) {
  const entry = Object.entries(ACTION_STATUS_LABELS).find(([, value]) => value === label);
  return entry?.[0] ?? 'not_started';
}

/**
 * @param {object} params
 * @param {string} params.originMonthId
 * @param {string} [params.title]
 * @param {string} [params.owner]
 * @param {string | null} [params.dueDate]
 * @param {ActionStatus} [params.status]
 */
export function createActionEntity({
  originMonthId,
  title = '',
  owner = '',
  dueDate = null,
  status = 'not_started',
}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    householdId: null,
    originMonthId,
    carriedToMonthId: null,
    title,
    owner,
    dueDate,
    status,
    priority: 'normal',
    notes: '',
    createdAt: now,
    updatedAt: now,
    completedAt: status === 'done' ? now : null,
  };
}

/** @param {{ action?: string, owner?: string, dueDate?: string, status?: string }} seed @param {string} originMonthId */
export function createActionFromSeed(seed, originMonthId) {
  const status = seed.status ? actionStatusFromLabel(seed.status) : 'not_started';
  return createActionEntity({
    originMonthId,
    title: seed.action ?? seed.title ?? '',
    owner: seed.owner ?? '',
    dueDate: seed.dueDate || null,
    status,
  });
}

/** @param {import('../repository/types.js').Action} action */
export function formatActionSummary(action) {
  const parts = [
    action.title?.trim(),
    action.owner?.trim() && `Owner: ${action.owner.trim()}`,
    action.dueDate && `Due: ${action.dueDate}`,
    `Status: ${actionStatusLabel(action.status)}`,
  ].filter(Boolean);
  return parts.join(' · ');
}
