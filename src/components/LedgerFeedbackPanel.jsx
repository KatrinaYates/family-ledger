import React, { useEffect, useRef, useState } from 'react';
import { useMeetingNotes } from '../hooks/useMeetingField';
import { ledgerFeedbackKey } from '../utils/meetingKeys';
import './ledger-feedback-chapter.css';

const FEEDBACK_FIELDS = [
  { id: 'helpful', label: 'What was helpful?', placeholder: 'Sections, data, or prompts that worked...' },
  { id: 'repetitive', label: 'What felt repetitive?', placeholder: 'Skip or shorten next time...' },
  { id: 'missing', label: 'What was missing?', placeholder: 'Data or topics to add...' },
  { id: 'ideas', label: 'Ideas for the next ledger', placeholder: 'Layout, sections, or data you would change...' },
];

export const LEDGER_FEEDBACK_OPEN_EVENT = 'family-ledger:open-feedback';

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
  const [eventOpen, setEventOpen] = useState(false);
  const shouldOpen = Boolean(open || eventOpen);

  useEffect(() => {
    const handleOpen = () => setEventOpen(true);
    window.addEventListener(LEDGER_FEEDBACK_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(LEDGER_FEEDBACK_OPEN_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (shouldOpen && !dialog.open) {
      dialog.showModal();
    } else if (!shouldOpen && dialog.open) {
      dialog.close();
    }
  }, [shouldOpen]);

  if (!monthId) return null;

  const handleClose = () => {
    setEventOpen(false);
    onClose?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className="ledger-feedback-dialog"
      onClose={handleClose}
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

export function LedgerFeedbackButton({ onClick, className = '', variant = 'hidden' }) {
  if (variant !== 'chapter') return null;

  const handleClick = onClick ?? (() => {
    window.dispatchEvent(new CustomEvent(LEDGER_FEEDBACK_OPEN_EVENT));
  });

  return (
      <button type="button" className={`ledger-feedback-btn chapter-feedback-chip${className ? ` ${className}` : ""}`} onClick={handleClick}>
          ✎ Ledger feedback
      </button>
  );
}
