import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { months } from './data/months';
import julyData, { isUsingLocalData } from './data/loadJuly2026';
import { sectionPageCounts, sectionPageLabels } from './data/sectionPageCounts';
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

const sections = {
  snapshot:{number:'01',title:'Financial Snapshot',description:'A quick read on where our financial life stands.',inside:'Connected net worth • Cash • Emergency fund • Retirement • Debt',how:'Start with the big picture before diving into details.',prompt:'What changed most this month?',noteTone:'blue',tone:'teal'},
  story:{number:'02',title:'Monthly Story',description:'Turn the numbers into a shared story about the month.',inside:'What happened • Patterns • Context • Surprises',how:'Describe the month without blame or over-explaining.',prompt:'What would the numbers miss?',noteTone:'green',tone:'green'},
  spending:{number:'03',title:'Spending',description:'See where money flowed and what deserves attention.',inside:'Categories • Trends • unusual charges • subscriptions',how:'Look for patterns, not tiny imperfections.',prompt:'What spending felt worth it?',noteTone:'yellow',tone:'yellow'},
  cfo:{number:'04',title:'CFO Recs',description:'Prioritized financial recommendations based on the full picture.',inside:'Best next move • risks • opportunities • tradeoffs',how:'Choose fewer, higher-impact moves.',prompt:'What creates the most relief?',noteTone:'coral',tone:'coral'},
  future:{number:'05',title:'Retirement & Future',description:'Connect this month’s choices to the life we are building.',inside:'Retirement • goals • education • long-term planning',how:'Balance future progress with real life today.',prompt:'What does future-us need?',noteTone:'lav',tone:'lav'},
  meeting:{number:'06',title:'Money Meeting',description:'A guided space for the conversation itself.',inside:'Prompts • notes • decisions • open questions',how:'Talk like teammates. Capture what matters.',prompt:'Curiosity over criticism. ♡',noteTone:'blue',tone:'blue'},
  actions:{number:'07',title:'Action Plan',description:'Turn insight into a realistic set of next moves.',inside:'Owners • due dates • priorities • carryovers',how:'Make every action specific and small enough to finish.',prompt:'Tiny steps still count.',noteTone:'pink',tone:'pink'},
  celebrate:{number:'08',title:'Celebrate',description:'Pause long enough to notice the progress we made.',inside:'Wins • gratitude • milestones • proud moments',how:'Celebrate effort and direction, not only perfect results.',prompt:'We are building this together!',noteTone:'green',tone:'green'},
  handoff:{number:'09',title:'CFO Handoff',description:'Leave a clean record for next month and future-us.',inside:'Carryovers • reminders • watch items • next-month context',how:'Write what we will be glad to remember later.',prompt:'What should August know?',noteTone:'blue',tone:'slate'},
};

const sectionIds = sectionTabs.map(([id]) => id);

function buildJulyPages() {
  return [
    { id: 'cover', type: 'cover', label: 'Front Cover' },
    { id: 'inside', type: 'inside', label: 'Inside Cover' },
    { id: 'july', type: 'month', monthId: 'july', label: 'July Chapter' },
    ...sectionIds.flatMap((sectionId) => {
      const count = sectionPageCounts[sectionId] ?? 1;
      const labels = sectionPageLabels[sectionId] || [];
      return [
        { id: `july-${sectionId}`, type: 'divider', monthId: 'july', sectionId, label: sections[sectionId].title },
        ...Array.from({ length: count }, (_, index) => {
          const pageNum = index + 1;
          const pageLabel = labels[index] || `Page ${pageNum}`;
          return {
            id: `july-${sectionId}-${pageNum}`,
            type: 'content',
            monthId: 'july',
            sectionId,
            pageInSection: pageNum,
            totalInSection: count,
            pageLabel,
            label: `${sections[sectionId].title} — ${pageLabel}`,
          };
        }),
      ];
    }),
  ];
}

const julyPages = buildJulyPages();

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
  if (id.endsWith('-work')) {
    const legacy = id.replace('-work', '-1');
    if (julyPages.some((page) => page.id === legacy)) return legacy;
  }
  return 'cover';
}

function buildBreadcrumbs(page, pageId) {
  const root = { label: 'The Family Ledger', pageId: 'cover' };

  if (pageId.startsWith('future-')) {
    const futureMonth = months.find((candidate) => candidate.id === pageId.replace('future-', ''));
    return [root, { label: futureMonth ? `${futureMonth.label} Preview` : 'Preview', pageId: null }];
  }

  if (page.type === 'cover') return [{ label: 'The Family Ledger', pageId: null }];

  const crumbs = [root];

  if (page.type === 'inside') {
    crumbs.push({ label: 'Inside Cover', pageId: null });
    return crumbs;
  }

  const monthData = months.find((candidate) => candidate.id === page.monthId);
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

const contentPageProps = (page, month) => ({
  page: page.pageInSection,
  totalInSection: page.totalInSection,
  data: julyData,
  month,
});

export default function App() {
  const [pageId, setPageId] = useState(pageFromHash);
  const [activeMonth, setActiveMonth] = useState('july');

  const isFuturePreview = pageId.startsWith('future-');
  const pageIndex = isFuturePreview ? -1 : julyPages.findIndex((candidate) => candidate.id === pageId);
  const page = isFuturePreview ? julyPages[0] : (julyPages[pageIndex] || julyPages[0]);
  const month = useMemo(() => months.find((m) => m.id === activeMonth) || months[0], [activeMonth]);
  const activeSection = page.sectionId || 'snapshot';
  const section = sections[activeSection];

  const navigateTo = useCallback((nextId, { replace = false } = {}) => {
    if (nextId.startsWith('future-')) {
      setPageId(nextId);
      setActiveMonth(nextId.replace('future-', ''));
      window.history[replace ? 'replaceState' : 'pushState']({}, '', `#/${nextId}`);
      return;
    }
    const nextPage = julyPages.find((candidate) => candidate.id === nextId);
    if (!nextPage) return;
    setPageId(nextId);
    if (nextPage.monthId) setActiveMonth(nextPage.monthId);
    window.history[replace ? 'replaceState' : 'pushState']({}, '', `#/${nextId}`);
  }, []);

  const goPrevious = useCallback(() => {
    if (isFuturePreview || pageIndex <= 0) return;
    navigateTo(julyPages[pageIndex - 1].id);
  }, [isFuturePreview, navigateTo, pageIndex]);

  const goNext = useCallback(() => {
    if (isFuturePreview || pageIndex < 0 || pageIndex >= julyPages.length - 1) return;
    navigateTo(julyPages[pageIndex + 1].id);
  }, [isFuturePreview, navigateTo, pageIndex]);

  const navigateToMonth = useCallback((id) => {
    setActiveMonth(id);
    if (id === 'july') { navigateTo('july'); return; }
    navigateTo(`future-${id}`);
  }, [navigateTo]);

  const goUpBreadcrumb = useCallback(() => {
    if (isFuturePreview) {
      navigateTo('cover');
      return;
    }
    const parentId = parentPageId(page);
    if (parentId) navigateTo(parentId);
  }, [isFuturePreview, navigateTo, page]);

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
      if (isFuturePreview || isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevious(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
      if (event.key === 'Escape') { event.preventDefault(); goUpBreadcrumb(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious, goUpBreadcrumb, isFuturePreview]);

  const hasNotebookNav = !isFuturePreview;

  let content;
  if (isFuturePreview) {
    const futureId = pageId.replace('future-', '');
    const futureMonth = months.find((candidate) => candidate.id === futureId) || months[1];
    content = <MonthChapterPage month={futureMonth} />;
  } else if (page.type === 'cover') content = <AnnualCover />;
  else if (page.type === 'inside') content = <InsideCover month={month} meta={julyData.meta} />;
  else if (page.type === 'month') content = <MonthChapterPage month={month} chapterMeta={julyData.meta} />;
  else if (page.type === 'divider') content = <SectionDivider section={section} month={month} />;
  else if (page.type === 'content' && activeSection === 'snapshot') {
    content = (
      <ContentShell>
        <SnapshotPages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'story') {
    content = (
      <ContentShell>
        <StoryPages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'spending') {
    content = (
      <ContentShell>
        <SpendingPages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'cfo') {
    content = (
      <ContentShell>
        <CfoPages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'future') {
    content = (
      <ContentShell>
        <FuturePages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'meeting') {
    content = (
      <ContentShell>
        <MeetingPages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'actions') {
    content = (
      <ContentShell>
        <ActionsPages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'celebrate') {
    content = (
      <ContentShell>
        <CelebratePages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  } else if (page.type === 'content' && activeSection === 'handoff') {
    content = (
      <ContentShell>
        <HandoffPages {...contentPageProps(page, month)} />
      </ContentShell>
    );
  }

  const showSections = !isFuturePreview && (page.type === 'divider' || page.type === 'content');
  const breadcrumbs = useMemo(() => buildBreadcrumbs(page, pageId), [page, pageId]);

  return (
    <main>
      <a className="skip-link" href="#notebook-content">Skip to notebook page</a>
      <div className="site-toolbar" aria-label="Notebook navigation">
        <BreadcrumbNav crumbs={breadcrumbs} onNavigate={navigateTo} />
        <span className="keyboard-help" title="Keyboard shortcuts">
          {isUsingLocalData && (
            <span className="data-source-badge" title="Loaded from src/data/july2026.local.js (gitignored)">
              Local data
            </span>
          )}
          {isFuturePreview ? 'Preview only' : '← → pages · Esc up a level'}
        </span>
      </div>
      <NotebookShell
        months={months}
        activeMonth={activeMonth}
        onMonthSelect={navigateToMonth}
        activeSection={activeSection}
        onSectionSelect={(id) => navigateTo(`july-${id}-1`)}
        showSections={showSections}
        onPagePrevious={goPrevious}
        onPageNext={goNext}
        hasPrevious={hasNotebookNav && pageIndex > 0}
        hasNext={hasNotebookNav && pageIndex >= 0 && pageIndex < julyPages.length - 1}
      >
        <div id="notebook-content">{content}</div>
      </NotebookShell>
    </main>
  );
}
