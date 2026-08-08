import { getMonthCatalogEntry } from '../data/months.js';
import { applyBlankSourceDefaults } from '../data/blankSourceDefaults.js';

/** @param {string} monthId @returns {import('./types.js').LedgerMonth} */
export function createBlankLedgerMonth(monthId) {
    return {
        schemaVersion: 1,
        monthId,
        version: 1,
        updatedAt: null,
        workflow: {
            status: 'draft',
            sourceAsOf: null,
            reviewedAt: null,
            lockedAt: null,
        },
        generation: {
            source: 'manual',
            version: 1,
            generatedAt: null,
        },
        dataQuality: {
            staleConnections: [],
            missingAccounts: [],
            warnings: [],
        },
        sourceData: applyBlankSourceDefaults({}, monthId),
        generatedAnalysis: {},
        meetingData: {},
    };
}
