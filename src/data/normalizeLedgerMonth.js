import { normalizeDataQuality } from './normalizeDataQuality.js';

const SECTION_KEYS = [
    'meta',
    'snapshot',
    'story',
    'spending',
    'cfo',
    'future',
    'meeting',
    'actions',
    'celebrate',
    'handoff',
];

/** @param {object} raw */
function extractSourceData(raw) {
    /** @type {Record<string, unknown>} */
    const sourceData = {};
    for (const key of SECTION_KEYS) {
        if (raw[key] != null) {
            sourceData[key] = raw[key];
        }
    }
    return sourceData;
}

/**
 * @param {object} raw
 * @param {string} monthId
 * @returns {import('../repository/types.js').LedgerMonth}
 */
export function normalizeToContract(raw, monthId) {
    if (raw?.schemaVersion === 1 && raw.sourceData) {
        return {
            schemaVersion: 1,
            monthId: raw.monthId ?? monthId,
            workflow: {
                status: 'draft',
                sourceAsOf: null,
                reviewedAt: null,
                lockedAt: null,
                ...raw.workflow,
            },
            generation: {
                source: 'sample',
                version: 1,
                generatedAt: null,
                ...raw.generation,
            },
            dataQuality: normalizeDataQuality(raw.dataQuality),
            sourceData: raw.sourceData,
            generatedAnalysis: raw.generatedAnalysis ?? {},
            meetingData: raw.meetingData ?? {},
        };
    }

    return {
        schemaVersion: 1,
        monthId,
        workflow: {
            status: 'draft',
            sourceAsOf: null,
            reviewedAt: null,
            lockedAt: null,
            ...(raw.workflow ?? {}),
        },
        generation: {
            source: 'sample',
            version: 1,
            generatedAt: null,
            ...(raw.generation ?? {}),
        },
        dataQuality: normalizeDataQuality(raw.dataQuality),
        sourceData: extractSourceData(raw),
        generatedAnalysis: {},
        meetingData: raw.meetingData ?? {},
    };
}

/** @param {import('../repository/types.js').LedgerMonth} record */
export function mergeMonthView(record) {
    const { sourceData, generatedAnalysis } = record;
    return {
        ...generatedAnalysis,
        meta: sourceData.meta,
    };
}

/** Rename legacy field names inside source data. */
export function normalizeSourceFields(sourceData) {
    const renameContributions = (section) => {
        if (!section || typeof section !== 'object') return section;
        if ('julyContributions' in section && !('monthContributions' in section)) {
            section.monthContributions = section.julyContributions;
        }
        return section;
    };

    if (sourceData.snapshot?.retirement) {
        renameContributions(sourceData.snapshot.retirement);
    }
    if (sourceData.story?.investments) {
        renameContributions(sourceData.story.investments);
    }
    if (sourceData.future?.retirement) {
        renameContributions(sourceData.future.retirement);
    }

    return sourceData;
}
