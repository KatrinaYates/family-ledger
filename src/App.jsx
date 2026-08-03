import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { months } from './data/months';
import {
  AnnualCover,
  InsideCover,
  KpiCard,
  MonthChapterPage,
  NotebookShell,
  NoteCard,
  PageControls,
  SectionDivider,
  WorkingPage,
  WritingArea,
  sectionTabs,
} from './components/LedgerComponents';

const sections = {
  snapshot:{number:'01',title:'Financial Snapshot',description:'A quick read on where our financial life stands.',inside:'Net worth • Cash • Emergency fund • Retirement • Debt • Health score',how:'Start with the big picture before diving into details.',prompt:'What changed most this month?',noteTone:'blue',tone:'teal',icon:'📈'},
  story:{number:'02',title:'Monthly Story',description:'Turn the numbers into a shared story about the month.',inside:'What happened • Patterns • Context • Surprises',how:'Describe the month without blame or over-explaining.',prompt:'What would the numbers miss?',noteTone:'green',tone:'green',icon:'✍️'},
  spending:{number:'03',title:'Spending',description:'See where money flowed and what deserves attention.',inside:'Categories • Trends • unusual charges • subscriptions',how:'Look for patterns, not tiny imperfections.',prompt:'What spending felt worth it?',noteTone:'yellow',tone:'yellow',icon:'🛍️'},
  cfo:{number:'04',title:'CFO Recommendations',description:'Prioritized financial recommendations based on the full picture.',inside:'Best next move • risks • opportunities • tradeoffs',how:'Choose fewer, higher-impact moves.',prompt:'What creates the most relief?',noteTone:'coral',tone:'coral',icon:'💡'},
  future:{number:'05',title:'Retirement & Future',description:'Connect this month’s choices to the life we are building.',inside:'Retirement • goals • education • long-term planning',how:'Balance future progress with real life today.',prompt:'What does future-us need?',noteTone:'lav',tone:'lav',icon:'🌱'},
  meeting:{number:'06',title:'Money Meeting',description:'A guided space for the conversation itself.',inside:'Prompts • notes • decisions • open questions',how:'Talk like teammates. Capture what matters.',prompt:'Curiosity over criticism. ♡',noteTone:'blue',tone:'blue',icon:'💬'},
  actions:{number:'07',title:'Action Plan',description:'Turn insight into a realistic set of next moves.',inside:'Owners • due dates • priorities • carryovers',how:'Make every action specific and small enough to finish.',prompt:'Tiny steps still count.',noteTone:'pink',tone:'pink',icon:'✅'},
  celebrate:{number:'08',title:'Celebrate',description:'Pause long enough to notice the progress we made.',inside:'Wins • gratitude • milestones • proud moments',how:'Celebrate effort and direction, not only perfect results.',prompt:'We are building this together!',noteTone:'green',tone:'green',icon:'🎉'},
  handoff:{number:'09',title:'CFO Handoff',description:'Leave a clean record for next month and future-us.',inside:'Carryovers • reminders • watch items • next-month context',how:'Write what we will be glad to remember later.',prompt:'What should August know?',noteTone:'blue',tone:'slate',icon:'✉️'},
};

const sectionIds = sectionTabs.map(([id]) => id);

function buildJulyPages() {
  return [
    { id: 'cover', type: 'cover', label: 'Front Cover' },
    { id: 'inside', type: 'inside', label: 'Inside Cover' },
    { id: 'july', type: 'month', monthId: 'july', label: 'July Chapter' },
    ...sectionIds.flatMap((sectionId) => [
      { id: `july-${sectionId}`, type: 'divider', monthId: 'july', sectionId, label: sections[sectionId].title },
      { id: `july-${sectionId}-work`, type: 'working', monthId: 'july', sectionId, label: `${sections[sectionId].title} Working Page` },
    ]),
  ];
}

const julyPages = buildJulyPages();

function SnapshotContent(){return <><div className="kpi-grid"><KpiCard icon="📈" label="Net Worth" value="$108,240" status="Growing" note="Up $4,390 since June."/><KpiCard icon="💵" label="Cash" value="$14,620" status="Healthy" note="Comfortable month-end cushion."/><KpiCard icon="🛟" label="Emergency Fund" value="3.8 mo" status="On track" note="Next milestone: four months."/><KpiCard icon="🏡" label="Debt" value="$42,180" status="Focus" tone="watch" note="Down $1,260 this month."/></div><div className="working-grid"><NoteCard title="What the numbers are saying"><p>The overall picture is moving in the right direction. Debt decreased, savings held steady, and the month stayed manageable without feeling overly restricted.</p></NoteCard><NoteCard title="This month’s pulse"><div className="progress-label"><span>Financial health</span><b>78%</b></div><div className="highlighter"><span style={{width:'78%'}}/></div><p>Stable, improving, and ready for one focused next move.</p></NoteCard></div></>}

function isTypingTarget(target) {
  return target instanceof HTMLElement && (
    target.matches('input, textarea, select, [contenteditable="true"]') ||
    Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
  );
}

function pageFromHash() {
  const id = window.location.hash.replace('#/', '');
  return julyPages.some((page) => page.id === id) ? id : 'cover';
}

export default function App(){
  const [pageId,setPageId]=useState(pageFromHash);
  const [activeMonth,setActiveMonth]=useState('july');
  const [notes,setNotes]=useState(()=>localStorage.getItem('family-ledger-july-notes')||'');

  const pageIndex = Math.max(0, julyPages.findIndex((page) => page.id === pageId));
  const page = julyPages[pageIndex];
  const month=useMemo(()=>months.find(m=>m.id===activeMonth)||months[0],[activeMonth]);
  const activeSection = page.sectionId || 'snapshot';
  const section=sections[activeSection];

  const navigateTo = useCallback((nextId, { replace = false } = {}) => {
    const nextPage = julyPages.find((candidate) => candidate.id === nextId);
    if (!nextPage) return;
    setPageId(nextId);
    if (nextPage.monthId) setActiveMonth(nextPage.monthId);
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', `#/${nextId}`);
    window.requestAnimationFrame(() => {
      document.querySelector('.notebook-page-title, .cover-label h1')?.focus({ preventScroll: true });
    });
  }, []);

  const goPrevious = useCallback(() => {
    if (pageIndex > 0) navigateTo(julyPages[pageIndex - 1].id);
  }, [navigateTo, pageIndex]);

  const goNext = useCallback(() => {
    if (pageIndex < julyPages.length - 1) navigateTo(julyPages[pageIndex + 1].id);
  }, [navigateTo, pageIndex]);

  useEffect(() => {
    if (!window.location.hash) navigateTo('cover', { replace: true });
    const handlePopState = () => setPageId(pageFromHash());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevious(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
      if (event.key === 'Home') { event.preventDefault(); navigateTo('cover'); }
      if (event.key === 'Escape') { event.preventDefault(); navigateTo(activeMonth); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMonth, goNext, goPrevious, navigateTo]);

  const chooseMonth=(id)=>{
    setActiveMonth(id);
    if(id==='july') navigateTo('july');
    else setPageId(`future-${id}`);
  };
  const chooseSection=(id)=>navigateTo(`july-${id}`);
  const saveNotes=(value)=>{setNotes(value);localStorage.setItem('family-ledger-july-notes',value)};

  let content;
  if(page.type==='cover') content=<AnnualCover onOpen={()=>navigateTo('inside')}/>;
  else if(page.type==='inside') content=<InsideCover onContinue={()=>navigateTo('july')}/>;
  else if(page.type==='month') content=<MonthChapterPage month={month} onEnter={()=>navigateTo('july-snapshot')}/>;
  else if(page.type==='divider') content=<SectionDivider section={section} onOpen={()=>navigateTo(`july-${activeSection}-work`)}/>;
  else content=<WorkingPage section={section}>{activeSection==='snapshot'?<SnapshotContent/>:<div className="working-grid"><NoteCard title={`${section.title} workspace`}><p>This working page will use the same calm, writable planner system as the approved prototype while its detailed data components are added.</p></NoteCard><WritingArea label="Meeting notes" value={notes} onChange={saveNotes} placeholder="Write together here..."/></div>}</WorkingPage>;

  if(pageId.startsWith('future-')) {
    const futureId = pageId.replace('future-', '');
    const futureMonth = months.find((candidate) => candidate.id === futureId) || months[1];
    content=<MonthChapterPage month={futureMonth}/>;
  }

  const showSections = page.type === 'divider' || page.type === 'working';
  const pageLabel = pageId.startsWith('future-') ? `${month.label} Preview` : page.label;

  return <main>
    <a className="skip-link" href="#notebook-content">Skip to notebook page</a>
    <div className="site-toolbar" aria-label="Notebook navigation">
      <button className="home-button" onClick={()=>navigateTo('cover')} aria-label="Go to front cover">⌂ <span>Cover</span></button>
      <div className="breadcrumb" aria-live="polite"><span>The Family Ledger</span><b>{pageLabel}</b></div>
      <span className="keyboard-help" title="Keyboard shortcuts">← → pages · Home cover · Esc month</span>
    </div>
    <NotebookShell months={months} activeMonth={activeMonth} onMonthSelect={chooseMonth} activeSection={activeSection} onSectionSelect={chooseSection} showSections={showSections}>
      <div id="notebook-content">{content}</div>
    </NotebookShell>
    {!pageId.startsWith('future-') && <PageControls
      previous={julyPages[pageIndex - 1]}
      next={julyPages[pageIndex + 1]}
      current={pageIndex + 1}
      total={julyPages.length}
      onPrevious={goPrevious}
      onNext={goNext}
    />}
  </main>;
}
