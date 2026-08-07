/**
 * Ledger month data contract template.
 * Copy to src/data/months/YYYY-MM.sample.js and fill sourceData.
 */
export default {
    schemaVersion: 1,
    monthId: 'YYYY-MM',
    workflow: {
        status: 'draft',
        sourceAsOf: null,
        reviewedAt: null,
        lockedAt: null,
    },
    generation: {
        source: 'sample',
        version: 1,
        generatedAt: null,
    },
    dataQuality: {
        staleConnections: [],
        missingAccounts: [],
        warnings: [],
    },
    sourceData: {
        meta: {},
        snapshot: {},
        story: {},
        spending: {},
        cfo: { priorities: [] },
        future: {},
        meeting: {},
        actions: { items: [] },
        celebrate: {},
        handoff: {},
    },
    generatedAnalysis: {},
    meetingData: {},
};
