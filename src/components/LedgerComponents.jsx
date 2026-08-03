import React from 'react';

export const sectionTabs = [
  ['snapshot','Snapshot'],['story','Monthly Story'],['spending','Spending'],['cfo','CFO Recommendations'],
  ['future','Retirement & Future'],['meeting','Money Meeting'],['actions','Action Plan'],['celebrate','Celebrate'],['handoff','CFO Handoff'],
];

export function SpiralBinding() {
  return <div className="spiral" aria-hidden="true">{Array.from({length:9},(_,i)=><span key={i}/>)}</div>;
}

export function MonthTabs({ months, activeMonth, onSelect }) {
  return <nav className="month-tabs" aria-label="Month chapters">{months.map((month)=><button key={month.id} className={`month-tab ${month.id} ${activeMonth===month.id?'active':''} ${month.status==='locked'?'future':''}`} onClick={()=>onSelect(month.id)} aria-current={activeMonth===month.id?'page':undefined} aria-label={`${month.label} 2026${month.status==='locked'?', preview only':''}`}>{month.short}</button>)}</nav>;
}

export function SectionTabs({ activeSection, onSelect }) {
  return <nav className="section-tabs" aria-label="Sections">{sectionTabs.map(([id,label],index)=><button key={id} className={`section-tab st${index+1} ${activeSection===id?'active':''}`} onClick={()=>onSelect(id)} aria-current={activeSection===id?'page':undefined}>{label}</button>)}</nav>;
}

export function NotebookShell({ children, months, activeMonth, onMonthSelect, activeSection, onSectionSelect, showSections=false }) {
  return <div className="stage"><div className="notebook"><div className="paper-edge"/><SpiralBinding/>{showSections&&<SectionTabs activeSection={activeSection} onSelect={onSectionSelect}/>}<MonthTabs months={months} activeMonth={activeMonth} onSelect={onMonthSelect}/>{children}</div></div>;
}

export function PageControls({ previous, next, current, total, onPrevious, onNext }) {
  return <nav className="page-controls" aria-label="Page navigation">
    <button type="button" onClick={onPrevious} disabled={!previous} aria-label={previous?`Previous page: ${previous.label}`:'No previous page'}>
      <span className="arrow" aria-hidden="true">←</span>
      <span className="control-copy"><small>Previous</small><b>{previous?.label || 'Beginning'}</b></span>
    </button>
    <div className="page-position" aria-live="polite"><b>{current}</b><span>of</span><b>{total}</b></div>
    <button type="button" onClick={onNext} disabled={!next} aria-label={next?`Next page: ${next.label}`:'No next page'}>
      <span className="control-copy align-right"><small>Next</small><b>{next?.label || 'End of ledger'}</b></span>
      <span className="arrow" aria-hidden="true">→</span>
    </button>
  </nav>;
}

export function StickyNote({ children, tone='yellow', className='' }) {
  return <aside className={`sticky-note ${tone} ${className}`}><span className="tape" aria-hidden="true"/>{children}</aside>;
}

export function AnnualCover({ onOpen }) {
  return <div className="cover-page"><span className="cover-doodle leaf">🌿</span><span className="cover-doodle sun">☀️</span><div className="cover-label"><p>THE FAMILY</p><h1 className="notebook-page-title" tabIndex="-1">The Family<br/>Ledger</h1><strong>2026 EDITION</strong></div><StickyNote className="motto">Financial Motto<br/><b>Progress over perfection.</b></StickyNote><StickyNote tone="pink" className="joy">A joyful place for our monthly money meetings. ♡</StickyNote><button className="open-cover" onClick={onOpen}>Open the ledger <span>→</span></button></div>;
}

export function InsideCover({ onContinue }) {
  return <div className="inside-cover"><span className="season-doodle top">🌻</span><span className="season-doodle bottom">☀️</span><div className="season-badge">JULY • SUNSHINE EDITION</div><div className="inside-panel"><h1 className="notebook-page-title" tabIndex="-1">This Ledger Belongs To</h1><p>A shared place for honest conversations, clear decisions, and steady progress.</p>{[['Names','Katrina & Tyler'],['Started','July 2026'],['Our Financial Motto','Progress over perfection.'],['Why We Meet','To stay informed, make intentional decisions, and build the future we want together.']].map(([label,value])=><div className="belong-line" key={label}><b>{label}</b><span>{value}</span></div>)}<StickyNote className="inside-note">A little clarity today makes next month easier. ♡</StickyNote><button className="continue-button" onClick={onContinue}>Turn the page →</button></div></div>;
}

export function MonthChapterPage({ month, onEnter }) {
  if(month.status==='locked') return <FutureMonthPage month={month}/>;
  return <div className="month-chapter" style={{'--month-a':month.colors[0],'--month-b':month.colors[1],'--month-c':month.colors[2]}}><div className="month-band"/><div className="month-content"><p>CHAPTER {month.number}</p><h1 className="notebook-page-title" tabIndex="-1">{month.label}<br/>2026</h1><div className="chapter-sub">A fresh monthly reset for our money, goals, decisions, and future.</div><div className="chapter-meta"><span>📅 July 5, 2026</span><span>⏱ 55 minutes</span><span>{month.icon} {month.season}</span></div></div><div className="month-sticker">{month.sticker}</div><StickyNote className="chapter-note">This month’s intention:<br/><b>Be curious, not critical.</b></StickyNote><div className="folder-pocket"><b>{month.label} Focus</b><br/>Debt down.<br/>Savings up.<br/>Keep momentum gentle.</div>{onEnter&&<button className="enter-chapter" onClick={onEnter}>Enter {month.label} chapter →</button>}</div>;
}

export function FutureMonthPage({ month }) {
  return <div className="future-month" style={{'--month-a':month.colors[0],'--month-b':month.colors[1],'--month-c':month.colors[2]}}><div className="month-band"/><div className="month-content"><p>CHAPTER {month.number}</p><h1 className="notebook-page-title" tabIndex="-1">{month.label}<br/>2026</h1><div className="chapter-sub">This month’s pages are already waiting inside The Family Ledger. All that’s missing is your real story.</div></div><div className="month-sticker">{month.sticker}</div><StickyNote className="chapter-note">{month.message}<br/><b>{month.promise}</b></StickyNote><div className="folder-pocket"><b>{month.label} Preview</b><br/>{month.preview.map((line)=><React.Fragment key={line}>{line}<br/></React.Fragment>)}</div></div>;
}

export function SectionDivider({ section, onOpen }) {
  return <div className="subchapter"><div className="margin-line"/><div className={`subchapter-ribbon ${section.tone}`}>SECTION {section.number}</div><StickyNote tone={section.noteTone} className="subchapter-note">{section.prompt}</StickyNote><div className="subchapter-content"><p>JULY 2026</p><h1 className="notebook-page-title" tabIndex="-1">{section.title}</h1><div className="subchapter-intro">{section.description}</div><div className="preview-grid"><div className="preview-card"><h3>Inside this section</h3><p>{section.inside}</p></div><div className="preview-card"><h3>How to use it</h3><p>{section.how}</p></div></div><button className="open-section" onClick={onOpen}>Turn to the working page →</button></div><div className="subchapter-doodle">{section.icon}</div></div>;
}

export function WorkingPage({ section, children }) {
  return <div className="working-page"><div className="margin-line"/><div className="working-content"><header><div><h1 className="notebook-page-title" tabIndex="-1">{section.title}</h1><span className="month-chip">JULY 2026</span></div><span className="season-badge">JULY • SUNSHINE EDITION</span></header>{children}</div><span className="page-number">July • working page</span></div>;
}

export function KpiCard({ icon, label, value, status, tone='good', note }) { return <article className="card kpi"><div className="kpi-top"><span>{icon} {label}</span><span>↗</span></div><strong className="kpi-value">{value}</strong><span className={`chip ${tone}`}>{status}</span><p>{note}</p></article>; }
export function NoteCard({ title, children }) { return <article className="card note-card"><h3>{title}</h3>{children}</article>; }
export function WritingArea({ label, value, onChange, placeholder }) { return <label className="writing-area"><span>{label}</span><textarea value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/></label>; }
