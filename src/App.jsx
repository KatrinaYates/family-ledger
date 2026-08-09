import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { months, getMonthCatalogEntry } from './data/months';
import { ledgerRepository } from './repository';
import { MonthProvider } from './context/MonthContext';
import { useLedgerMonths } from './hooks/useLedgerMonths';
import { useLedgerMonth } from './hooks/useLedgerMonth';
import { useWorkflow } from './hooks/useWorkflow';
import {
  buildNotebookPages,
} from './utils/notebookPages';
import { normalizePageId } from './utils/normalizePageId';
import { createBlankLedgerMonth } from './repository/createBlankLedgerMonth.js';
import { dispatchLedgerMonthsUpdated } from './utils/meetingEvents';
import { useBootLoading, LedgerLoader } from './context/BootGate.jsx';
import { useInsideCoverFields } from './hooks/useInsideCoverFields';
import { SnapshotPages } from './components/snapshot/SnapshotPages';
import { StoryPages } from './components/story/StoryPages';
import { SpendingPages } from './components/spending/SpendingPages';
import { CfoPages } from './components/cfo/CfoPages';
import { FuturePages } from './components/future/FuturePages';
import { MeetingPages } from './components/meeting/MeetingPages';
import { ActionsPages } from './components/actions/ActionsPages';
import { CelebratePages } from './components/celebrate/CelebratePages';
import { HandoffPages } from './components/handoff/HandoffPages';
import {
  AnnualCover,
  ContentShell,
  InsideCover,
  MonthChapterPage,
  NotebookShell,
  SectionDivider,
  sectionTabs,
} from './components/LedgerComponents';
import { DataQualityNotes } from './components/DataQualityNotes';
import { HouseholdAccessMenu } from './supabase/HouseholdAccessMenu.jsx';
import { MonthLockStatus } from './components/MonthLockStatus.jsx';

const sections = {
  snapshot:{number:'01',title:'Financial Snapshot',description:'A quick read on where our financial life stands.',inside:'Connected net worth • Cash • Emergency fund • Retirement • Debt',how:'Start with the big picture before diving into details.',prompt:'What changed most this month?',noteTone:'blue',tone:'teal'},
  story:{number:'02',title:'Monthly Story',description:'Turn the numbers into a shared story about the month.',inside:'What happened • Patterns • Context • Surprises',how:'Describe the month without blame or over-explaining.',prompt:'What would the numbers miss?',noteTone:'green',tone:'green'},
  spending:{number:'03',title:'Spending',description:'See where money flowed and what deserves attention.',inside:'Categories • Trends • unusual charges • subscriptions',how:'Look for patterns, not tiny imperfections.',prompt:'What spending felt worth it?',noteTone:'yellow',tone:'yellow'},
  cfo:{number:'04',title:'CFO Recs',description:'Prioritized financial recommendations based on the full picture.',inside:'Best next move • risks • opportunities • tradeoffs',how:'Choose fewer, higher-impact moves.',prompt:'What creates the most relief?',noteTone:'coral',tone:'coral'},
  future:{number:'05',title:'Retirement & Future',description:'Connect this month’s choices to the life we are building.',inside:'Retirement • goals • education • long-term planning',how:'Balance future progress with real life today.',prompt:'What does future-us need?',noteTone:'lav',tone:'lav'},
  meeting:{number:'06',title:'Money Meeting',description:'A guided space for the conversation itself.',inside:'Prompts • notes • decisions • open questions',how:'Talk like teammates. Capture what matters.',prompt:'Curiosity over criticism. ♡',noteTone:'blue',tone:'blue'},
  actions:{number:'07',title:'Action Plan',description:'Turn insight into a realistic set of next moves.',inside:'Owners • due dates • priorities • carryovers',how:'Make every action specific and small enough to finish.',prompt:'Tiny steps still count.',noteTone:'pink',tone:'pink'},
  celebrate:{number:'08',title:'Celebrate',description:'Pause long enough to notice the progress we made.',inside:'Wins • gratitude • milestones • proud moments',how:'Celebrate effort and direction, not only perfect results.',prompt:'We are building this together!',noteTone:'green',tone:'green'},
  handoff:{number:'09',title:'CFO Handoff',description:'Leave a clean record for next month and future-us.',inside:'Carryovers • reminders • watch items • next-month context',how:'Write what we will be glad to remember later.',prompt:'What should the next month know?',noteTone:'blue',tone:'slate'},
};

function isTypingTarget(target) {
  return target instanceof HTMLElement && (
    target.matches('input, textarea, select, [contenteditable="true"]') ||
    Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
  );
}

function pageFromHash(allPages) {
  const rawId = window.location.hash.replace('#/', '');
  const id = normalizePageId(rawId);

  if (allPages.some((page) => page.id === id)) return id;

  if (id.endsWith('-work')) {
    const legacy = normalizePageId(id.replace('-work', '-1'));
    if (allPages.some((page) => page.id === legacy)) return legacy;
  }

  return 'cover';
}

const COVER_PAGE = { id: 'cover', type: 'cover', label: 'Front Cover' };

function buildBreadcrumbs(page, pageId) {
  if (!page) {
    return [{ label: 'The Family Ledger', pageId: null }];
  }

  const root = { label: 'The Family Ledger', pageId: 'cover' };

  if (page.type === 'cover') return [{ label: 'The Family Ledger', pageId: null }];

  const crumbs = [root];

  if (page.type === 'inside') {
    crumbs.push({ label: 'Inside Cover', pageId: null });
    return crumbs;
  }

  const monthData = getMonthCatalogEntry(page.monthId);
  const monthLabel = monthData?.label || 'Month';

  if (page.type === 'month') {
    crumbs.push({ label: monthLabel, pageId: null });
    return crumbs;
  }

  if (page.monthId) crumbs.push({ label: monthLabel, pageId: page.monthId });

  if (page.sectionId) {
    const sectionTitle = sections[page.sectionId]?.title || page.sectionId;
    const dividerPageId = `${page.monthId}-${page.sectionId}`;
    if (page.type === 'divider') {
      crumbs.push({ label: sectionTitle, pageId: null });
      return crumbs;
    }
    crumbs.push({ label: sectionTitle, pageId: dividerPageId });
  }

  if (page.type === 'content') {
    crumbs.push({ label: `Page ${page.pageInSection} of ${page.totalInSection}`, pageId: null });
  }

  return crumbs;
}

function parentPageId(page) {
  if (page.type === 'content') return `${page.monthId}-${page.sectionId}`;
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
                <a href={`#/${crumb.pageId}`} onClick={(event) => { event.preventDefault(); onNavigate(crumb.pageId); }}>
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

const contentPageProps = (page, month, monthData) => ({
  page: page.pageInSection,
  totalInSection: page.totalInSection,
  data: monthData,
  month,
});

function MonthNotebookShell({ children }) {
  return <ContentShell>{children}</ContentShell>;
}

export default function App() {
  const { monthIds, loading: monthsLoading, error: monthsError } = useLedgerMonths();
  const catalogMonthIds = useMemo(() => months.map((month) => month.id), []);
  const navigableMonthIds = useMemo(
    () => [...new Set([...monthIds, ...catalogMonthIds])].sort(),
    [monthIds, catalogMonthIds],
  );
  const notebookPages = useMemo(
    () => buildNotebookPages(navigableMonthIds, sections),
    [navigableMonthIds],
  );

  useBootLoading('months', monthsLoading);

  const defaultMonthId = monthIds[0] ?? months[0]?.id ?? '2026-07';

  const [bootComplete, setBootComplete] = useState(false);

  const [pageId, setPageId] = useState(() => {
    const rawId = window.location.hash.replace('#/', '');
    return normalizePageId(rawId) || 'cover';
  });
  const [activeMonth, setActiveMonth] = useState(defaultMonthId);
  const [usingLocalData, setUsingLocalData] = useState(false);
  const [hasLedgerDataMap, setHasLedgerDataMap] = useState({});

  useEffect(() => {
    if (monthIds.length && !monthIds.includes(activeMonth)) {
      setActiveMonth(defaultMonthId);
    }
  }, [monthIds, activeMonth, defaultMonthId]);

  useEffect(() => {
    if (monthsLoading || !notebookPages.length) return;
    const validId = pageFromHash(notebookPages);
    setPageId(validId);
    const historyPage = notebookPages.find((candidate) => candidate.id === validId);
    if (historyPage?.monthId) setActiveMonth(historyPage.monthId);
  }, [monthsLoading, notebookPages]);

  useEffect(() => {
    let cancelled = false;
    ledgerRepository.isUsingLocalData(activeMonth).then((value) => {
      if (!cancelled) setUsingLocalData(value);
    });
    return () => { cancelled = true; };
  }, [activeMonth]);

  const pageIndex = notebookPages.findIndex((candidate) => candidate.id === pageId);
  const page = notebookPages[pageIndex] || notebookPages[0];
  const resolvedPage = page ?? COVER_PAGE;
  const displayMonth = useMemo(
    () => getMonthCatalogEntry(resolvedPage.monthId || activeMonth) || months[0],
    [resolvedPage.monthId, activeMonth],
  );
  const activeSection = resolvedPage.sectionId || 'snapshot';
  const section = sections[activeSection];

  const contextMonthId = resolvedPage.monthId || activeMonth;
  const { workflow } = useWorkflow(contextMonthId);

  const monthContextValue = useMemo(() => {
    const contextMonth = getMonthCatalogEntry(contextMonthId) || displayMonth;
    return {
      monthId: contextMonthId,
      month: contextMonth,
      workflow,
    };
  }, [contextMonthId, displayMonth, workflow]);

  const resolvedMonthId = resolvedPage.monthId || activeMonth;
  const { data: monthData, loading: monthLoading, error: monthError } = useLedgerMonth(resolvedMonthId);

  const insideCoverReady = !monthsLoading && !monthLoading && Boolean(monthData);
  const insideCoverEnabled = insideCoverReady && (!bootComplete || resolvedPage.type === 'inside');
  const insideCover = useInsideCoverFields(monthData?.meta, { enabled: insideCoverEnabled });

  useEffect(() => {
    if (bootComplete) return;
    if (
      !monthsLoading &&
      !monthLoading &&
      monthData &&
      insideCoverReady &&
      !insideCover.loading
    ) {
      setBootComplete(true);
    }
  }, [bootComplete, monthsLoading, monthLoading, monthData, insideCoverReady, insideCover.loading]);

  useBootLoading('month', !bootComplete && monthLoading);
  useBootLoading('inside-cover', !bootComplete && insideCover.loading && insideCoverReady);

  const monthLoadError = Boolean(
    resolvedPage.monthId &&
    !monthLoading &&
    !monthData &&
    (monthError || hasLedgerDataMap[resolvedPage.monthId]),
  );

  useEffect(() => {
    if (resolvedPage.monthId && resolvedPage.monthId !== activeMonth) {
      setActiveMonth(resolvedPage.monthId);
    }
  }, [resolvedPage.monthId, activeMonth]);

  useEffect(() => {
    if (!resolvedPage.monthId) return;
    let cancelled = false;
    ledgerRepository.hasLedgerData(resolvedPage.monthId).then((hasData) => {
      if (!cancelled) {
        setHasLedgerDataMap((prev) => ({ ...prev, [resolvedPage.monthId]: hasData }));
      }
    });
    return () => { cancelled = true; };
  }, [resolvedPage.monthId]);

  const navigateTo = useCallback((nextId, { replace = false } = {}) => {
    const normalizedId = normalizePageId(nextId);
    const nextPage = notebookPages.find((candidate) => candidate.id === normalizedId);
    if (!nextPage) return;

    setPageId(normalizedId);
    if (nextPage.monthId) setActiveMonth(nextPage.monthId);
    window.history[replace ? 'replaceState' : 'pushState']({}, '', `#/${normalizedId}`);
  }, [notebookPages]);

  const goPrevious = useCallback(() => {
    if (pageIndex <= 0) return;
    navigateTo(notebookPages[pageIndex - 1].id);
  }, [navigateTo, pageIndex, notebookPages]);

  const goNext = useCallback(() => {
    if (pageIndex < 0 || pageIndex >= notebookPages.length - 1) return;
    navigateTo(notebookPages[pageIndex + 1].id);
  }, [navigateTo, pageIndex, notebookPages]);

  const navigateToMonth = useCallback(async (monthId) => {
    setActiveMonth(monthId);
    if (!(await ledgerRepository.hasLedgerData(monthId))) {
      try {
        await ledgerRepository.createMonth(createBlankLedgerMonth(monthId));
        dispatchLedgerMonthsUpdated();
      } catch {
        // Month may already exist; navigation can still proceed.
      }
    }
    navigateTo(monthId);
  }, [navigateTo]);

  const goPreviousMonth = useCallback(() => {
    const monthIndex = months.findIndex((candidate) => candidate.id === activeMonth);
    if (monthIndex <= 0) return;
    navigateToMonth(months[monthIndex - 1].id);
  }, [activeMonth, navigateToMonth]);

  const goNextMonth = useCallback(() => {
    const monthIndex = months.findIndex((candidate) => candidate.id === activeMonth);
    if (monthIndex < 0 || monthIndex >= months.length - 1) return;
    navigateToMonth(months[monthIndex + 1].id);
  }, [activeMonth, navigateToMonth]);

  const goUpBreadcrumb = useCallback(() => {
    const parentId = parentPageId(resolvedPage);
    if (parentId) navigateTo(parentId);
  }, [navigateTo, resolvedPage]);

  useEffect(() => {
    if (monthsLoading) return;
    if (!window.location.hash) navigateTo('cover', { replace: true });
    const handlePopState = () => {
      const id = pageFromHash(notebookPages);
      setPageId(id);
      const historyPage = notebookPages.find((candidate) => candidate.id === id);
      if (historyPage?.monthId) setActiveMonth(historyPage.monthId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo, monthsLoading, notebookPages]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowUp') { event.preventDefault(); goPreviousMonth(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); goNextMonth(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevious(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
      if (event.key === 'Escape') { event.preventDefault(); goUpBreadcrumb(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goNextMonth, goPrevious, goPreviousMonth, goUpBreadcrumb]);

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(resolvedPage, pageId),
    [resolvedPage, pageId],
  );

  const jumpToMonthLock = useCallback(() => {
    navigateTo(`${contextMonthId}-handoff-2`);
  }, [contextMonthId, navigateTo]);

  if (
    monthsLoading ||
    (!bootComplete && monthLoading) ||
    (!bootComplete && insideCoverReady && insideCover.loading)
  ) return null;

  if (monthsError) {
    return (
      <main className="ledger-boot">
        <p className="field-save-error" role="alert">{monthsError}</p>
      </main>
    );
  }

  const chapterMonthId = resolvedPage.type === 'month' ? resolvedPage.monthId : null;

  let content;
  if (resolvedPage.type === 'cover') {
    content = <AnnualCover />;
  } else if (resolvedPage.type === 'inside') {
    content = <InsideCover month={displayMonth} insideCover={insideCover} />;
  } else if (resolvedPage.type === 'month') {
    if (chapterMonthId && monthLoading) {
      content = (
        <ContentShell>
          <LedgerLoader inline aria-label="Filling in your page" />
        </ContentShell>
      );
    } else {
      content = (
        <MonthChapterPage
          month={displayMonth}
          chapterMeta={monthData?.meta}
        />
      );
    }
  } else if (monthLoadError) {
    content = (
      <ContentShell>
        <div className="ledger-missing-data">
          <h2>No ledger data found</h2>
          <p>
            Expected sample or local data for {resolvedPage.monthId}. Add{' '}
            <code>src/data/months/{resolvedPage.monthId}.sample.js</code> or a gitignored local file.
          </p>
        </div>
      </ContentShell>
    );
  } else if ((monthLoading || !monthData) && resolvedPage.type === 'content') {
    content = (
      <ContentShell>
        <LedgerLoader inline aria-label="Filling in your page" />
      </ContentShell>
    );
  } else if (resolvedPage.type === 'divider') {
    content = <SectionDivider section={section} month={displayMonth} />;
  } else if (resolvedPage.type === 'content' && activeSection === 'snapshot') {
    content = (
      <MonthNotebookShell>
        <SnapshotPages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'story') {
    content = (
      <MonthNotebookShell>
        <StoryPages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'spending') {
    content = (
      <MonthNotebookShell>
        <SpendingPages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'cfo') {
    content = (
      <MonthNotebookShell>
        <CfoPages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'future') {
    content = (
      <MonthNotebookShell>
        <FuturePages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'meeting') {
    content = (
      <MonthNotebookShell>
        <MeetingPages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'actions') {
    content = (
      <MonthNotebookShell>
        <ActionsPages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'celebrate') {
    content = (
      <MonthNotebookShell>
        <CelebratePages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else if (resolvedPage.type === 'content' && activeSection === 'handoff') {
    content = (
      <MonthNotebookShell>
        <HandoffPages {...contentPageProps(resolvedPage, displayMonth, monthData)} />
      </MonthNotebookShell>
    );
  } else {
    content = <AnnualCover />;
  }

  const showSections = resolvedPage.type === 'divider' || resolvedPage.type === 'content';

  const wrappedContent = resolvedPage.monthId ? (
    <MonthProvider
      monthId={monthContextValue.monthId}
      month={monthContextValue.month}
      workflow={monthContextValue.workflow}
    >
      {content}
    </MonthProvider>
  ) : content;

  return (
    <main>
      <a className="skip-link" href="#notebook-content">Skip to notebook page</a>
      <div className="site-toolbar" aria-label="Notebook navigation">
        <BreadcrumbNav crumbs={breadcrumbs} onNavigate={navigateTo} />
        <div className="site-toolbar-actions">
          {resolvedPage.monthId && (
            <div className="site-toolbar-utilities">
              <MonthLockStatus
                monthId={contextMonthId}
                month={displayMonth}
                onJumpToLock={jumpToMonthLock}
              />
              <DataQualityNotes monthId={resolvedPage.monthId} />
            </div>
          )}
          <div className="site-toolbar-meta">
            {usingLocalData && (
              <span className="data-source-badge" title={`Loaded from local data for ${activeMonth} (gitignored)`}>
                Local data
              </span>
            )}
            <HouseholdAccessMenu />
          </div>
        </div>
      </div>
      <NotebookShell
        months={months}
        availableMonthIds={monthIds}
        activeMonth={activeMonth}
        onMonthSelect={navigateToMonth}
        activeSection={activeSection}
        onSectionSelect={(id) => navigateTo(`${activeMonth}-${id}-1`)}
        showSections={showSections}
        showLeftPage={resolvedPage.type !== 'cover'}
        onPagePrevious={goPrevious}
        onPageNext={goNext}
        hasPrevious={pageIndex > 0}
        hasNext={pageIndex >= 0 && pageIndex < notebookPages.length - 1}
      >
        <div id="notebook-content">{wrappedContent}</div>
      </NotebookShell>
    </main>
  );
}
