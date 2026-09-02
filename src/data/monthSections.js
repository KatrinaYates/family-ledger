/** Ordered monthly meeting sections — one scrollable page each. */
export const MONTH_SECTION_IDS = [
  'month',
  'spending',
  'future',
  'cfo',
  'retrospective',
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
  future: {
    number: '03',
    title: 'Future',
    description: 'Are we still moving toward what we want?',
    inside: 'Goals • retirement direction • upcoming expenses',
    how: 'Focus on trajectory, not re-reporting balances.',
    prompt: 'What does future-us need?',
    noteTone: 'lav',
    tone: 'lav',
  },
  cfo: {
    number: '04',
    title: 'CFO Advice',
    description: 'Given this month\'s financial picture and our future priorities, what should we do next?',
    inside: 'Priority moves • tradeoffs • decisions',
    how: 'Choose fewer, higher-impact moves.',
    prompt: 'What creates the most relief?',
    noteTone: 'coral',
    tone: 'coral',
  },
  retrospective: {
    number: '05',
    title: 'Retrospective',
    description: 'What worked, what did not, and what will we do next?',
    inside: 'Reflect • learn • action plan',
    how: 'Keep what helped, change what did not, and leave with a short list of next steps.',
    prompt: 'What would make next month easier?',
    noteTone: 'pink',
    tone: 'pink',
  },
  celebrate: {
    number: '06',
    title: 'Celebrate',
    description: 'What went right?',
    inside: 'Wins • habits • gratitude • rewards',
    how: 'Celebrate effort and direction, not only perfect results.',
    prompt: 'We are building this together!',
    noteTone: 'green',
    tone: 'green',
  },
  close: {
    number: '07',
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
