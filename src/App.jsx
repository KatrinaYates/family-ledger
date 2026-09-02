import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { months, getMonthCatalogEntry } from './data/months';
import { MONTH_SECTIONS } from './data/monthSections';
import { ledgerRepository } from './repository';
import { MonthProvider } from './context/MonthContext';
import { useLedgerMonths } from './hooks/useLedgerMonths';
import { useLedgerMonth } from './hooks/useLedgerMonth';
import { useWorkflow } from './hooks/useWorkflow';
import { buildLinearNotebookPages, buildNotebookPages } from './utils/notebookPages';
import { normalizePageId } from './utils/normalizePageId';
import { createBlankLedgerMonth } from './repository/createBlankLedgerMonth.js';
import { dispatchLedgerMonthsUpdated } from './utils/meetingEvents';
import { useBootLoading, LedgerLoader } from './context/BootGate.jsx';
import { useInsideCoverFields } from './hooks/useInsideCoverFields';
import { MonthOverviewPage } from './components/sections/MonthOverviewPage';
import { SpendingPage } from './components/sections/SpendingPage';
import { CfoPage } from './components/sections/CfoPage';
import { FuturePage } from './components/sections/FuturePage';
import { RetrospectivePage } from './components/sections/RetrospectivePage';
import { CelebratePage } from './components/sections/CelebratePage';
import { CloseMonthPage } from './components/sections/CloseMonthPage';
import { FinancialCheckInPage } from './components/checkin/FinancialCheckInPage';
import { NotebookKitPage } from './components/notebook';
import {
  AnnualCover,
  ContentShell,
  InsideCover,
  MonthChapterPage,
  NotebookShell,
  sectionTabs,
} from './components/LedgerComponents';
import { DataQualityNotes } from './components/DataQualityNotes';
import { HouseholdAccessMenu } from './supabase/HouseholdAccessMenu.jsx';
import { MonthLockStatus } from './components/MonthLockStatus.jsx';
import { LedgerFeedbackButton, LedgerFeedbackPanel } from './components/LedgerFeedbackPanel';

const sectionComponents = {
  month: MonthOverviewPage,
  spending: SpendingPage,
  cfo: CfoPage,
  future: FuturePage,
  retrospective: RetrospectivePage,
  celebrate: CelebratePage,
  close: CloseMonthPage,
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
  return 'cover';
}

const COVER_PAGE = { id: 'cover', type: 'cover', label: 'Front Cover' };

function buildBreadcrumbs(page) {
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

  if (page.type === 'check-in') {
    crumbs.push({ label: 'Financial Check-In', pageId: null });
    return crumbs;
  }

  if (page.type === 'notebook-kit') {
    crumbs.push({ label: 'Notebook Kit', pageId: null });
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
    const sectionTitle = MONTH_SECTIONS[page.sectionId]?.title || page.sectionId;
    crumbs.push({ label: sectionTitle, pageId: null });
  }

  return crumbs;
}

function parentPageId(page) {
  if (page.type === 'check-in') return 'cover';
  if (page.type === 'notebook-kit') return 'cover';
  if (page.type === 'content') return page.monthId;
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
    () => buildNotebookPages(navigableMonthIds, MONTH_SECTIONS),
    [navigableMonthIds],
  );
  const linearNotebookPages = useMemo(
    () => buildLinearNotebookPages(navigableMonthIds, MONTH_SECTIONS),
    [navigableMonthIds],
  );

  useBootLoading('months', monthsLoading);

  const defaultMonthId = monthIds[0] ?? months[0]?.id ?? '2026-07';

  const [bootComplete, setBootComplete] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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

  const page = notebookPages.find((candidate) => candidate.id === pageId) || notebookPages[0];
  const linearPageIndex = linearNotebookPages.findIndex((candidate) => candidate.id === pageId);
  const resolvedPage = page ?? COVER_PAGE;
  const displayMonth = useMemo(
    () => getMonthCatalogEntry(resolvedPage.monthId || activeMonth) || months[0],
    [resolvedPage.monthId, activeMonth],
  );
  const activeSection = resolvedPage.sectionId || 'month';

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
    if (linearPageIndex <= 0) return;
    navigateTo(linearNotebookPages[linearPageIndex - 1].id);
  }, [navigateTo, linearPageIndex, linearNotebookPages]);

  const goNext = useCallback(() => {
    if (linearPageIndex < 0 || linearPageIndex >= linearNotebookPages.length - 1) return;
    navigateTo(linearNotebookPages[linearPageIndex + 1].id);
  }, [navigateTo, linearPageIndex, linearNotebookPages]);

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
    () => buildBreadcrumbs(resolvedPage),
    [resolvedPage],
  );

  const jumpToMonthLock = useCallback(() => {
    navigateTo(`${contextMonthId}-close`);
  }, [contextMonthId, navigateTo]);

  const showMonthUtilities = Boolean(resolvedPage.monthId);
  const showSections = resolvedPage.type === 'content';

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
  } else if (resolvedPage.type === 'check-in') {
    content = (
      <ContentShell>
        <FinancialCheckInPage />
      </ContentShell>
    );
  } else if (resolvedPage.type === 'notebook-kit') {
    content = <NotebookKitPage />;
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
  } else if (resolvedPage.type === 'content' && resolvedPage.sectionId) {
    const Section = sectionComponents[resolvedPage.sectionId];
    const sectionMeta = MONTH_SECTIONS[resolvedPage.sectionId];
    content = Section ? (
      <MonthNotebookShell>
        <Section data={monthData} month={displayMonth} section={sectionMeta} />
      </MonthNotebookShell>
    ) : (
      <AnnualCover />
    );
  } else {
    content = <AnnualCover />;
  }

  const appBody = (
    <main>
      <a className="skip-link" href="#notebook-content">Skip to notebook page</a>
      <div className="site-toolbar" aria-label="Notebook navigation">
        <BreadcrumbNav crumbs={breadcrumbs} onNavigate={navigateTo} />
        <div className="site-toolbar-actions">
          <button
            type="button"
            className={`check-in-nav-link${resolvedPage.type === 'notebook-kit' ? ' is-active' : ''}`}
            onClick={() => navigateTo('notebook-kit')}
            aria-current={resolvedPage.type === 'notebook-kit' ? 'page' : undefined}
          >
            📒 Notebook Kit
          </button>
          <button
            type="button"
            className={`check-in-nav-link${resolvedPage.type === 'check-in' ? ' is-active' : ''}`}
            onClick={() => navigateTo('check-in')}
            aria-current={resolvedPage.type === 'check-in' ? 'page' : undefined}
          >
            💵 Financial Check-In
          </button>
          {showMonthUtilities && (
            <div className="site-toolbar-utilities">
              <LedgerFeedbackButton onClick={() => setFeedbackOpen(true)} />
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
        onSectionSelect={(id) => navigateTo(`${activeMonth}-${id}`)}
        showSections={showSections}
        showLeftPage={resolvedPage.type !== 'cover'}
        onPagePrevious={goPrevious}
        onPageNext={goNext}
        hasPrevious={linearPageIndex > 0}
        hasNext={linearPageIndex >= 0 && linearPageIndex < linearNotebookPages.length - 1}
      >
        <div id="notebook-content">{content}</div>
      </NotebookShell>
      <LedgerFeedbackPanel
        monthId={contextMonthId}
        monthLabel={displayMonth?.label}
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </main>
  );

  return (
    <MonthProvider
      monthId={monthContextValue.monthId}
      month={monthContextValue.month}
      workflow={monthContextValue.workflow}
    >
      {appBody}
    </MonthProvider>
  );
}
