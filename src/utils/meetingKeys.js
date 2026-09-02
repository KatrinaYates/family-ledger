/** @param {string} field */
export function ledgerInsideKey(field) {
  return `fl-ledger-inside-${field}`;
}

/** @param {string} monthId @param {string} section @param {string} field */
export function sectionFieldKey(monthId, section, field) {
  return `fl-${monthId}-${section}-${field}`;
}

/** @param {string} monthId @param {string} section */
export function sectionNotesKey(monthId, section) {
  return `fl-${monthId}-${section}-notes`;
}

/** @param {string} monthId @param {number} priorityIndex 1-based */
export function cfoDecisionKey(monthId, priorityIndex) {
  return sectionFieldKey(monthId, 'cfo', `p${priorityIndex}-decisions`);
}

/** @param {string} monthId @param {number} priorityIndex 1-based */
export function cfoDecisionOutcomeKey(monthId, priorityIndex) {
  return sectionFieldKey(monthId, 'cfo', `p${priorityIndex}-outcome`);
}

/** @param {string} monthId @param {string} field */
export function ledgerFeedbackKey(monthId, field) {
  return `fl-${monthId}-ledger-feedback-${field}`;
}

/** @param {string} monthId @param {string} questionId */
export function retrospectiveQuestionKey(monthId, questionId) {
  return sectionFieldKey(monthId, 'retrospective', `question-${questionId}`);
}
