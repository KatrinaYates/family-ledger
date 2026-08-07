import { sectionPageCounts, sectionPageLabels } from './sectionPageCounts';
import {
  celebrateKey,
  handoffKey,
  meetingConversationKey,
  meetingKey,
  pageNotesKey,
} from '../utils/meetingKeys';

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

/** @param {string} monthId */
function staticEntries(monthId) {
  return [
    { key: meetingKey(monthId, 'cfo', 1, 'decisions-outcome'), label: 'CFO Priority 1 — What we decided', group: 'decisions', type: 'text' },
    { key: meetingKey(monthId, 'cfo', 2, 'decisions-outcome'), label: 'CFO Priority 2 — What we decided', group: 'decisions', type: 'text' },
    { key: meetingKey(monthId, 'cfo', 3, 'decisions-outcome'), label: 'CFO Priority 3 — What we decided', group: 'decisions', type: 'text' },
    { key: meetingConversationKey(monthId, 'decisions'), label: 'Meeting — Decisions we made', group: 'decisions', type: 'text' },
    { key: meetingKey(monthId, 'cfo', 1, 'decisions'), label: 'CFO Priority 1 — Options considered', group: 'decisions', type: 'checklist' },
    { key: meetingKey(monthId, 'cfo', 2, 'decisions'), label: 'CFO Priority 2 — Options considered', group: 'decisions', type: 'checklist' },
    { key: meetingKey(monthId, 'cfo', 3, 'decisions'), label: 'CFO Priority 3 — Options considered', group: 'decisions', type: 'checklist' },

    { key: meetingKey(monthId, 'snapshot', 1, 'missing-before-lock'), label: 'Snapshot — Missing before lock', group: 'status', type: 'checklist' },
    { key: meetingKey(monthId, 'snapshot', 2, 'emergency-checks'), label: 'Snapshot — Emergency fund checks', group: 'status', type: 'checklist' },
    { key: meetingKey(monthId, 'snapshot', 3, 'ready-to-lock'), label: 'Snapshot — Ready to lock', group: 'status', type: 'checklist' },

    { key: meetingKey(monthId, 'spending', 2, 'questions'), label: 'Spending — Discussion questions', group: 'questions', type: 'questions' },
    { key: meetingKey(monthId, 'meeting', 2, 'questions'), label: 'Meeting — Open questions', group: 'questions', type: 'questions' },

    { key: meetingConversationKey(monthId, 'surprised'), label: 'What surprised us', group: 'conversation', type: 'text' },
    { key: meetingConversationKey(monthId, 'feltGood'), label: 'What felt good', group: 'conversation', type: 'text' },
    { key: meetingConversationKey(monthId, 'feltStressful'), label: 'What felt stressful', group: 'conversation', type: 'text' },
    { key: meetingConversationKey(monthId, 'parkingLot'), label: 'Parking lot', group: 'conversation', type: 'text' },

    { key: meetingKey(monthId, 'spending', 1, 'unexpected'), label: 'Spending — Likely unexpected', group: 'lists', type: 'bullets' },
    { key: meetingKey(monthId, 'story', 3, 'unclear-savings'), label: 'Story — Still unclear savings', group: 'lists', type: 'bullets' },
    { key: meetingKey(monthId, 'future', 1, 'still-to-define'), label: 'Future — Still to define', group: 'lists', type: 'bullets' },
    { key: meetingKey(monthId, 'future', 2, 'goals'), label: 'Future — Shared goals', group: 'lists', type: 'bullets' },
    { key: meetingKey(monthId, 'future', 2, 'upcoming'), label: 'Future — Upcoming expenses', group: 'lists', type: 'bullets' },
    { key: meetingKey(monthId, 'handoff', 1, 'carry-forward'), label: 'Handoff — Carry forward', group: 'lists', type: 'bullets' },
    { key: celebrateKey(monthId, 'reward'), label: 'Celebrate — Family reward', group: 'lists', type: 'text' },
    { key: celebrateKey(monthId, 'gratitude'), label: 'Celebrate — Gratitude', group: 'lists', type: 'text' },

    { key: handoffKey(monthId, 'decisions'), label: 'Handoff — Decisions made', group: 'decisions', type: 'text' },
    { key: handoffKey(monthId, 'open-actions'), label: 'Handoff — Open action items', group: 'actions', type: 'text' },
    { key: handoffKey(monthId, 'helpful'), label: 'Handoff — What was helpful', group: 'lists', type: 'text' },
    { key: handoffKey(monthId, 'repetitive'), label: 'Handoff — What felt repetitive', group: 'lists', type: 'text' },
    { key: handoffKey(monthId, 'missing'), label: 'Handoff — What was missing', group: 'lists', type: 'text' },
    { key: handoffKey(monthId, 'ideas'), label: 'Handoff — Ideas for next month', group: 'lists', type: 'text' },
  ];
}

/** @param {string} monthId */
function pageNoteEntries(monthId) {
  return getAllMeetingPageIds().map((pageId) => ({
    key: pageNotesKey(monthId, pageId),
    label: pageNoteLabel(pageId),
    group: 'notes',
    type: 'text',
  }));
}

/** @param {string} monthId */
export function getMeetingDataRegistry(monthId) {
  return [...staticEntries(monthId), ...pageNoteEntries(monthId)];
}
