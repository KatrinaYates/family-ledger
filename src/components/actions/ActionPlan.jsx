import React, { useEffect } from 'react';
import { useActions } from '../../hooks/useActions';

export function ActionPlan({ seedRows = [] }) {
  const { actions, seedIfEmpty, addAction, updateAction, removeAction, statusOptions, actionStatusLabel } =
    useActions();

  useEffect(() => {
    seedIfEmpty(seedRows);
  }, [seedIfEmpty, seedRows]);

  return (
    <div className="editable-action-plan">
      <div className="action-table">
        <div className="action-row head">
          <span>Action</span>
          <span>Owner</span>
          <span>Due</span>
          <span>Status</span>
          <span className="action-row-actions"> </span>
        </div>
        {actions.map((row) => (
          <div className="action-row editable" key={row.id}>
            <input
              type="text"
              className="editable-cell-input"
              value={row.title}
              onChange={(e) => updateAction(row.id, { title: e.target.value })}
              placeholder="What needs to happen?"
            />
            <input
              type="text"
              className="editable-cell-input"
              value={row.owner}
              onChange={(e) => updateAction(row.id, { owner: e.target.value })}
              placeholder="Owner"
            />
            <input
              type="text"
              className="editable-cell-input"
              value={row.dueDate ?? ''}
              onChange={(e) => updateAction(row.id, { dueDate: e.target.value || null })}
              placeholder="Due date"
            />
            <select
              className="editable-cell-input"
              value={row.status}
              onChange={(e) => updateAction(row.id, { status: e.target.value })}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {actionStatusLabel(status)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="meeting-remove-btn"
              onClick={() => removeAction(row.id)}
              aria-label="Remove action item"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="meeting-add-btn" onClick={addAction}>
        + Add action item
      </button>
    </div>
  );
}
