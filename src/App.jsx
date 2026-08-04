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
  if (julyPages.some((page) => page.id === id)) return id;
  if (id.startsWith('future-') && months.some((month) => month.id === id.replace('future-', ''))) return id;
  return 'cover';
}

function buildBreadcrumbs(page, pageId) {
  const root = { label: 'The Family Ledger', pageId: 'cover' };

  if (pageId.startsWith('future-')) {
    const futureMonth = months.find((candidate) => candidate.id === pageId.replace('future-', ''));
    return [
      root,
      { label: futureMonth ? `${futureMonth.label} Preview` : 'Preview', pageId: null },
    ];
  }

  if (page.type === 'cover') {
    return [{ label: 'The Family Ledger', pageId: null }];
  }

  const crumbs = [root];

  if (page.type === 'inside') {
    crumbs.push({ label: 'Inside Cover', pageId: null });
    return crumbs;
  }

  const monthData = months.find((candidate) => candidate.id === page.monthId);
  const monthLabel = monthData?.label || 'Month';
  const monthPageId = page.monthId;

  if (page.type === 'month') {
    crumbs.push({ label: monthLabel, pageId: null });
    return crumbs;
  }

  if (page.monthId) {
    crumbs.push({
      label: monthLabel,
      pageId: monthPageId,
    });
  }

  if (page.sectionId) {
    const sectionTitle = sections[page.sectionId]?.title || page.sectionId;
    const dividerPageId = `${page.monthId}-${page.sectionId}`;

    if (page.type === 'divider') {
      crumbs.push({ label: sectionTitle, pageId: null });
      return crumbs;
    }

    crumbs.push({ label: sectionTitle, pageId: dividerPageId });
  }

  if (page.type === 'working') {
    crumbs.push({ label: 'Working Page', pageId: null });
  }

  return crumbs;
}

function parentPageId(page, pageId) {
  if (pageId.startsWith('future-')) return 'cover';
  if (page.type === 'working') return `${page.monthId}-${page.sectionId}`;
  if (page.type === 'divider') return page.monthId;
  if (page.type === 'month' || page.type === 'inside') return 'cover';
  return null;
}

function BreadcrumbNav({ crumbs, onNavigate }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const isLink = Boolean(crumb.pageId);

          return (
            <li key={`${crumb.label}-${index}`} className="breadcrumb-item">
              {isLink ? (
                <a
                  href={`#/${crumb.pageId}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(crumb.pageId);
                  }}
                >
                  {crumb.label}
                </a>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
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
  }, []);

  const goPrevious = useCallback(() => {
    if (pageIndex > 0) navigateTo(julyPages[pageIndex - 1].id);
  }, [navigateTo, pageIndex]);

  const goNext = useCallback(() => {
    if (pageIndex < julyPages.length - 1) navigateTo(julyPages[pageIndex + 1].id);
  }, [navigateTo, pageIndex]);

  const navigateToMonth = useCallback((id) => {
    setActiveMonth(id);
    if (id === 'july') {
      navigateTo('july');
      return;
    }
    const nextPageId = `future-${id}`;
    setPageId(nextPageId);
    window.history.pushState({}, '', `#/${nextPageId}`);
  }, [navigateTo]);

  const goUpBreadcrumb = useCallback(() => {
    const parentId = parentPageId(page, pageId);
    if (parentId) navigateTo(parentId);
  }, [navigateTo, page, pageId]);

  useEffect(() => {
    if (!window.location.hash) navigateTo('cover', { replace: true });
    const handlePopState = () => {
      const id = pageFromHash();
      setPageId(id);
      const historyPage = julyPages.find((candidate) => candidate.id === id);
      if (historyPage?.monthId) setActiveMonth(historyPage.monthId);
      else if (id.startsWith('future-')) setActiveMonth(id.replace('future-', ''));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevious(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
      if (event.key === 'Escape') { event.preventDefault(); goUpBreadcrumb(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious, goUpBreadcrumb]);

  const chooseMonth = navigateToMonth;
  const chooseSection=(id)=>navigateTo(`july-${id}`);
  const saveNotes=(value)=>{setNotes(value);localStorage.setItem('family-ledger-july-notes',value)};

  const hasNotebookNav = !pageId.startsWith('future-');

  let content;
  if(page.type==='cover') content=<AnnualCover/>;
  else if(page.type==='inside') content=<InsideCover month={month}/>;
  else if(page.type==='month') content=<MonthChapterPage month={month}/>;
  else if(page.type==='divider') content=<SectionDivider section={section} month={month}/>;
  else content=<WorkingPage section={section} month={month}>{activeSection==='snapshot'?<SnapshotContent/>:<div className="working-grid"><NoteCard title={`${section.title} workspace`}><p>This working page will use the same calm, writable planner system as the approved prototype while its detailed data components are added.</p></NoteCard><WritingArea label="Meeting notes" value={notes} onChange={saveNotes} placeholder="Write together here..."/></div>}</WorkingPage>;

  if(pageId.startsWith('future-')) {
    const futureId = pageId.replace('future-', '');
    const futureMonth = months.find((candidate) => candidate.id === futureId) || months[1];
    content=<MonthChapterPage month={futureMonth}/>;
  }

  const showSections = page.type === 'divider' || page.type === 'working';
  const breadcrumbs = useMemo(() => buildBreadcrumbs(page, pageId), [page, pageId]);

  return <main>
    <a className="skip-link" href="#notebook-content">Skip to notebook page</a>
    <div className="site-toolbar" aria-label="Notebook navigation">
      <BreadcrumbNav crumbs={breadcrumbs} onNavigate={navigateTo} />
      <span className="keyboard-help" title="Keyboard shortcuts">← → pages · Esc up a level</span>
    </div>
    <NotebookShell
      months={months}
      activeMonth={activeMonth}
      onMonthSelect={chooseMonth}
      activeSection={activeSection}
      onSectionSelect={chooseSection}
      showSections={showSections}
      onPagePrevious={goPrevious}
      onPageNext={goNext}
      hasPrevious={hasNotebookNav && pageIndex > 0}
      hasNext={hasNotebookNav && pageIndex < julyPages.length - 1}
    >
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
