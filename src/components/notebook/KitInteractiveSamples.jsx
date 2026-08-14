import React, { useState } from 'react';
import {
  ActionTable,
  ExpandableContextNote,
  MonthLockPanel,
  NOTEBOOK_SYMBOLS,
  PromptActionPanel,
  PromptField,
  QuestionList,
} from '../content/NotebookPrimitives';
import {
  EditableBulletList,
  EditableChecklist,
  EditableDecisionList,
} from './EditableLists';

export function KitChecklistSample() {
  const [items, setItems] = useState([
    { id: '1', text: 'Pause emergency fund at $1,000', checked: true },
    { id: '2', text: 'Review subscription list in August', checked: false },
  ]);

  return (
    <EditableChecklist
      items={items}
      onToggle={(id) => setItems((prev) => prev.map((item) => (
        item.id === id ? { ...item, checked: !item.checked } : item
      )))}
      onUpdateText={(id, text) => setItems((prev) => prev.map((item) => (
        item.id === id ? { ...item, text } : item
      )))}
      onAdd={() => setItems((prev) => [...prev, { id: String(Date.now()), text: '', checked: false }])}
      onRemove={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
    />
  );
}

export function KitBulletListSample() {
  const [items, setItems] = useState([
    { id: '1', text: 'Reimbursement pending from work' },
    { id: '2', text: 'Summer camp deposit timing' },
  ]);

  return (
    <EditableBulletList
      items={items}
      onUpdateText={(id, text) => setItems((prev) => prev.map((item) => (
        item.id === id ? { ...item, text } : item
      )))}
      onAdd={() => setItems((prev) => [...prev, { id: String(Date.now()), text: '' }])}
      onRemove={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
    />
  );
}

export function KitQuestionListSample() {
  const [items, setItems] = useState([
    { id: '1', question: 'Do we still want to stop the emergency fund at $1,000?', answer: '' },
    { id: '2', question: 'Should we raise the kids\' monthly transfer?', answer: 'Maybe by $20 in September.' },
  ]);

  return (
    <QuestionList editable items={items} onItemsChange={setItems} />
  );
}

export function KitActionTableSample() {
  const [rows, setRows] = useState([
    { id: '1', action: 'Cancel unused streaming trial', owner: 'Person A', dueDate: '2026-08-15', status: 'not_started' },
    { id: '2', action: 'Move $50 to kids savings', owner: 'Both', dueDate: '2026-08-01', status: 'done' },
  ]);

  return (
    <div className="editable-action-plan">
      <ActionTable rows={rows} onUpdateRow={(id, field, value) => {
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
      }} onRemoveRow={(id) => setRows((prev) => prev.filter((row) => row.id !== id))}
      />
    </div>
  );
}

export function KitDecisionListSample() {
  const [options, setOptions] = useState([
    { id: '1', text: 'Pay extra on highest-rate card', checked: true },
    { id: '2', text: 'Pause kids transfer one month', checked: false },
  ]);
  const [outcome, setOutcome] = useState('');

  return (
    <EditableDecisionList
      options={options}
      outcome={outcome}
      onToggle={(id) => setOptions((prev) => prev.map((item) => (
        item.id === id ? { ...item, checked: !item.checked } : item
      )))}
      onUpdateText={(id, text) => setOptions((prev) => prev.map((item) => (
        item.id === id ? { ...item, text } : item
      )))}
      onAdd={() => setOptions((prev) => [...prev, { id: String(Date.now()), text: '', checked: false }])}
      onRemove={(id) => setOptions((prev) => prev.filter((item) => item.id !== id))}
      onOutcomeChange={setOutcome}
    />
  );
}

export function KitPromptFieldSample() {
  const [value, setValue] = useState('Maybe a dinner out to celebrate hitting the starter fund milestone.');
  return (
    <PromptField
      label="Family reward"
      value={value}
      onChange={setValue}
      placeholder="How should we celebrate this month?"
    />
  );
}

export function KitExpandableContextSample() {
  const [value, setValue] = useState('Back-to-school supply runs drove most of the increase.');
  return <ExpandableContextNote value={value} onChange={setValue} />;
}

export function KitPromptActionSample() {
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  return (
    <PromptActionPanel
      title="Ask the financial advisor"
      lead="Prepare a question about your current situation."
      value={question}
      onChange={setQuestion}
      placeholder="Can we afford back-porch furniture without hurting our debt payoff plan?"
      primaryLabel="Ask the financial advisor →"
      onPrimaryClick={() => {}}
      secondaryLabel={copied ? 'Copied!' : 'Copy prepared prompt'}
      onSecondaryClick={() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    />
  );
}

export function KitMonthLockSample() {
  const [confirming, setConfirming] = useState(false);
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePrimary = () => {
    if (locked) {
      setLocked(false);
      setConfirming(false);
      return;
    }
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setConfirming(false);
      setLocked(true);
    }, 400);
  };

  return (
    <MonthLockPanel
      monthLabel="July"
      status={locked ? 'locked' : 'unlocked'}
      lockedAt={locked ? '2026-08-01T14:30:00' : null}
      confirming={confirming}
      saving={saving}
      onPrimaryClick={handlePrimary}
      onCancelClick={() => setConfirming(false)}
    />
  );
}

/** Static preview of MonthLockStatus badge visuals (no workflow hook). */
export function KitLockStatusPreview() {
  const badges = [
    { key: 'draft', label: 'July', icon: NOTEBOOK_SYMBOLS.edit },
    { key: 'meeting_ready', label: 'July', icon: NOTEBOOK_SYMBOLS.ready },
    { key: 'locked', label: 'July', icon: NOTEBOOK_SYMBOLS.lock },
  ];

  return (
    <div className="notebook-kit-lock-status-row">
      {badges.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          className={`month-lock-status is-badge is-${key}`}
          tabIndex={-1}
          aria-label={`${label}: ${key}`}
        >
          <span className="month-lock-status-icon notebook-symbol" aria-hidden="true">{icon}</span>
          <span className="month-lock-status-month">{label}</span>
        </button>
      ))}
    </div>
  );
}
