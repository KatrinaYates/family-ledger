import React, { useState } from 'react';
import { PanelSurface, SectionBlock } from '../notebook';
import { useMeetingJson } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';

const CLASSIFICATIONS = ['Planned', 'Unplanned', 'One-time'];

function NotableRow({ item, saved, onUpdate, isLocked }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="spending-notable-row">
      <div className="spending-notable-row-main">
        <span className="spending-notable-name">{item.name}</span>
        <span className="spending-notable-amount">{item.amount}</span>
      </div>
      {item.category && (
        <p className="spending-notable-category">{item.category}</p>
      )}
      {item.context && (
        <p className="spending-notable-context">{item.context}</p>
      )}
      {item.metadata && (
        <p className="spending-notable-metadata">{item.metadata}</p>
      )}
      {saved.note && !expanded ? (
        <div className="spending-inline-note">
          <span>{saved.note}</span>
          {!isLocked && (
            <button type="button" className="notebook-link-btn" onClick={() => setExpanded(true)}>
              Edit context
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
          Add our context
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
            placeholder="Our context..."
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
      classification: '',
      note: '',
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
    <SectionBlock label="Big Purchases & One-Time Spending" className="spending-notable">
      <PanelSurface>
        <p className="panel-note spending-block-intro">
          Large expenses that materially shaped the month, excluding normal recurring obligations.
        </p>
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
      </PanelSurface>
    </SectionBlock>
  );
}
