import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { months, getMonthCatalogEntry } from './data/months';
import { DEFAULT_WORKFLOW } from './data/defaultWorkflow';
import { ledgerRepository } from './repository';
import { listNavigableMonthIds } from './repository/LocalLedgerRepository';
import { MonthProvider } from './context/MonthContext';
import { WORKFLOW_UPDATED_EVENT } from './utils/meetingEvents';
import {
  buildNotebookPages,
  isPreviewPageId,
  previewMonthIdFromPageId,
} from './utils/notebookPages';
import { normalizePageId } from './utils/normalizePageId';
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
import { DataQualityBanner } from './components/DataQualityBanner';

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

const availableMonthIds = listNavigableMonthIds(ledgerRepository);
const notebookPages = buildNotebookPages(availableMonthIds, sections);
const DEFAULT_MONTH_ID = availableMonthIds[0] ?? '2026-07';

function tryGetMonthData(monthId) {
  if (!monthId || !ledgerRepository.hasLedgerData(monthId)) return null;
  try {
    return ledgerRepository.getMonth(monthId);
  } catch {
    return null;
  }
}

function getWorkflow(monthId) {
  return ledgerRepository.getWorkflow(monthId) ?? DEFAULT_WORKFLOW;
}

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

  if (isPreviewPageId(id) && months.some((month) => month.id === previewMonthIdFromPageId(id))) {
    return id;
  }

  if (id.endsWith('-work')) {
    const legacy = normalizePageId(id.replace('-work', '-1'));
    if (allPages.some((page) => page.id === legacy)) return legacy;
  }

  return 'cover';
}

function buildBreadcrumbs(page, pageId) {
  const root = { label: 'The Family Ledger', pageId: 'cover' };

  if (isPreviewPageId(pageId)) {
    const previewMonth = getMonthCatalogEntry(previewMonthIdFromPageId(pageId));
    return [root, { label: previewMonth ? `${previewMonth.label} Preview` : 'Preview', pageId: null }];
  }

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
  return (
    <ContentShell>
      <DataQualityBanner />
      {children}
    </ContentShell>
  );
}

export default function App() {
  const [pageId, setPageId] = useState(() => pageFromHash(notebookPages));
  const [activeMonth, setActiveMonth] = useState(DEFAULT_MONTH_ID);
  const [workflowTick, setWorkflowTick] = useState(0);

  useEffect(() => {
    const handleWorkflowUpdated = () => setWorkflowTick((tick) => tick + 1);
    window.addEventListener(WORKFLOW_UPDATED_EVENT, handleWorkflowUpdated);
    return () => window.removeEventListener(WORKFLOW_UPDATED_EVENT, handleWorkflowUpdated);
  }, []);

  const isPreview = isPreviewPageId(pageId);
  const pageIndex = isPreview ? -1 : notebookPages.findIndex((candidate) => candidate.id === pageId);
  const page = isPreview ? notebookPages[0] : (notebookPages[pageIndex] || notebookPages[0]);
  const month = useMemo(
    () => getMonthCatalogEntry(activeMonth) || months[0],
    [activeMonth],
  );
  const activeSection = page.sectionId || 'snapshot';
  const section = sections[activeSection];

  const monthContextValue = useMemo(() => {
    const contextMonthId = page.monthId || activeMonth;
    const contextMonth = getMonthCatalogEntry(contextMonthId) || month;
    return {
      monthId: contextMonthId,
      month: contextMonth,
      workflow: getWorkflow(contextMonthId),
    };
  }, [page.monthId, activeMonth, month, workflowTick]);

  const resolvedMonthId = page.monthId || activeMonth;
  const monthData = useMemo(() => tryGetMonthData(resolvedMonthId), [resolvedMonthId]);
  const monthLoadError = page.monthId && ledgerRepository.hasLedgerData(page.monthId) && !monthData;
  const showLocalDataBadge = ledgerRepository.isUsingLocalData(activeMonth);

  const navigateTo = useCallback((nextId, { replace = false } = {}) => {
    const normalizedId = normalizePageId(nextId);

    if (isPreviewPageId(normalizedId)) {
      setPageId(normalizedId);
      setActiveMonth(previewMonthIdFromPageId(normalizedId));
      window.history[replace ? 'replaceState' : 'pushState']({}, '', `#/${normalizedId}`);
      return;
    }

    const nextPage = notebookPages.find((candidate) => candidate.id === normalizedId);
    if (!nextPage) return;

    setPageId(normalizedId);
    if (nextPage.monthId) setActiveMonth(nextPage.monthId);
    window.history[replace ? 'replaceState' : 'pushState']({}, '', `#/${normalizedId}`);
  }, []);

  const goPrevious = useCallback(() => {
    if (isPreview || pageIndex <= 0) return;
    navigateTo(notebookPages[pageIndex - 1].id);
  }, [isPreview, navigateTo, pageIndex]);

  const goNext = useCallback(() => {
    if (isPreview || pageIndex < 0 || pageIndex >= notebookPages.length - 1) return;
    navigateTo(notebookPages[pageIndex + 1].id);
  }, [isPreview, navigateTo, pageIndex]);

  const navigateToMonth = useCallback((monthId) => {
    setActiveMonth(monthId);
    if (ledgerRepository.hasLedgerData(monthId)) {
      navigateTo(monthId);
      return;
    }
    navigateTo(`future-${monthId}`);
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
    if (isPreview) {
      navigateTo('cover');
      return;
    }
    const parentId = parentPageId(page);
    if (parentId) navigateTo(parentId);
  }, [isPreview, navigateTo, page]);

  useEffect(() => {
    if (!window.location.hash) navigateTo('cover', { replace: true });
    const handlePopState = () => {
      const id = pageFromHash(notebookPages);
      setPageId(id);
      const historyPage = notebookPages.find((candidate) => candidate.id === id);
      if (historyPage?.monthId) setActiveMonth(historyPage.monthId);
      else if (isPreviewPageId(id)) setActiveMonth(previewMonthIdFromPageId(id));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowUp') { event.preventDefault(); goPreviousMonth(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); goNextMonth(); return; }
      if (isPreview) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevious(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
      if (event.key === 'Escape') { event.preventDefault(); goUpBreadcrumb(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goNextMonth, goPrevious, goPreviousMonth, goUpBreadcrumb, isPreview]);

  const hasNotebookNav = !isPreview;

  let content;
  if (isPreview) {
    const previewMonthId = previewMonthIdFromPageId(pageId);
    const previewMonth = getMonthCatalogEntry(previewMonthId) || months[1];
    content = <MonthChapterPage month={previewMonth} hasLedgerData={false} />;
  } else if (page.type === 'cover') {
    content = <AnnualCover />;
  } else if (page.type === 'inside') {
    content = <InsideCover month={month} meta={monthData?.meta} />;
  } else if (page.type === 'month') {
    content = (
      <MonthChapterPage
        month={month}
        chapterMeta={monthData?.meta}
        hasLedgerData={ledgerRepository.hasLedgerData(page.monthId) && Boolean(monthData)}
      />
    );
  } else if (monthLoadError) {
    content = (
      <ContentShell>
        <div className="ledger-missing-data">
          <h2>No ledger data found</h2>
          <p>
            Expected sample or local data for {page.monthId}. Add{' '}
            <code>src/data/months/{page.monthId}.sample.js</code> or a gitignored local file.
          </p>
        </div>
      </ContentShell>
    );
  } else if (page.type === 'divider') {
    content = <SectionDivider section={section} month={month} />;
  } else if (page.type === 'content' && activeSection === 'snapshot') {
    content = (
      <MonthNotebookShell>
        <SnapshotPages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'story') {
    content = (
      <MonthNotebookShell>
        <StoryPages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'spending') {
    content = (
      <MonthNotebookShell>
        <SpendingPages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'cfo') {
    content = (
      <MonthNotebookShell>
        <CfoPages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'future') {
    content = (
      <MonthNotebookShell>
        <FuturePages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'meeting') {
    content = (
      <MonthNotebookShell>
        <MeetingPages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'actions') {
    content = (
      <MonthNotebookShell>
        <ActionsPages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'celebrate') {
    content = (
      <MonthNotebookShell>
        <CelebratePages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  } else if (page.type === 'content' && activeSection === 'handoff') {
    content = (
      <MonthNotebookShell>
        <HandoffPages {...contentPageProps(page, month, monthData)} />
      </MonthNotebookShell>
    );
  }

  const showSections = !isPreview && (page.type === 'divider' || page.type === 'content');
  const breadcrumbs = useMemo(() => buildBreadcrumbs(page, pageId), [page, pageId]);

  const wrappedContent = page.monthId || page.type === 'inside' ? (
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
        <span className="keyboard-help" title="Keyboard shortcuts">
          {showLocalDataBadge && (
            <span className="data-source-badge" title={`Loaded from local data for ${activeMonth} (gitignored)`}>
              Local data
            </span>
          )}
          {isPreview ? 'Preview only · ↑ ↓ months' : '← → pages · ↑ ↓ months · Esc up a level'}
        </span>
      </div>
      <NotebookShell
        months={months}
        availableMonthIds={availableMonthIds}
        activeMonth={activeMonth}
        onMonthSelect={navigateToMonth}
        activeSection={activeSection}
        onSectionSelect={(id) => navigateTo(`${activeMonth}-${id}-1`)}
        showSections={showSections}
        showLeftPage={page.type !== 'cover'}
        onPagePrevious={goPrevious}
        onPageNext={goNext}
        hasPrevious={hasNotebookNav && pageIndex > 0}
        hasNext={hasNotebookNav && pageIndex >= 0 && pageIndex < notebookPages.length - 1}
      >
        <div id="notebook-content">{wrappedContent}</div>
      </NotebookShell>
    </main>
  );
}
