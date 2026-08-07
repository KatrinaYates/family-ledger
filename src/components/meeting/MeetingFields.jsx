import React from 'react';
import { useMeetingJson, useMeetingNotes } from '../../hooks/useMeetingField';
import { useMonthContext } from '../../context/MonthContext';
import { pageNotesKey } from '../../utils/meetingKeys';

function newId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedChecklistItems(seeds) {
  return seeds.map((text, index) => ({
    id: `seed-${index}`,
    text,
    checked: false,
  }));
}

function seedQuestionItems(seeds) {
  return seeds.map((question, index) => ({
    id: `seed-${index}`,
    question,
    answer: '',
  }));
}

function seedActionRows(rows) {
  return rows.map((row, index) => ({
    id: `seed-${index}`,
    action: row.action || '',
    owner: row.owner || '',
    dueDate: row.dueDate || '',
    status: row.status || 'Not started',
  }));
}

function seedBulletItems(seeds) {
  return seeds.map((text, index) => ({
    id: `seed-${index}`,
    text,
  }));
}

export function SectionNotes({ pageId, label = 'Meeting notes' }) {
  const { monthId } = useMonthContext();
  const [notes, setNotes, isLocked] = useMeetingNotes(pageNotesKey(monthId, pageId));
  const hasNotes = notes.trim().length > 0;

  return (
    <details className="section-notes-panel" defaultOpen={hasNotes}>
      <summary className="section-notes-label">
        {label}
        {hasNotes && <span className="section-notes-indicator">Has notes</span>}
      </summary>
      <textarea
        className="inline-notes-area section-notes-area"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Quick notes..."
        rows={3}
        readOnly={isLocked}
        aria-readonly={isLocked}
      />
    </details>
  );
}

export function EditableChecklist({
  storageKey,
  seedItems = [],
  allowAdd = true,
  allowEdit = true,
  allowRemove = true,
}) {
  const [items, setItems, isLocked] = useMeetingJson(storageKey, () => seedChecklistItems(seedItems));

  const toggle = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const updateText = (id, text) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: newId('check'), text: '', checked: false }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="editable-checklist">
      <ul className="decision-checklist">
        {items.map((item) => (
          <li key={item.id}>
            <label className="editable-checklist-row">
              <input
                type="checkbox"
                checked={Boolean(item.checked)}
                onChange={() => toggle(item.id)}
                disabled={isLocked}
                aria-label={item.text || 'Checklist item'}
              />
              {allowEdit ? (
                <input
                  type="text"
                  className="editable-inline-input"
                  value={item.text}
                  onChange={(e) => updateText(item.id, e.target.value)}
                  placeholder="Add item..."
                  readOnly={isLocked}
                />
              ) : (
                <span>{item.text}</span>
              )}
            </label>
            {allowRemove && !isLocked && (
              <button
                type="button"
                className="meeting-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                aria-label="Remove item"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      {allowAdd && !isLocked && (
        <button type="button" className="meeting-add-btn" onClick={addItem}>
          + Add item
        </button>
      )}
    </div>
  );
}

export function EditableQuestions({ storageKey, seedQuestions = [] }) {
  const [items, setItems, isLocked] = useMeetingJson(storageKey, () => seedQuestionItems(seedQuestions));

  const updateAnswer = (id, answer) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, answer } : item)));
  };

  const updateQuestion = (id, question) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, question } : item)));
  };

  const addQuestion = () => {
    setItems((prev) => [...prev, { id: newId('q'), question: '', answer: '' }]);
  };

  const removeQuestion = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="editable-questions">
      {items.map((item, index) => (
        <div className="editable-question" key={item.id}>
          <label className="editable-question-label">
            <span>Question {index + 1}</span>
            <input
              type="text"
              className="editable-inline-input"
              value={item.question}
              onChange={(e) => updateQuestion(item.id, e.target.value)}
              placeholder="What do we need to discuss?"
              readOnly={isLocked}
            />
          </label>
          <textarea
            className="inline-notes-area"
            value={item.answer}
            onChange={(e) => updateAnswer(item.id, e.target.value)}
            placeholder="Your answer or notes..."
            rows={2}
            readOnly={isLocked}
          />
          {!isLocked && (
            <button
              type="button"
              className="meeting-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeQuestion(item.id);
              }}
              aria-label="Remove question"
            >
              Remove question
            </button>
          )}
        </div>
      ))}
      {!isLocked && (
        <button type="button" className="meeting-add-btn" onClick={addQuestion}>
          + Add question
        </button>
      )}
    </div>
  );
}

export function EditableDecisionList({ storageKey, seedDecisions = [] }) {
  const [items, setItems, isLocked] = useMeetingJson(storageKey, () => seedChecklistItems(seedDecisions));
  const [decision, setDecision, isOutcomeLocked] = useMeetingNotes(`${storageKey}-outcome`);
  const readOnly = isLocked || isOutcomeLocked;

  const toggle = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const addOption = () => {
    setItems((prev) => [...prev, { id: newId('dec'), text: '', checked: false }]);
  };

  const updateText = (id, text) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const removeOption = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="editable-decisions">
      <ul className="decision-checklist">
        {items.map((item) => (
          <li key={item.id}>
            <label className="editable-checklist-row">
              <input
                type="checkbox"
                checked={Boolean(item.checked)}
                onChange={() => toggle(item.id)}
                disabled={readOnly}
                aria-label={item.text || 'Decision option'}
              />
              <input
                type="text"
                className="editable-inline-input"
                value={item.text}
                onChange={(e) => updateText(item.id, e.target.value)}
                placeholder="Decision option..."
                readOnly={readOnly}
              />
            </label>
            {!readOnly && (
              <button
                type="button"
                className="meeting-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(item.id);
                }}
                aria-label="Remove decision option"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <button type="button" className="meeting-add-btn" onClick={addOption}>
          + Add option
        </button>
      )}
      <label className="prompt-field decision-outcome">
        <span className="prompt-field-label">What we decided</span>
        <textarea
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="Record the decision you made today..."
          rows={3}
          readOnly={readOnly}
        />
      </label>
    </div>
  );
}

export function EditableActionPlan({ storageKey, seedRows = [] }) {
  const [rows, setRows, isLocked] = useMeetingJson(storageKey, () => seedActionRows(seedRows));

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: newId('action'), action: '', owner: '', dueDate: '', status: 'Not started' },
    ]);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

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
        {rows.map((row) => (
          <div className="action-row editable" key={row.id}>
            <input
              type="text"
              className="editable-cell-input"
              value={row.action}
              onChange={(e) => updateRow(row.id, 'action', e.target.value)}
              placeholder="What needs to happen?"
              readOnly={isLocked}
            />
            <input
              type="text"
              className="editable-cell-input"
              value={row.owner}
              onChange={(e) => updateRow(row.id, 'owner', e.target.value)}
              placeholder="Owner"
              readOnly={isLocked}
            />
            <input
              type="text"
              className="editable-cell-input"
              value={row.dueDate}
              onChange={(e) => updateRow(row.id, 'dueDate', e.target.value)}
              placeholder="Due date"
              readOnly={isLocked}
            />
            <select
              className="editable-cell-input"
              value={row.status}
              onChange={(e) => updateRow(row.id, 'status', e.target.value)}
              disabled={isLocked}
            >
              <option>Not started</option>
              <option>In progress</option>
              <option>Done</option>
              <option>Deferred</option>
            </select>
            {!isLocked && (
              <button
                type="button"
                className="meeting-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeRow(row.id);
                }}
                aria-label="Remove action item"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {!isLocked && (
        <button type="button" className="meeting-add-btn" onClick={addRow}>
          + Add action item
        </button>
      )}
    </div>
  );
}

export function EditableBulletList({ storageKey, seedItems = [], title }) {
  const [items, setItems, isLocked] = useMeetingJson(storageKey, () => seedBulletItems(seedItems));

  const updateText = (id, text) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: newId('bullet'), text: '' }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="editable-bullet-list">
      {title && <h3>{title}</h3>}
      <ul className="editable-bullet-items">
        {items.map((item) => (
          <li key={item.id}>
            <input
              type="text"
              className="editable-inline-input"
              value={item.text}
              onChange={(e) => updateText(item.id, e.target.value)}
              placeholder="Add item..."
              readOnly={isLocked}
            />
            {!isLocked && (
              <button
                type="button"
                className="meeting-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                aria-label="Remove item"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      {!isLocked && (
        <button type="button" className="meeting-add-btn" onClick={addItem}>
          + Add item
        </button>
      )}
    </div>
  );
}

export function MeetingEmergencyBand({ storageKey, label, title, description, checks }) {
  return (
    <section className="paper-surface emergency-band">
      <div>
        <span className="sticky-card-label">{label}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <EditableChecklist storageKey={storageKey} seedItems={checks} allowEdit={false} />
    </section>
  );
}

export function PageWithNotes({ pageId, children }) {
  return (
    <div className="page-with-notes">
      <div className="page-with-notes-body">{children}</div>
      <SectionNotes pageId={pageId} />
    </div>
  );
}
