import React from 'react';
import { ListAddButton, ListRemoveButton } from '../content/NotebookPrimitives';
import { DecorativeStickyNote } from '../notebook';
import { useMeetingJson } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';

function newComingUpId() {
  return `cu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedComingUpItems(seeds = []) {
  return seeds.map((item, index) => ({
    id: item.id ?? `seed-${index}`,
    title: item.title ?? '',
    amount: item.amount ?? '',
    date: item.date ?? '',
    context: item.context ?? '',
  }));
}

function ComingUpReadOnlyList({ items }) {
  if (!items.length) {
    return <p>Nothing major on the horizon.</p>;
  }

  return (
    <ul className="future-coming-list">
      {items.map((item) => (
        <li key={item.id} className="future-coming-item">
          <span className="future-coming-title">{item.title}</span>
          {item.amount && (
            <strong className="future-coming-amount">{item.amount}</strong>
          )}
          {(item.date || item.context) && (
            <span className="future-coming-meta">
              {[item.date, item.context].filter(Boolean).join(' · ')}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function ComingUpEditableList({ items, onItemsChange, saveError }) {
  const updateItem = (id, patch) => {
    onItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onItemsChange((prev) => [
      ...prev,
      { id: newComingUpId(), title: '', amount: '', date: '', context: '' },
    ]);
  };

  const removeItem = (id) => {
    onItemsChange((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      {items.length > 0 ? (
        <ul className="future-coming-list">
          {items.map((item) => (
            <li key={item.id} className="future-coming-item future-coming-item--editable">
              <input
                type="text"
                className="notebook-list-input editable-inline-input future-coming-title-input"
                value={item.title}
                onChange={(e) => updateItem(item.id, { title: e.target.value })}
                placeholder="What's coming up?"
              />
              <input
                type="text"
                className="notebook-list-input editable-inline-input future-coming-amount-input"
                value={item.amount}
                onChange={(e) => updateItem(item.id, { amount: e.target.value })}
                placeholder="Amount"
              />
              <input
                type="text"
                className="notebook-list-input editable-inline-input future-coming-date-input"
                value={item.date}
                onChange={(e) => updateItem(item.id, { date: e.target.value })}
                placeholder="When"
              />
              <input
                type="text"
                className="notebook-list-input editable-inline-input future-coming-context-input"
                value={item.context}
                onChange={(e) => updateItem(item.id, { context: e.target.value })}
                placeholder="Notes"
              />
              <ListRemoveButton
                label="Remove item"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="future-coming-empty">Add milestones, expenses, or plans on the horizon.</p>
      )}
      <ListAddButton onClick={addItem}>+ Add to coming up</ListAddButton>
      {saveError && (
        <p className="field-save-error" role="alert">{saveError}</p>
      )}
    </>
  );
}

/** @param {{ comingUpLabel?: string, comingUp?: Array<object>, monthId: string }} props */
export function FutureComingUp({ comingUpLabel, comingUp, monthId }) {
  const storageKey = sectionFieldKey(monthId, 'future', 'coming-up');
  const { value: items, setValue: setItems, isLocked, saveError } = useMeetingJson(
    storageKey,
    () => seedComingUpItems(comingUp),
  );

  const visibleItems = items.filter((item) => item.title?.trim());

  return (
    <section className="future-coming-up" aria-label={comingUpLabel}>
      <DecorativeStickyNote
        tone="blue"
        title={comingUpLabel}
        fill
        className={visibleItems.length === 0 && isLocked ? 'is-empty' : ''}
      >
        {isLocked ? (
          <ComingUpReadOnlyList items={visibleItems} />
        ) : (
          <ComingUpEditableList
            items={items}
            onItemsChange={setItems}
            saveError={saveError}
          />
        )}
      </DecorativeStickyNote>
    </section>
  );
}
