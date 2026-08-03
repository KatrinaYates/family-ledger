import React, { useMemo, useState } from 'react';
import { months } from './data/months';
import { AnnualCover, InsideCover, KpiCard, MonthChapterPage, NotebookShell, NoteCard, SectionDivider, WorkingPage, WritingArea } from './components/LedgerComponents';

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

function SnapshotContent(){return <><div className="kpi-grid"><KpiCard icon="📈" label="Net Worth" value="$108,240" status="Growing" note="Up $4,390 since June."/><KpiCard icon="💵" label="Cash" value="$14,620" status="Healthy" note="Comfortable month-end cushion."/><KpiCard icon="🛟" label="Emergency Fund" value="3.8 mo" status="On track" note="Next milestone: four months."/><KpiCard icon="🏡" label="Debt" value="$42,180" status="Focus" tone="watch" note="Down $1,260 this month."/></div><div className="working-grid"><NoteCard title="What the numbers are saying"><p>The overall picture is moving in the right direction. Debt decreased, savings held steady, and the month stayed manageable without feeling overly restricted.</p></NoteCard><NoteCard title="This month’s pulse"><div className="progress-label"><span>Financial health</span><b>78%</b></div><div className="highlighter"><span style={{width:'78%'}}/></div><p>Stable, improving, and ready for one focused next move.</p></NoteCard></div></>}

export default function App(){
  const [view,setView]=useState('cover');
  const [activeMonth,setActiveMonth]=useState('july');
  const [activeSection,setActiveSection]=useState('snapshot');
  const [sectionMode,setSectionMode]=useState('divider');
  const [notes,setNotes]=useState(()=>localStorage.getItem('family-ledger-july-notes')||'');
  const month=useMemo(()=>months.find(m=>m.id===activeMonth)||months[0],[activeMonth]);
  const section=sections[activeSection];
  const chooseMonth=(id)=>{setActiveMonth(id);setView('month');};
  const chooseSection=(id)=>{setActiveSection(id);setSectionMode('divider');setView('section');};
  const saveNotes=(value)=>{setNotes(value);localStorage.setItem('family-ledger-july-notes',value)};

  let content;
  if(view==='cover') content=<AnnualCover onOpen={()=>setView('inside')}/>;
  else if(view==='inside') content=<InsideCover onContinue={()=>setView('month')}/>;
  else if(view==='month') content=<MonthChapterPage month={month} onEnter={()=>{setView('section');setSectionMode('divider')}}/>;
  else if(sectionMode==='divider') content=<SectionDivider section={section} onOpen={()=>setSectionMode('working')}/>;
  else content=<WorkingPage section={section}>{activeSection==='snapshot'?<SnapshotContent/>:<div className="working-grid"><NoteCard title={`${section.title} workspace`}><p>This working page will use the same calm, writable planner system as the approved prototype while its detailed data components are added.</p></NoteCard><WritingArea label="Meeting notes" value={notes} onChange={saveNotes} placeholder="Write together here..."/></div>}</WorkingPage>;

  return <main><div className="utility-nav"><button onClick={()=>setView('cover')}>Cover</button><button onClick={()=>setView('inside')}>Inside Cover</button><button onClick={()=>setView('month')}>{month.label} Chapter</button></div><NotebookShell months={months} activeMonth={activeMonth} onMonthSelect={chooseMonth} activeSection={activeSection} onSectionSelect={chooseSection} showSections={view==='section'}>{content}</NotebookShell></main>;
}
