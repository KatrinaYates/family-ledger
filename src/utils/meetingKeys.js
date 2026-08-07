/** @param {string} monthId @param {string} section @param {number | string} page @param {string} field */
export function meetingKey(monthId, section, page, field) {
    return `fl-${monthId}-${section}-${page}-${field}`;
}

/** @param {string} monthId @param {string} pageId */
export function pageNotesKey(monthId, pageId) {
    return `fl-${monthId}-${pageId}-notes`;
}

/** @param {string} monthId @param {string} field */
export function meetingConversationKey(monthId, field) {
    return `fl-${monthId}-meeting-${field}`;
}

/** @param {string} monthId @param {string} field */
export function celebrateKey(monthId, field) {
    return `fl-${monthId}-celebrate-${field}`;
}

/** @param {string} monthId @param {string} field */
export function handoffKey(monthId, field) {
    return `fl-${monthId}-handoff-${field}`;
}
