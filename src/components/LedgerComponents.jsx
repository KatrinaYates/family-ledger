import React from 'react';
import sunflower from "../assets/illustrations/sunflower.svg";
import pencil from "../assets/illustrations/pencil.svg";
import ghost from "../assets/illustrations/ghost.svg";
import turkey from "../assets/illustrations/turkey.svg";
import christmasTree from "../assets/illustrations/christmas-tree.svg";
import vineDoodle from "../assets/illustrations/vine-doodle.svg";
import sunIllustration from "../assets/illustrations/sun.svg";
import washiTape from "../assets/illustrations/washi-tape.svg";

const illustrations = {
    sunflower,
    pencil,
    ghost,
    turkey,
    "christmas-tree": christmasTree,
    "vine-doodle": vineDoodle,
    sun: sunIllustration,
};

export const sectionTabs = [
    ["snapshot", "Snapshot", "Snap"],
    ["story", "Monthly Story", "Story"],
    ["spending", "Spending", "Spend"],
    ["cfo", "CFO Recs", "CFO"],
    ["future", "Retirement & Future", "Future"],
    ["meeting", "Money Meeting", "Meet"],
    ["actions", "Action Plan", "Actions"],
    ["celebrate", "Celebrate", "Win"],
    ["handoff", "CFO Handoff", "Handoff"],
];

export function Illustration({name, className = ""}) {
    const src = illustrations[name];
    if (!src) return null;
    return <img src={src} alt="" aria-hidden="true" className={className} />;
}

export function WashiTape({className = ""}) {
    return <img src={washiTape} alt="" aria-hidden="true" className={`washi-tape ${className}`} />;
}

export function Polaroid({month, className = ""}) {
    const photoBackground = `linear-gradient(145deg, ${month.colors[0]}, ${month.colors[1]} 55%, ${month.colors[2]})`;

    return (
        <figure className={`polaroid ${className}`} aria-hidden="true">
            <WashiTape className="polaroid-tape-left" />
            <WashiTape className="polaroid-tape-right" />
            <div className="polaroid-photo" style={{background: photoBackground}}>
                <Illustration name={month.illustration} className="polaroid-photo-art" />
            </div>
            <figcaption className="polaroid-caption">{month.label} {month.year ?? 2026}</figcaption>
        </figure>
    );
}

export function LeftPage() {
  return (
    <div className="left-page" aria-hidden="true">
      <div className="left-page-stack-edge" />
      <div className="left-page-margin" />
      <div className="left-page-ghost" />
    </div>
  );
}

export function SpiralBinding() {
  return (
      <div className="spiral" aria-hidden="true">
          {Array.from({length: 9}, (_, i) => (
              <span key={i} style={{"--ring-offset": `${(i % 2) * 2}px`}} />
          ))}
      </div>
  );
}

export function MonthTabs({ months, availableMonthIds = [], activeMonth, onSelect }) {
  return (
      <nav className="month-tabs" aria-label="Month chapters">
          {months.map((month) => {
              const hasData = availableMonthIds.includes(month.id);
              const isPreview = !hasData;
              return (
              <button
                  key={month.id}
                  className={`month-tab ${month.slug} ${activeMonth === month.id ? "active" : ""} ${isPreview ? "future" : ""}`}
                  onClick={() => onSelect(month.id)}
                  aria-current={activeMonth === month.id ? "page" : undefined}
                  aria-label={`${month.label} ${month.year ?? 2026}${isPreview ? ", preview only" : ""}`}>
                  {month.short}
              </button>
              );
          })}
      </nav>
  );
}

export function SectionTabs({ activeSection, onSelect }) {
  return (
      <nav className="section-tabs" aria-label="Sections">
          {sectionTabs.map(([id, label, shortLabel], index) => (
              <button key={id} className={`section-tab st${index + 1} ${activeSection === id ? "active" : ""}`} onClick={() => onSelect(id)} aria-current={activeSection === id ? "page" : undefined} title={label}>
                  <span className="section-tab-label-full">{label}</span>
                  <span className="section-tab-label-short">{shortLabel}</span>
              </button>
          ))}
      </nav>
  );
}

export function PageTurnZones({onPrevious, onNext, hasPrevious, hasNext}) {
    return (
        <div className="page-turn-zones" aria-hidden={false}>
            {hasPrevious && (
                <button type="button" className="page-turn-zone page-turn-prev" onClick={onPrevious} aria-label="Previous page">
                    <span className="page-turn-glyph" aria-hidden="true">
                        ‹
                    </span>
                </button>
            )}
            {hasNext && (
                <button type="button" className="page-turn-zone page-turn-next" onClick={onNext} aria-label="Next page">
                    <span className="page-turn-curl" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

export function NotebookShell({children, months, availableMonthIds, activeMonth, onMonthSelect, activeSection, onSectionSelect, showSections = false, showLeftPage = true, onPagePrevious, onPageNext, hasPrevious = false, hasNext = false}) {
    return (
        <div className="desk-scene">
            <div className="stage">
                <div className={`notebook${showSections ? " has-section-tabs" : ""}${showLeftPage ? "" : " is-closed"}`}>
                    {showLeftPage && <LeftPage />}
                    <div className="page-stack-edge" aria-hidden="true" />
                    <SpiralBinding />
                    {showSections && <SectionTabs activeSection={activeSection} onSelect={onSectionSelect} />}
                    <MonthTabs months={months} availableMonthIds={availableMonthIds} activeMonth={activeMonth} onSelect={onMonthSelect} />
                    {children}
                    {(hasPrevious || hasNext) && <PageTurnZones onPrevious={onPagePrevious} onNext={onPageNext} hasPrevious={hasPrevious} hasNext={hasNext} />}
                </div>
            </div>
        </div>
    );
}

export function StickyNote({children, tone = "yellow", className = ""}) {
    return (
        <aside className={`sticky-note ${tone} ${className}`}>
            <WashiTape />
            {children}
        </aside>
    );
}

export function MonthDateBadge({month}) {
    return <span className="month-date-badge">{month.label.toUpperCase()} {month.year ?? 2026}</span>;
}

export function AnnualCover() {
    return (
        <div className="cover-page">
            <Illustration name="vine-doodle" className="cover-doodle leaf" />
            <Illustration name="sun" className="cover-doodle sun" />
            <div className="cover-label">
                <h1 className="notebook-page-title" tabIndex="-1">
                    The Family
                    <br />
                    Ledger
                </h1>
                <strong>2026 EDITION</strong>
            </div>
            <StickyNote className="motto">
                Financial Motto
                <br />
                <b>Progress over perfection.</b>
            </StickyNote>
            <StickyNote tone="pink" className="joy">
                A joyful place for our monthly money meetings. ♡
            </StickyNote>
        </div>
    );
}

export function InsideCover({month, meta}) {
    const motto = meta?.motto || 'Progress over perfection.';
    const names = meta?.names || 'Person A & Person B';
    return (
        <div className="inside-cover">
            <Illustration name="sunflower" className="season-doodle top" />
            <Illustration name="sun" className="season-doodle bottom" />
            <MonthDateBadge month={month} />
            <div className="inside-panel">
                <h1 className="notebook-page-title" tabIndex="-1">
                    This Ledger Belongs To
                </h1>
                <p>A shared place for honest conversations, clear decisions, and steady progress.</p>
                {[
                    ['Names', names],
                    ['Started', `${month.label} ${month.year ?? 2026}`],
                    ['Our Financial Motto', motto],
                    ['Why We Meet', 'To stay informed, make intentional decisions, and build the future we want together.'],
                ].map(([label, value]) => (
                    <div className="belong-line" key={label}>
                        <b>{label}</b>
                        <span>{value}</span>
                    </div>
                ))}
                <StickyNote className="inside-note">A little clarity today makes next month easier. ♡</StickyNote>
            </div>
        </div>
    );
}

export function FocusPocket({title, children}) {
    return (
        <aside className="focus-pocket">
            <div className="focus-pocket-sleeve" aria-hidden="true" />
            <div className="focus-pocket-card">
                <h3>{title}</h3>
                <div className="focus-pocket-body">{children}</div>
            </div>
        </aside>
    );
}

export function MonthChapterPage({month, chapterMeta, hasLedgerData = true}) {
    if (!hasLedgerData) return <FutureMonthPage month={month} />;
    const meetingDate = chapterMeta?.meetingDate || `${month.label} 5, ${month.year ?? 2026}`;
    const meetingLength = chapterMeta?.meetingLength || '55 minutes';
    const intention = chapterMeta?.intention || chapterMeta?.motto || 'Be curious, not critical.';
    const focus = chapterMeta?.focus || 'Debt down. Savings up. Keep momentum gentle.';
    return (
        <div className="month-chapter" style={{"--month-a": month.colors[0], "--month-b": month.colors[1], "--month-c": month.colors[2]}}>
            <div className="month-band" />
            <div className="month-content">
                <p>CHAPTER {month.number}</p>
                <h1 className="notebook-page-title" tabIndex="-1">
                    {month.label}
                    <br />
                    {month.year ?? 2026}
                </h1>
                <div className="chapter-sub">A fresh monthly reset for our money, goals, decisions, and future.</div>
                <div className="chapter-meta">
                    <span>📅 {meetingDate}</span>
                    <span>⏱ {meetingLength}</span>
                    <span>{month.icon} {month.season}</span>
                </div>
            </div>
            <Polaroid month={month} className="chapter-polaroid" />
            <StickyNote className="chapter-note">
                Financial motto:
                <br />
                <b>{intention}</b>
            </StickyNote>
            <FocusPocket title={`${month.label} Focus`}>
                <p>{focus}</p>
            </FocusPocket>
        </div>
    );
}

export function FutureMonthPage({month}) {
    return (
        <div className="future-month" style={{"--month-a": month.colors[0], "--month-b": month.colors[1], "--month-c": month.colors[2]}}>
            <div className="month-band" />
            <div className="month-content">
                <p>CHAPTER {month.number}</p>
                <h1 className="notebook-page-title" tabIndex="-1">
                    {month.label}
                    <br />
                    {month.year ?? 2026}
                </h1>
                <div className="chapter-sub">This chapter is in the catalog, but no ledger data file exists yet.</div>
                <p className="ledger-preview-notice">
                    No ledger data found for <code>{month.id}</code>. Add{' '}
                    <code>{`src/data/months/${month.id}.sample.js`}</code> or a gitignored local file to open the full notebook.
                </p>
            </div>
            <Polaroid month={month} className="chapter-polaroid" />
            <StickyNote className="chapter-note">
                {month.message ?? 'Coming soon.'}
                <br />
                <b>{month.promise ?? 'We will open this chapter together.'}</b>
            </StickyNote>
            <FocusPocket title={`${month.label} Preview`}>
                <ul className="focus-pocket-list">
                    {(month.preview ?? []).map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
            </FocusPocket>
        </div>
    );
}

export function SectionDivider({section, month}) {
    return (
        <div className="subchapter">
            <div className="margin-line" />
            <div className={`subchapter-ribbon ${section.tone}`}>SECTION {section.number}</div>
            <StickyNote tone={section.noteTone} className="subchapter-note">
                {section.prompt}
            </StickyNote>
            <div className="subchapter-content">
                <MonthDateBadge month={month} />
                <h1 className="notebook-page-title" tabIndex="-1">
                    {section.title}
                </h1>
                <div className="subchapter-intro">{section.description}</div>
                <div className="preview-grid">
                    <div className="preview-card">
                        <h3>Inside this section</h3>
                        <p>{section.inside}</p>
                    </div>
                    <div className="preview-card">
                        <h3>How to use it</h3>
                        <p>{section.how}</p>
                    </div>
                </div>
            </div>
            <Illustration name={month.illustration} className="subchapter-doodle" />
        </div>
    );
}

export function WorkingPage({section, month, children}) {
    return (
        <div className="working-page">
            <div className="margin-line" />
            <div className="working-content">
                <header>
                    <h1 className="notebook-page-title" tabIndex="-1">
                        {section.title}
                    </h1>
                    <MonthDateBadge month={month} />
                </header>
                {children}
            </div>
        </div>
    );
}

export function ContentShell({ children, className = '' }) {
    return (
        <div className={`working-page content-shell ${className}`.trim()}>
            <div className="margin-line" />
            <div className="working-content content-shell-inner">
                <div className="content-body">{children}</div>
            </div>
        </div>
    );
}

export function KpiCard({icon, label, value, status, tone = "good", note}) {
    return (
        <article className="card kpi">
            <div className="kpi-top">
                <span>
                    {icon} {label}
                </span>
                <span>↗</span>
            </div>
            <strong className="kpi-value">{value}</strong>
            <span className={`chip ${tone}`}>{status}</span>
            <p>{note}</p>
        </article>
    );
}

export function NoteCard({title, children}) {
    return (
        <article className="card note-card">
            <h3>{title}</h3>
            {children}
        </article>
    );
}

export function WritingArea({label, value, onChange, placeholder}) {
    return (
        <label className="writing-area">
            <span>{label}</span>
            <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        </label>
    );
}
