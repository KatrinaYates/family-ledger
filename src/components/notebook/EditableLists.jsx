import React from 'react';
import {
  ListAddButton,
  ListRemoveButton,
  PromptField,
} from '../content/NotebookPrimitives';

/**
 * Presentation-only editable checklist — pair with PersistedEditableChecklist for meeting storage.
 * @param {{ items: Array<{ id: string, text: string, checked?: boolean }>, readOnly?: boolean, allowAdd?: boolean, allowEdit?: boolean, allowRemove?: boolean, onToggle?: (id: string) => void, onUpdateText?: (id: string, text: string) => void, onAdd?: () => void, onRemove?: (id: string) => void, className?: string }} props
 */
export function EditableChecklist({
  items = [],
  readOnly = false,
  allowAdd = true,
  allowEdit = true,
  allowRemove = true,
  onToggle,
  onUpdateText,
  onAdd,
  onRemove,
  className = '',
}) {
  return (
    <div className={`editable-checklist ${className}`.trim()}>
      <ul className="notebook-list notebook-list--check notebook-list--editable">
        {items.map((item) => (
          <li key={item.id} className="notebook-list-row">
            <label className="notebook-list-check">
              <input
                type="checkbox"
                checked={Boolean(item.checked)}
                onChange={() => onToggle?.(item.id)}
                disabled={readOnly}
                aria-label={item.text || 'Checklist item'}
              />
              {allowEdit ? (
                <input
                  type="text"
                  className="notebook-list-input editable-inline-input"
                  value={item.text}
                  onChange={(e) => onUpdateText?.(item.id, e.target.value)}
                  placeholder="Add item..."
                  readOnly={readOnly}
                />
              ) : (
                <span className="notebook-list-check-text">{item.text}</span>
              )}
            </label>
            {allowRemove && !readOnly && (
              <ListRemoveButton
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(item.id);
                }}
              />
            )}
          </li>
        ))}
      </ul>
      {allowAdd && !readOnly && onAdd && (
        <ListAddButton onClick={onAdd} />
      )}
    </div>
  );
}

/**
 * @param {{ items: Array<{ id: string, text: string }>, readOnly?: boolean, title?: string, onUpdateText?: (id: string, text: string) => void, onAdd?: () => void, onRemove?: (id: string) => void, className?: string }} props
 */
export function EditableBulletList({
  items = [],
  readOnly = false,
  title,
  onUpdateText,
  onAdd,
  onRemove,
  className = '',
}) {
  return (
    <div className={`editable-bullet-list ${className}`.trim()}>
      {title && <h3>{title}</h3>}
      <ul className="notebook-list notebook-list--bullet notebook-list--editable">
        {items.map((item) => (
          <li key={item.id} className="notebook-list-row">
            <input
              type="text"
              className="notebook-list-input editable-inline-input"
              value={item.text}
              onChange={(e) => onUpdateText?.(item.id, e.target.value)}
              placeholder="Add item..."
              readOnly={readOnly}
            />
            {!readOnly && (
              <ListRemoveButton
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(item.id);
                }}
              />
            )}
          </li>
        ))}
      </ul>
      {!readOnly && onAdd && (
        <ListAddButton onClick={onAdd} />
      )}
    </div>
  );
}

/**
 * @param {{ options: Array<{ id: string, text: string, checked?: boolean }>, outcome?: string, readOnly?: boolean, onToggle?: (id: string) => void, onUpdateText?: (id: string, text: string) => void, onAdd?: () => void, onRemove?: (id: string) => void, onOutcomeChange?: (value: string) => void, className?: string }} props
 */
export function EditableDecisionList({
  options = [],
  outcome = '',
  readOnly = false,
  onToggle,
  onUpdateText,
  onAdd,
  onRemove,
  onOutcomeChange,
  className = '',
}) {
  return (
    <div className={`editable-decisions ${className}`.trim()}>
      <ul className="notebook-list notebook-list--check notebook-list--editable">
        {options.map((item) => (
          <li key={item.id} className="notebook-list-row">
            <label className="notebook-list-check">
              <input
                type="checkbox"
                checked={Boolean(item.checked)}
                onChange={() => onToggle?.(item.id)}
                disabled={readOnly}
                aria-label={item.text || 'Decision option'}
              />
              <textarea
                className="notebook-list-input editable-inline-input editable-decision-input"
                value={item.text}
                onChange={(e) => onUpdateText?.(item.id, e.target.value)}
                placeholder="Decision option..."
                rows={2}
                readOnly={readOnly}
              />
            </label>
            {!readOnly && (
              <ListRemoveButton
                label="Remove decision option"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(item.id);
                }}
              />
            )}
          </li>
        ))}
      </ul>
      {!readOnly && onAdd && (
        <ListAddButton onClick={onAdd}>+ Add option</ListAddButton>
      )}
      <PromptField
        label="What we decided"
        value={outcome}
        onChange={onOutcomeChange}
        placeholder="Record the decision you made today..."
        rows={3}
        className="decision-outcome"
        readOnly={readOnly}
      />
    </div>
  );
}
