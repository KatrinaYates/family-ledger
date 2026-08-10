import React, { useEffect, useRef } from 'react';
import { useMeetingNotes } from '../hooks/useMeetingField';
import { ledgerFeedbackKey } from '../utils/meetingKeys';

const FEEDBACK_FIELDS = [
  { id: 'helpful', label: 'What was helpful?', placeholder: 'Sections, data, or prompts that worked...' },
  { id: 'repetitive', label: 'What felt repetitive?', placeholder: 'Skip or shorten next time...' },
  { id: 'missing', label: 'What was missing?', placeholder: 'Data or topics to add...' },
  { id: 'ideas', label: 'Ideas for the next ledger', placeholder: 'Layout, sections, or data you would change...' },
];

function FeedbackField({ monthId, field }) {
  const { value, setValue, isLocked, saveError } = useMeetingNotes(
    ledgerFeedbackKey(monthId, field.id),
  );

  return (
    <label className="prompt-field ledger-feedback-field">
      <span className="prompt-field-label">{field.label}</span>
      <textarea
        className="inline-notes-area"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={field.placeholder}
        rows={field.id === 'ideas' ? 4 : 3}
        readOnly={isLocked}
      />
      {saveError && <p className="field-save-error" role="alert">{saveError}</p>}
    </label>
  );
}

export function LedgerFeedbackPanel({ monthId, monthLabel, open, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!monthId) return null;

  return (
    <dialog
      ref={dialogRef}
      className="ledger-feedback-dialog"
      onClose={onClose}
      aria-labelledby="ledger-feedback-title"
    >
      <form method="dialog" className="ledger-feedback-form">
        <header className="ledger-feedback-header">
          <h2 id="ledger-feedback-title">Ledger feedback</h2>
          <p className="panel-note">
            Help future-us improve this ledger for {monthLabel || 'this month'}.
          </p>
        </header>
        <div className="ledger-feedback-fields">
          {FEEDBACK_FIELDS.map((field) => (
            <FeedbackField key={field.id} monthId={monthId} field={field} />
          ))}
        </div>
        <footer className="ledger-feedback-footer">
          <button type="submit" className="meeting-add-btn">Done</button>
        </footer>
      </form>
    </dialog>
  );
}

export function LedgerFeedbackButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`ledger-feedback-btn${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      💬 Ledger feedback
    </button>
  );
}
