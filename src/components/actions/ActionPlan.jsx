import React, { useEffect } from 'react';
import { ActionTable, ListAddButton } from '../content/NotebookPrimitives';
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
  } = useActions();

  useEffect(() => {
    seedIfEmpty(seedRows);
  }, [seedIfEmpty, seedRows]);

  const handleUpdate = (id, field, value) => {
    const patch = field === 'action'
      ? { title: value, action: undefined }
      : { [field]: value };
    updateAction(id, patch);
  };

  if (loading) {
    return <p className="action-plan-loading">Loading action items…</p>;
  }

  if (error) {
    return <p className="field-save-error" role="alert">{error}</p>;
  }

  return (
    <div className="editable-action-plan">
      {saveError && <p className="field-save-error" role="alert">{saveError}</p>}
      <ActionTable
        rows={actions}
        onUpdateRow={handleUpdate}
        onRemoveRow={removeAction}
        isRowReadOnly={(row) => isLocked && row.status === 'done'}
        statusOptions={statusOptions}
      />
      {!isLocked && (
        <ListAddButton onClick={addAction} disabled={saving}>
          + Add action item
        </ListAddButton>
      )}
    </div>
  );
}
