import React from 'react';
import sunflower from "../assets/illustrations/sunflower.svg";
import pencil from "../assets/illustrations/pencil.svg";
import ghost from "../assets/illustrations/ghost.svg";
import turkey from "../assets/illustrations/turkey.svg";
import christmasTree from "../assets/illustrations/christmas-tree.svg";
import vineDoodle from "../assets/illustrations/vine-doodle.svg";
import sunIllustration from "../assets/illustrations/sun.svg";
import { PageLoader } from '../context/BootGate.jsx';
import { LedgerFeedbackButton } from './LedgerFeedbackPanel.jsx';

const illustrations = {
    sunflower,
    pencil,
    ghost,
    turkey,
    "christmas-tree": christmasTree,
    "vine-doodle": vineDoodle,
    sun: sunIllustration,
};

export const ILLUSTRATION_NAMES = Object.keys(illustrations);

import { MONTH_SECTION_IDS, MONTH_SECTIONS } from '../data/monthSections';

export const sectionTabs = MONTH_SECTION_IDS.map((id) => [
  id,
  MONTH_SECTIONS[id].title,
  MONTH_SECTIONS[id].title.split(' ')[0],
]);

export function Illustration({name, className = ""}) {
    const src = illustrations[name];
    if (!src) return null;
    return <img src={src} alt="" aria-hidden="true" className={className} />;
}

export const WASHI_TAPE_COLORS = {
  pink: '#F6ABC0',
  teal: '#7EC8C4',
  lavender: '#C4B0EE',
  gold: '#F0D978',
  mint: '#A8DDB5',
  coral: '#FFB8A8',
  sky: '#9DD4E8',
};

/** Contrasting washi tape per sticky note tone — mix-and-match, not matchy-matchy. */
export const STICKY_TONE_WASHI = {
  yellow: 'pink',
  pink: 'teal',
  blue: 'coral',
  green: 'lavender',
  lav: 'gold',
  coral: 'sky',
};

export function WashiTape({ className = '', color = 'pink' }) {
  const fill = WASHI_TAPE_COLORS[color] ?? WASHI_TAPE_COLORS.pink;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 25"
      fill="none"
      aria-hidden="true"
      className={`washi-tape ${className}`.trim()}
    >
      <rect width="88" height="25" rx="2" fill={fill} opacity="0.85" />
      <g stroke="#fff" strokeWidth="1.5" opacity="0.5">
        <line x1="0" y1="8" x2="88" y2="8" />
        <line x1="0" y1="17" x2="88" y2="17" />
      </g>
      <g fill="#fff" opacity="0.35">
        <circle cx="15" cy="12" r="2" />
        <circle cx="44" cy="12" r="2" />
        <circle cx="73" cy="12" r="2" />
      </g>
    </svg>
  );
}

export function Polaroid({month, className = ""}) {
    const photoBackground = `linear-gradient(145deg, ${month.colors[0]}, ${month.colors[1]} 55%, ${month.colors[2]})`;

    return (
        <figure className={`polaroid ${className}`} aria-hidden="true">
            <WashiTape color="pink" className="polaroid-tape-left" />
            <WashiTape color="teal" className="polaroid-tape-right" />
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
          {months.map((month) => (
              <button
                  key={month.id}
                  className={`month-tab ${month.slug} ${activeMonth === month.id ? "active" : ""}`}
                  onClick={() => onSelect(month.id)}
                  aria-current={activeMonth === month.id ? "page" : undefined}
                  aria-label={`${month.label} ${month.year ?? 2026}`}>
                  {month.short}
              </button>
          ))}
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

export function StickyNote({
  children,
  tone = 'yellow',
  className = '',
  inline = false,
  washi = true,
  washiColor,
}) {
  const tapeColor = washiColor ?? STICKY_TONE_WASHI[tone] ?? 'pink';

  return (
    <aside className={`sticky-note ${tone}${inline ? ' is-inline' : ''} ${className}`.trim()}>
      {washi && <WashiTape color={tapeColor} />}
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

export function InsideCover({ month, insideCover }) {
    if (insideCover?.loading || !insideCover?.fields?.length) {
        return (
            <div className="inside-cover inside-cover--loading">
                <PageLoader aria-label="Filling in your page" />
            </div>
        );
    }

    const fieldById = Object.fromEntries(insideCover.fields.map((field) => [field.id, field]));

    const fields = [
        {
            label: 'Names',
            id: 'names',
            placeholder: 'Who is this ledger for?',
        },
        {
            label: 'Started',
            id: 'started',
            placeholder: `e.g. ${month.label} ${month.year ?? 2026}`,
        },
        {
            label: 'Our Financial Motto',
            id: 'motto',
            placeholder: 'A phrase that guides your money meetings',
        },
        {
            label: 'Why We Meet',
            id: 'why-we-meet',
            placeholder: 'What do you hope these conversations create?',
        },
    ];

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
                {fields.map(({ label, id, placeholder }) => {
                    const field = fieldById[id];
                    return (
                    <label className="belong-line" key={id}>
                        <b>{label}</b>
                        <input
                            type="text"
                            className="belong-line-input"
                            value={field.value}
                            onChange={(event) => field.setValue(event.target.value)}
                            placeholder={placeholder}
                            disabled={field.saving}
                        />
                    </label>
                    );
                })}
                {insideCover.saveError && (
                    <p className="field-save-error belong-line-error" role="alert">
                        {insideCover.saveError}
                    </p>
                )}
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

function formatGenerationDate(value, month) {
    if (!value) return `${month.label} ${month.year ?? 2026}`;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return `${month.label} ${month.year ?? 2026}`;
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export function MonthChapterPage({ month, chapterMeta }) {
    const generatedDate = formatGenerationDate(chapterMeta?.generatedAt, month);
    const meetingLength = chapterMeta?.meetingLength || '55 minutes';
    const intention = chapterMeta?.intention || chapterMeta?.motto || 'Be curious, not critical.';
    const focus = chapterMeta?.focus || 'Debt down. Savings up. Keep momentum gentle.';
    return (
        <div className="month-chapter" style={{"--month-a": month.colors[0], "--month-b": month.colors[1], "--month-c": month.colors[2]}}>
            <div className="month-band" />
            <div className="month-content">
                <p>CHAPTER {month.number}</p>
                <h1 className="notebook-page-title chapter-month-title" tabIndex="-1">
                    <span>{month.label}</span>
                    <span>{month.year ?? 2026}</span>
                </h1>
                <div className="chapter-sub">A fresh monthly reset for our money, goals, decisions, and future.</div>
                <div className="chapter-meta">
                    <span title="Date this month ledger was generated">📅 {generatedDate}</span>
                    <span>⏱ {meetingLength}</span>
                    <LedgerFeedbackButton variant="chapter" />
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
