import { MONTH_SECTION_IDS, MONTH_SECTIONS } from './monthSections';
import {
  cfoDecisionKey,
  cfoDecisionOutcomeKey,
  ledgerFeedbackKey,
  sectionFieldKey,
  sectionNotesKey,
} from '../utils/meetingKeys';

/** Rundown section groups shown in the UI. */
export const RUNDOWN_GROUPS = {
  decisions: { id: 'decisions', title: 'Decisions we made' },
  actions: { id: 'actions', title: 'Action items' },
  questions: { id: 'questions', title: 'Questions & answers' },
  conversation: { id: 'conversation', title: 'Conversation highlights' },
  lists: { id: 'lists', title: 'Lists & goals' },
  notes: { id: 'notes', title: 'Section notes' },
  feedback: { id: 'feedback', title: 'Ledger feedback' },
};

/** @param {string} monthId */
function staticEntries(monthId) {
  const cfoEntries = [1, 2, 3].flatMap((n) => [
    {
      key: cfoDecisionOutcomeKey(monthId, n),
      label: `CFO Priority ${n} — What we decided`,
      group: 'decisions',
      type: 'text',
    },
    {
      key: cfoDecisionKey(monthId, n),
      label: `CFO Priority ${n} — Options considered`,
      group: 'decisions',
      type: 'checklist',
    },
  ]);

  return [
    ...cfoEntries,
    { key: sectionFieldKey(monthId, 'decisions', 'surprised'), label: 'What surprised us', group: 'conversation', type: 'text' },
    { key: sectionFieldKey(monthId, 'decisions', 'stressful'), label: 'What felt stressful', group: 'conversation', type: 'text' },
    { key: sectionFieldKey(monthId, 'decisions', 'parking-lot'), label: 'Parking lot', group: 'conversation', type: 'text' },
    { key: sectionFieldKey(monthId, 'decisions', 'questions'), label: 'Open questions', group: 'questions', type: 'questions' },
    { key: sectionFieldKey(monthId, 'spending', 'watch-contexts'), label: 'Spending — worth a closer look context', group: 'conversation', type: 'json' },
    { key: sectionFieldKey(monthId, 'spending', 'notable-notes'), label: 'Spending — notable one-time notes', group: 'lists', type: 'json' },
    { key: sectionFieldKey(monthId, 'spending', 'takeaway-worth'), label: 'Spending takeaway — what felt worth it', group: 'conversation', type: 'text' },
    { key: sectionFieldKey(monthId, 'spending', 'takeaway-differently'), label: 'Spending takeaway — do differently', group: 'conversation', type: 'text' },
    { key: sectionFieldKey(monthId, 'spending', 'takeaway-watch'), label: 'Spending takeaway — watch next month', group: 'conversation', type: 'text' },
    { key: sectionFieldKey(monthId, 'month', 'human-context'), label: "What the numbers don't know", group: 'lists', type: 'bullets' },
    { key: sectionFieldKey(monthId, 'future', 'still-to-define'), label: 'Future — still to define', group: 'lists', type: 'bullets' },
    { key: sectionFieldKey(monthId, 'future', 'goals'), label: 'Shared goals', group: 'lists', type: 'bullets' },
    { key: sectionFieldKey(monthId, 'future', 'upcoming'), label: 'Upcoming expenses', group: 'lists', type: 'bullets' },
    { key: sectionFieldKey(monthId, 'close', 'carry-forward'), label: 'Carry forward', group: 'lists', type: 'bullets' },
    { key: sectionFieldKey(monthId, 'close', 'decisions-summary'), label: 'Decisions summary', group: 'decisions', type: 'text' },
    { key: sectionFieldKey(monthId, 'close', 'open-actions'), label: 'Open action items', group: 'actions', type: 'text' },
    { key: sectionFieldKey(monthId, 'celebrate', 'reward'), label: 'Family reward', group: 'lists', type: 'text' },
    { key: sectionFieldKey(monthId, 'celebrate', 'gratitude'), label: 'Gratitude', group: 'lists', type: 'text' },
    { key: ledgerFeedbackKey(monthId, 'helpful'), label: 'Ledger feedback — helpful', group: 'feedback', type: 'text' },
    { key: ledgerFeedbackKey(monthId, 'repetitive'), label: 'Ledger feedback — repetitive', group: 'feedback', type: 'text' },
    { key: ledgerFeedbackKey(monthId, 'missing'), label: 'Ledger feedback — missing', group: 'feedback', type: 'text' },
    { key: ledgerFeedbackKey(monthId, 'ideas'), label: 'Ledger feedback — ideas', group: 'feedback', type: 'text' },
  ];
}

/** @param {string} monthId */
function sectionNoteEntries(monthId) {
  return MONTH_SECTION_IDS.map((sectionId) => ({
    key: sectionNotesKey(monthId, sectionId),
    label: `${MONTH_SECTIONS[sectionId]?.title ?? sectionId} — notes`,
    group: 'notes',
    type: 'text',
  }));
}

/** @param {string} monthId */
export function getMeetingDataRegistry(monthId) {
  return [...staticEntries(monthId), ...sectionNoteEntries(monthId)];
}
