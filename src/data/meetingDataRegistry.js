import { sectionPageCounts, sectionPageLabels } from './sectionPageCounts';

/** Rundown section groups shown in the UI. */
export const RUNDOWN_GROUPS = {
  decisions: { id: 'decisions', title: 'Decisions we made' },
  actions: { id: 'actions', title: 'Action items' },
  status: { id: 'status', title: 'Status & progress' },
  questions: { id: 'questions', title: 'Questions & answers' },
  conversation: { id: 'conversation', title: 'Conversation highlights' },
  lists: { id: 'lists', title: 'Lists & goals' },
  notes: { id: 'notes', title: 'Page notes' },
};

/** All content page IDs for per-page meeting notes. */
export function getAllMeetingPageIds() {
  const pageIds = [];
  for (const [section, count] of Object.entries(sectionPageCounts)) {
    for (let page = 1; page <= count; page += 1) {
      pageIds.push(`${section}-${page}`);
    }
  }
  return pageIds;
}

function pageNoteLabel(pageId) {
  const [section, pageStr] = pageId.split('-');
  const page = Number(pageStr);
  const labels = sectionPageLabels[section];
  const sectionLabel = labels?.[page - 1] ?? pageId;
  const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
  return `${sectionName} — ${sectionLabel}`;
}

function meetingKey(section, page, field) {
  return `fl-july-${section}-${page}-${field}`;
}

/** Static registry entries (excludes dynamic page notes). */
const staticEntries = [
  // Decisions
  { key: meetingKey('cfo', 1, 'decisions-outcome'), label: 'CFO Priority 1 — What we decided', group: 'decisions', type: 'text' },
  { key: meetingKey('cfo', 2, 'decisions-outcome'), label: 'CFO Priority 2 — What we decided', group: 'decisions', type: 'text' },
  { key: meetingKey('cfo', 3, 'decisions-outcome'), label: 'CFO Priority 3 — What we decided', group: 'decisions', type: 'text' },
  { key: 'fl-july-meeting-decisions', label: 'Meeting — Decisions we made', group: 'decisions', type: 'text' },
  { key: meetingKey('cfo', 1, 'decisions'), label: 'CFO Priority 1 — Options considered', group: 'decisions', type: 'checklist' },
  { key: meetingKey('cfo', 2, 'decisions'), label: 'CFO Priority 2 — Options considered', group: 'decisions', type: 'checklist' },
  { key: meetingKey('cfo', 3, 'decisions'), label: 'CFO Priority 3 — Options considered', group: 'decisions', type: 'checklist' },

  // Actions
  { key: meetingKey('actions', 1, 'plan'), label: 'Action plan', group: 'actions', type: 'actions' },

  // Status & progress
  { key: meetingKey('snapshot', 1, 'missing-before-lock'), label: 'Snapshot — Missing before lock', group: 'status', type: 'checklist' },
  { key: meetingKey('snapshot', 2, 'emergency-checks'), label: 'Snapshot — Emergency fund checks', group: 'status', type: 'checklist' },
  { key: meetingKey('snapshot', 3, 'ready-to-lock'), label: 'Snapshot — Ready to lock', group: 'status', type: 'checklist' },

  // Questions
  { key: meetingKey('spending', 2, 'questions'), label: 'Spending — Discussion questions', group: 'questions', type: 'questions' },
  { key: meetingKey('meeting', 2, 'questions'), label: 'Meeting — Open questions', group: 'questions', type: 'questions' },

  // Conversation
  { key: 'fl-july-meeting-surprised', label: 'What surprised us', group: 'conversation', type: 'text' },
  { key: 'fl-july-meeting-feltGood', label: 'What felt good', group: 'conversation', type: 'text' },
  { key: 'fl-july-meeting-feltStressful', label: 'What felt stressful', group: 'conversation', type: 'text' },
  { key: 'fl-july-meeting-parkingLot', label: 'Parking lot', group: 'conversation', type: 'text' },

  // Lists & goals
  { key: meetingKey('spending', 1, 'unexpected'), label: 'Spending — Likely unexpected', group: 'lists', type: 'bullets' },
  { key: meetingKey('story', 3, 'unclear-savings'), label: 'Story — Still unclear savings', group: 'lists', type: 'bullets' },
  { key: meetingKey('future', 1, 'still-to-define'), label: 'Future — Still to define', group: 'lists', type: 'bullets' },
  { key: meetingKey('future', 2, 'goals'), label: 'Future — Shared goals', group: 'lists', type: 'bullets' },
  { key: meetingKey('future', 2, 'upcoming'), label: 'Future — Upcoming expenses', group: 'lists', type: 'bullets' },
  { key: meetingKey('handoff', 1, 'carry-forward'), label: 'Handoff — Carry forward', group: 'lists', type: 'bullets' },
  { key: 'fl-july-celebrate-reward', label: 'Celebrate — Family reward', group: 'lists', type: 'text' },
  { key: 'fl-july-celebrate-gratitude', label: 'Celebrate — Gratitude', group: 'lists', type: 'text' },
];

function pageNoteEntries() {
  return getAllMeetingPageIds().map((pageId) => ({
    key: `fl-july-${pageId}-notes`,
    label: pageNoteLabel(pageId),
    group: 'notes',
    type: 'text',
  }));
}

/** Full registry: static fields plus dynamic page-note entries. */
export function getMeetingDataRegistry() {
  return [...staticEntries, ...pageNoteEntries()];
}
