import React, { useState } from 'react';
import { useMeetingJson } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';

const CLASSIFICATIONS = ['Planned', 'Unplanned', 'One-time'];

function NotableRow({ item, saved, onUpdate, isLocked }) {
  const [expanded, setExpanded] = useState(false);
  const hint = [item.category, saved.classification || item.classification].filter(Boolean).join(' · ');

  return (
    <li className="spending-notable-row">
      <div className="spending-notable-row-main">
        <span className="spending-notable-name">{item.name}</span>
        <span className="spending-notable-amount">{item.amount}</span>
      </div>
      {hint && <p className="spending-notable-hint">{hint}</p>}
      {saved.note && !expanded ? (
        <div className="spending-inline-note">
          <span>{saved.note}</span>
          {!isLocked && (
            <button type="button" className="notebook-link-btn" onClick={() => setExpanded(true)}>
              Edit note
            </button>
          )}
        </div>
      ) : !expanded ? (
        <button
          type="button"
          className="notebook-link-btn"
          onClick={() => setExpanded(true)}
          disabled={isLocked}
        >
          Add note
        </button>
      ) : (
        <div className="spending-notable-expand">
          <div className="spending-notable-classifications" role="group" aria-label="Classification">
            {CLASSIFICATIONS.map((option) => (
              <label key={option} className="spending-notable-chip">
                <input
                  type="radio"
                  name={`notable-${item.id}`}
                  checked={saved.classification === option}
                  onChange={() => onUpdate({ classification: option })}
                  disabled={isLocked}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <textarea
            className="inline-notes-area spending-inline-input"
            value={saved.note}
            onChange={(e) => onUpdate({ note: e.target.value })}
            placeholder="Optional note..."
            rows={2}
            readOnly={isLocked}
            aria-readonly={isLocked}
            autoFocus
          />
        </div>
      )}
    </li>
  );
}

export function NotableSpending({ notableSpending, monthId }) {
  if (!notableSpending) return null;

  const storageKey = sectionFieldKey(monthId, 'spending', 'notable-notes');
  const seedFactory = () => (
    (notableSpending.items ?? []).map((item) => ({
      id: item.id,
      classification: item.classification ?? '',
      note: item.note ?? '',
    }))
  );
  const { value: notes, setValue: setNotes, isLocked } = useMeetingJson(storageKey, seedFactory);

  const noteFor = (id) => notes.find((entry) => entry.id === id) ?? { classification: '', note: '' };

  const updateNote = (id, patch) => {
    setNotes((prev) => {
      const existing = prev.find((entry) => entry.id === id);
      if (existing) {
        return prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
      }
      return [...prev, { id, classification: '', note: '', ...patch }];
    });
  };

  return (
    <section className="spending-block" aria-label="Notable one-time spending">
      <h2 className="month-snapshot-section-heading">Notable One-Time Spending</h2>
      <div className="paper-surface spending-panel-surface">
        {notableSpending.hasItems ? (
          <ul className="spending-notable-list">
            {notableSpending.items.map((item) => (
              <NotableRow
                key={item.id}
                item={item}
                saved={noteFor(item.id)}
                onUpdate={(patch) => updateNote(item.id, patch)}
                isLocked={isLocked}
              />
            ))}
          </ul>
        ) : (
          <p className="panel-note">{notableSpending.emptyMessage}</p>
        )}
      </div>
    </section>
  );
}
