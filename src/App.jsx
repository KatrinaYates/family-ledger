import React, { useEffect, useMemo, useState } from 'react';
import { months, createBlankMonth } from './data/months';
import {
  BookCover,
  ComingSoon,
  EditableChecklist,
  MetricCard,
  MonthTabs,
  NotesField,
  PaperSection,
} from './components/LedgerComponents';

const STORAGE_PREFIX = 'family-ledger-2026-';

function loadMonth(monthId) {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${monthId}`);
    return saved ? { ...createBlankMonth(), ...JSON.parse(saved) } : createBlankMonth();
  } catch {
    return createBlankMonth();
  }
}

function MonthChapter({ month }) {
  const [data, setData] = useState(() => loadMonth(month.id));

  useEffect(() => {
    setData(loadMonth(month.id));
  }, [month.id]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}${month.id}`, JSON.stringify(data));
  }, [month.id, data]);

  function updateField(field, value) {
    setData((current) => ({ ...current, [field]: value }));
  }

  function resetMonth() {
    if (!window.confirm(`Clear all saved notes for ${month.label}?`)) return;
    const blank = createBlankMonth();
    setData(blank);
    localStorage.removeItem(`${STORAGE_PREFIX}${month.id}`);
  }

  return (
    <section className="chapter" aria-live="polite">
      <div className="chapter-heading">
        <div>
          <p className="eyebrow">{month.chapter}</p>
          <h2>{month.title}</h2>
          <p>Review the month, capture decisions, and leave with a realistic plan.</p>
        </div>
        <button className="text-button" type="button" onClick={resetMonth}>Reset {month.label} notes</button>
      </div>

      <section className="snapshot-grid" aria-label="Monthly snapshot">
        <MetricCard label="Financial pulse" tone="yellow" value={data.overallScore} onChange={(value) => updateField('overallScore', value)} placeholder="Steady" />
        <MetricCard label="Biggest win" tone="pink" value={data.biggestWin} onChange={(value) => updateField('biggestWin', value)} multiline placeholder="What went especially well?" />
        <MetricCard label="Biggest challenge" tone="blue" value={data.biggestChallenge} onChange={(value) => updateField('biggestChallenge', value)} multiline placeholder="What made the month harder?" />
      </section>

      <div className="section-grid">
        <PaperSection number="01" title="What happened?" subtitle="Facts first. No guilt, no spin.">
          <NotesField value={data.monthStory} onChange={(value) => updateField('monthStory', value)} placeholder="Summarize the month in plain language..." />
        </PaperSection>

        <PaperSection number="02" title="Patterns we noticed" subtitle="Good, bad, surprising, or worth watching.">
          <NotesField value={data.patterns} onChange={(value) => updateField('patterns', value)} placeholder="Example: Eating out climbed during busy work weeks..." />
        </PaperSection>

        <PaperSection number="03" title="Decisions we made" subtitle="The living record for next month." fullWidth>
          <EditableChecklist items={data.decisions} onChange={(items) => updateField('decisions', items)} inputLabel="Add a decision or commitment" buttonLabel="Add decision" />
        </PaperSection>

        <PaperSection number="04" title="Next best moves" subtitle="Keep it small enough to actually happen." fullWidth>
          <EditableChecklist items={data.actions} onChange={(items) => updateField('actions', items)} inputLabel="Add an action item" buttonLabel="Add action" />
        </PaperSection>

        <PaperSection title="What do we want future-us to remember?" fullWidth className="closing-note">
          <p className="eyebrow">Close the chapter</p>
          <NotesField value={data.futureUs} onChange={(value) => updateField('futureUs', value)} placeholder="A note for the next meeting..." rows={5} />
        </PaperSection>
      </div>
    </section>
  );
}

export default function App() {
  const [activeMonthId, setActiveMonthId] = useState('july');
  const activeMonth = useMemo(() => months.find((month) => month.id === activeMonthId) ?? months[0], [activeMonthId]);

  return (
    <main className="app-shell">
      <BookCover monthLabel={activeMonth.label} />
      <MonthTabs months={months} activeMonth={activeMonthId} onSelect={(month) => setActiveMonthId(month.id)} />
      {activeMonth.status === 'locked' ? <ComingSoon month={activeMonth} /> : <MonthChapter month={activeMonth} />}
      <footer><p>Saved automatically in this browser · Phase 2 component foundation</p></footer>
    </main>
  );
}
