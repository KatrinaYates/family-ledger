import React, { useCallback } from 'react';
import { NOTEBOOK_SYMBOLS } from './content/NotebookPrimitives';
import { useOptionalMonthContext } from '../context/MonthContext';
import { useWorkflow } from '../hooks/useWorkflow';

export const MONTH_LOCK_SCROLL_KEY = 'fl-scroll-to-lock';

const STATUS_COPY = {
  draft: {
    icon: NOTEBOOK_SYMBOLS.edit,
    label: 'Draft',
    detail: 'Meeting notes editable',
  },
  meeting_ready: {
    icon: NOTEBOOK_SYMBOLS.ready,
    label: 'Meeting ready',
    detail: 'Meeting notes editable',
  },
  locked: {
    icon: NOTEBOOK_SYMBOLS.lock,
    label: 'Locked',
    detail: 'Meeting notes protected',
  },
};

function statusKey(workflow) {
  if (workflow?.status === 'locked') return 'locked';
  if (workflow?.status === 'meeting_ready') return 'meeting_ready';
  return 'draft';
}

/**
 * @param {string} monthId
 * @param {() => void} [onJumpToLock]
 */
export function requestJumpToLock(monthId, onJumpToLock) {
  if (!monthId) return;
  sessionStorage.setItem(MONTH_LOCK_SCROLL_KEY, monthId);
  onJumpToLock?.();
}

/**
 * Toolbar month lock status badge — click to jump to lock controls.
 * @param {{ monthId?: string, month?: object, onJumpToLock?: () => void }} props
 */
export function MonthLockStatus({ monthId, month, onJumpToLock }) {
  const context = useOptionalMonthContext();
  const resolvedMonthId = monthId ?? context?.monthId;
  const resolvedMonth = month ?? context?.month;
  const { workflow, loading } = useWorkflow(resolvedMonthId);

  const jump = useCallback(() => {
    requestJumpToLock(resolvedMonthId, onJumpToLock);
  }, [resolvedMonthId, onJumpToLock]);

  if (!resolvedMonthId) return null;

  const monthLabel = resolvedMonth?.label ?? 'This month';
  const key = statusKey(workflow);
  const copy = STATUS_COPY[key];

  const className = [
    'month-lock-status',
    'is-badge',
    `is-${key}`,
    loading ? 'is-loading' : '',
  ].filter(Boolean).join(' ');

  const ariaLabel = loading
    ? `Checking ${monthLabel} lock status`
    : `${monthLabel}: ${copy.label}. ${copy.detail}. Jump to lock controls.`;

  if (loading) {
    return (
      <div
        className={className}
        aria-live="polite"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        <span className="month-lock-status-icon notebook-symbol" aria-hidden="true">…</span>
        <span className="month-lock-status-text">Checking…</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={jump}
      aria-label={ariaLabel}
      title={`${copy.label} — ${monthLabel}. Go to lock controls.`}
    >
      <span className="month-lock-status-icon notebook-symbol" aria-hidden="true">{copy.icon}</span>
      <span className="month-lock-status-month">{monthLabel}</span>
    </button>
  );
}
