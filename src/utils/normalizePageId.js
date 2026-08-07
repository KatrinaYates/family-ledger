/** Maps legacy English month names to year-month IDs for bookmark compatibility. */
const LEGACY_MONTH_IDS = {
    july: '2026-07',
    august: '2026-08',
    september: '2026-09',
    october: '2026-10',
    november: '2026-11',
    december: '2026-12',
};

/** @param {string} pageId */
export function normalizePageId(pageId) {
    if (!pageId) return pageId;

    if (pageId.startsWith('future-')) {
        const legacyMonth = pageId.slice('future-'.length);
        const modernMonthId = LEGACY_MONTH_IDS[legacyMonth] ?? legacyMonth;
        return `future-${modernMonthId}`;
    }

    if (pageId === 'july') return '2026-07';
    if (pageId.startsWith('july-')) return `2026-07-${pageId.slice('july-'.length)}`;

    return pageId;
}
