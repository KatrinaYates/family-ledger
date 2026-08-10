/** Ordered monthly meeting sections — one scrollable page each. */
export const MONTH_SECTION_IDS = [
  'month',
  'spending',
  'cfo',
  'future',
  'decisions',
  'actions',
  'celebrate',
  'close',
];

export const MONTH_SECTIONS = {
  month: {
    number: '01',
    title: 'Monthly Snapshot',
    description: 'Where we finished the month and what changed — headline orientation before the details.',
    inside: 'Income • spending • cash • debt • net worth • progress',
    how: 'Orient to the month in seconds before diving into categories and decisions.',
    prompt: 'What would the numbers miss?',
    noteTone: 'teal',
    tone: 'teal',
  },
  spending: {
    number: '02',
    title: 'Spending',
    description: 'Where did our money go, what changed, and what deserves attention?',
    inside: 'Pulse • categories • patterns • recurring • takeaways',
    how: 'Look for patterns worth discussing, not tiny imperfections.',
    prompt: 'What spending felt worth it?',
    noteTone: 'yellow',
    tone: 'yellow',
  },
  cfo: {
    number: '03',
    title: 'CFO Recommendations',
    description: 'What should we do about what we just learned?',
    inside: 'Priority moves • tradeoffs • decisions',
    how: 'Choose fewer, higher-impact moves.',
    prompt: 'What creates the most relief?',
    noteTone: 'coral',
    tone: 'coral',
  },
  future: {
    number: '04',
    title: 'Future',
    description: 'Are we still moving toward the life we want?',
    inside: 'Goals • retirement direction • upcoming expenses',
    how: 'Focus on trajectory, not re-reporting balances.',
    prompt: 'What does future-us need?',
    noteTone: 'lav',
    tone: 'lav',
  },
  decisions: {
    number: '05',
    title: 'Decisions',
    description: 'What did we agree on?',
    inside: 'Decisions • open questions • parking lot',
    how: 'Consolidate what you already discussed — no second questionnaire.',
    prompt: 'Capture agreements clearly.',
    noteTone: 'blue',
    tone: 'blue',
  },
  actions: {
    number: '06',
    title: 'Action Plan',
    description: 'Who is doing what next?',
    inside: 'Owners • due dates • status',
    how: 'Make every action specific and small enough to finish.',
    prompt: 'Tiny steps still count.',
    noteTone: 'pink',
    tone: 'pink',
  },
  celebrate: {
    number: '07',
    title: 'Celebrate',
    description: 'What went right?',
    inside: 'Wins • habits • gratitude • rewards',
    how: 'Celebrate effort and direction, not only perfect results.',
    prompt: 'We are building this together!',
    noteTone: 'green',
    tone: 'green',
  },
  close: {
    number: '08',
    title: 'Close the Month',
    description: 'What needs to carry forward?',
    inside: 'Summary • carry-forwards • lock',
    how: 'Finish the meeting and leave a clean record for next month.',
    prompt: 'What should future-us remember?',
    noteTone: 'blue',
    tone: 'slate',
  },
};

/** @param {string} sectionId */
export function getMonthSection(sectionId) {
  return MONTH_SECTIONS[sectionId] ?? null;
}
