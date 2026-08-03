import React, { useState } from 'react';

export function BookCover({ monthLabel }) {
  return (
    <header className="book-cover" aria-labelledby="app-title">
      <p className="eyebrow">Yates Family · 2026</p>
      <h1 id="app-title">The Family Ledger</h1>
      <p className="cover-copy">A living record of where our money went, what we learned, and what we decided together.</p>
      <div className="cover-stamp">{monthLabel} Chapter</div>
    </header>
  );
}

export function MonthTabs({ months, activeMonth, onSelect }) {
  return (
    <nav className="month-tabs" aria-label="Ledger chapters">
      {months.map((month) => (
        <button
          key={month.id}
          className={`month-tab ${activeMonth === month.id ? 'active' : ''} ${month.status === 'locked' ? 'locked' : ''}`}
          onClick={() => onSelect(month)}
          aria-current={activeMonth === month.id ? 'page' : undefined}
        >
          {month.label}
          {month.teaser && <span>{month.teaser}</span>}
        </button>
      ))}
    </nav>
  );
}

export function MetricCard({ label, tone, value, onChange, multiline = false, placeholder }) {
  const fieldProps = { value, onChange: (event) => onChange(event.target.value), placeholder, 'aria-label': label };
  return (
    <article className={`metric-card accent-${tone}`}>
      <label>{label}</label>
      {multiline ? <textarea rows="2" {...fieldProps} /> : <input {...fieldProps} />}
    </article>
  );
}

export function PaperSection({ number, title, subtitle, children, fullWidth = false, className = '' }) {
  return (
    <section className={`paper-card ${fullWidth ? 'full-width' : ''} ${className}`}>
      <div className="section-title">
        {number && <span className="section-number">{number}</span>}
        <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
      </div>
      {children}
    </section>
  );
}

export function NotesField({ value, onChange, placeholder, rows = 9 }) {
  return <textarea className="lined-notes" value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} />;
}

export function EditableChecklist({ items, onChange, inputLabel, buttonLabel }) {
  const [draft, setDraft] = useState('');

  function addItem(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onChange([...items, { id: crypto.randomUUID(), text, complete: false }]);
    setDraft('');
  }

  function updateItem(id, patch) {
    onChange(items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  return (
    <>
      <div className="checklist">
        {items.length === 0 && <p className="empty-state">Nothing added yet. Keep it realistic and specific.</p>}
        {items.map((item) => (
          <div className="checklist-item" key={item.id}>
            <input type="checkbox" checked={item.complete} onChange={(event) => updateItem(item.id, { complete: event.target.checked })} aria-label={`Complete ${item.text}`} />
            <input className={item.complete ? 'completed' : ''} value={item.text} onChange={(event) => updateItem(item.id, { text: event.target.value })} />
            <button type="button" className="delete-button" onClick={() => onChange(items.filter((candidate) => candidate.id !== item.id))} aria-label={`Delete ${item.text}`}>×</button>
          </div>
        ))}
      </div>
      <form className="add-row" onSubmit={addItem}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={inputLabel} aria-label={inputLabel} />
        <button type="submit">{buttonLabel}</button>
      </form>
    </>
  );
}

export function ComingSoon({ month }) {
  return (
    <section className="chapter coming-soon">
      <p className="eyebrow">{month.chapter}</p>
      <h2>{month.title}</h2>
      <p>This chapter is tucked away until it is time to fill it with real numbers, notes, and decisions.</p>
      <div className="sparkle">✦</div>
    </section>
  );
}
