import React, { useEffect } from 'react';
import { useActions } from '../../hooks/useActions';

export function ActionPlan({ seedRows = [] }) {
  const {
    actions,
    loading,
    error,
    saving,
    saveError,
    isLocked,
    seedIfEmpty,
    addAction,
    updateAction,
    removeAction,
    statusOptions,
    actionStatusLabel,
  } = useActions();

  useEffect(() => {
    seedIfEmpty(seedRows);
  }, [seedIfEmpty, seedRows]);

  if (loading) {
    return <p className="action-plan-loading">Loading action items…</p>;
  }

  if (error) {
    return <p className="field-save-error" role="alert">{error}</p>;
  }

  return (
    <div className="editable-action-plan">
      {saveError && <p className="field-save-error" role="alert">{saveError}</p>}
      <div className="action-table">
        <div className="action-row head">
          <span>Action</span>
          <span>Owner</span>
          <span>Due</span>
          <span>Status</span>
          <span className="action-row-actions"> </span>
        </div>
        {actions.map((row) => {
          const isDone = row.status === 'done';
          const readOnly = isLocked && isDone;
          return (
            <div className={`action-row editable ${readOnly ? 'is-readonly' : ''}`} key={row.id}>
              <input
                type="text"
                className="editable-cell-input"
                value={row.title}
                onChange={(e) => updateAction(row.id, { title: e.target.value })}
                placeholder="What needs to happen?"
                readOnly={readOnly}
              />
              <input
                type="text"
                className="editable-cell-input"
                value={row.owner}
                onChange={(e) => updateAction(row.id, { owner: e.target.value })}
                placeholder="Owner"
                readOnly={readOnly}
              />
              <input
                type="text"
                className="editable-cell-input"
                value={row.dueDate ?? ''}
                onChange={(e) => updateAction(row.id, { dueDate: e.target.value || null })}
                placeholder="Due date"
                readOnly={readOnly}
              />
              <select
                className="editable-cell-input"
                value={row.status}
                onChange={(e) => updateAction(row.id, { status: e.target.value })}
                disabled={readOnly}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {actionStatusLabel(status)}
                  </option>
                ))}
              </select>
              {!readOnly && (
                <button
                  type="button"
                  className="meeting-remove-btn"
                  onClick={() => removeAction(row.id)}
                  aria-label="Remove action item"
                  disabled={saving}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" className="meeting-add-btn" onClick={addAction} disabled={saving}>
        + Add action item
      </button>
    </div>
  );
}
