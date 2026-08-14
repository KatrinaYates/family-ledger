import React from 'react';
import { TopicBand, ActionTable, ListAddButton } from '../content/NotebookPrimitives';
import {
  EditableChecklist as EditableChecklistView,
  EditableBulletList as EditableBulletListView,
  EditableDecisionList as EditableDecisionListView,
} from '../notebook/EditableLists';
import { useMeetingJson, useMeetingNotes } from '../../hooks/useMeetingField';
import { useMonthContext } from '../../context/MonthContext';
import { sectionNotesKey } from '../../utils/meetingKeys';
import { actionStatusFromLabel } from '../../utils/actionUtils';

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

function seedActionRows(rows) {
  return rows.map((row, index) => ({
    id: `seed-${index}`,
    action: row.action || row.title || '',
    owner: row.owner || '',
    dueDate: row.dueDate && row.dueDate !== 'TBD' ? row.dueDate : '',
    status: row.status ? actionStatusFromLabel(row.status) : 'not_started',
  }));
}

function seedBulletItems(seeds) {
  return seeds.map((entry, index) => {
    const text = typeof entry === 'string'
      ? entry
      : entry?.text ?? entry?.name ?? entry?.label ?? String(entry ?? '');
    return {
      id: `seed-${index}`,
      text,
    };
  });
}

function FieldSaveError({ message }) {
  if (!message) return null;
  return (
    <p className="field-save-error" role="alert">
      {message}
    </p>
  );
}

export function SectionNotes({ sectionId, label = 'Meeting notes' }) {
  const { monthId } = useMonthContext();
  const { value: notes, setValue: setNotes, isLocked, saveError } = useMeetingNotes(sectionNotesKey(monthId, sectionId));
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
      <FieldSaveError message={saveError} />
    </details>
  );
}

export function PersistedEditableChecklist({
  storageKey,
  seedItems = [],
  allowAdd = true,
  allowEdit = true,
  allowRemove = true,
}) {
  const { value: items, setValue: setItems, isLocked, saveError } = useMeetingJson(storageKey, () => seedChecklistItems(seedItems));

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
    <>
      <EditableChecklistView
        items={items}
        readOnly={isLocked}
        allowAdd={allowAdd}
        allowEdit={allowEdit}
        allowRemove={allowRemove}
        onToggle={toggle}
        onUpdateText={updateText}
        onAdd={addItem}
        onRemove={removeItem}
      />
      <FieldSaveError message={saveError} />
    </>
  );
}

/** @deprecated Use PersistedEditableChecklist — kept for existing page imports until migration. */
export function EditableChecklist(props) {
  return <PersistedEditableChecklist {...props} />;
}

export function PersistedEditableDecisionList({ storageKey, outcomeStorageKey, seedDecisions = [] }) {
  const { value: items, setValue: setItems, isLocked, saveError: listSaveError } = useMeetingJson(storageKey, () => seedChecklistItems(seedDecisions));
  const outcomeKey = outcomeStorageKey ?? `${storageKey}-outcome`;
  const { value: decision, setValue: setDecision, isLocked: isOutcomeLocked, saveError: outcomeSaveError } = useMeetingNotes(outcomeKey);
  const readOnly = isLocked || isOutcomeLocked;
  const saveError = listSaveError || outcomeSaveError;

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
    <>
      <EditableDecisionListView
        options={items}
        outcome={decision}
        readOnly={readOnly}
        onToggle={toggle}
        onUpdateText={updateText}
        onAdd={addOption}
        onRemove={removeOption}
        onOutcomeChange={setDecision}
      />
      <FieldSaveError message={saveError} />
    </>
  );
}

/** @deprecated Use PersistedEditableDecisionList */
export function EditableDecisionList(props) {
  return <PersistedEditableDecisionList {...props} />;
}

export function EditableActionPlan({ storageKey, seedRows = [] }) {
  const { value: rows, setValue: setRows, isLocked, saveError } = useMeetingJson(storageKey, () => seedActionRows(seedRows));

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: newId('action'), action: '', owner: '', dueDate: '', status: 'not_started' },
    ]);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="editable-action-plan">
      <ActionTable
        rows={rows}
        readOnly={isLocked}
        onUpdateRow={updateRow}
        onRemoveRow={removeRow}
      />
      {!isLocked && (
        <ListAddButton onClick={addRow}>+ Add action item</ListAddButton>
      )}
      <FieldSaveError message={saveError} />
    </div>
  );
}

export function PersistedEditableBulletList({ storageKey, seedItems = [], title }) {
  const { value: items, setValue: setItems, isLocked, saveError } = useMeetingJson(storageKey, () => seedBulletItems(seedItems));

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
    <>
      <EditableBulletListView
        items={items}
        readOnly={isLocked}
        title={title}
        onUpdateText={updateText}
        onAdd={addItem}
        onRemove={removeItem}
      />
      <FieldSaveError message={saveError} />
    </>
  );
}

/** @deprecated Use PersistedEditableBulletList */
export function EditableBulletList(props) {
  return <PersistedEditableBulletList {...props} />;
}

export function MeetingTopicBand({ storageKey, label, title, description, checks, icon, tone }) {
  return (
    <TopicBand label={label} title={title} description={description} icon={icon} tone={tone}>
      <PersistedEditableChecklist storageKey={storageKey} seedItems={checks} allowEdit={false} />
    </TopicBand>
  );
}

export function PageWithNotes({ sectionId, children }) {
  return (
    <div className="page-with-notes">
      <div className="page-with-notes-body">{children}</div>
      <SectionNotes sectionId={sectionId} />
    </div>
  );
}
