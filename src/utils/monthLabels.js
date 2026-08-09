const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * @param {string} monthId YYYY-MM
 * @returns {{ year: number, month: number } | null}
 */
export function parseMonthId(monthId) {
    const match = /^(\d{4})-(\d{2})$/.exec(monthId ?? '');
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) return null;
    return { year, month };
}

/**
 * @param {number} year
 * @param {number} month 1-12
 */
export function monthNameFromParts(year, month) {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('en-US', { month: 'long' });
}

/**
 * @param {string} monthId YYYY-MM
 * @param {string} [currentLabel] optional display label from meta/catalog
 */
export function getComparisonMonthLabels(monthId, currentLabel) {
    const parsed = parseMonthId(monthId);
    if (!parsed) {
        return {
            currentLabel: currentLabel?.trim() || 'Current',
            priorLabel: 'Prior',
        };
    }

    const current = currentLabel?.trim() || monthNameFromParts(parsed.year, parsed.month);
    const priorDate = new Date(parsed.year, parsed.month - 2, 1);
    const priorLabel = MONTH_NAMES[priorDate.getMonth()] ?? 'Prior';

    return { currentLabel: current, priorLabel };
}
