import { enrichMonth } from './enrichMonth.js';
import { enrichSpending } from './enrichSpending.js';
import { enrichCfo } from './enrichCfo.js';
import { enrichFuture } from './enrichFuture.js';
import { enrichDecisions } from './enrichDecisions.js';
import { enrichActions } from './enrichActions.js';
import { enrichCelebrate } from './enrichCelebrate.js';
import { enrichClose } from './enrichClose.js';
import { normalizeSourceFields } from './normalizeLedgerMonth.js';
import { applyBlankSourceDefaults } from './blankSourceDefaults.js';

/**
 * Pure enrichment — presentation output only. Never mutates meeting entries or actions.
 * @param {object} sourceData
 */
export function buildGeneratedAnalysis(sourceData) {
    const meta = sourceData.meta ?? {};
    const cfo = enrichCfo(sourceData.cfo, meta);

    return {
        month: enrichMonth(sourceData, meta),
        spending: enrichSpending(sourceData.spending, meta),
        cfo,
        future: enrichFuture(sourceData.future, meta),
        decisions: enrichDecisions(sourceData, cfo, meta),
        actions: enrichActions(sourceData.actions),
        celebrate: enrichCelebrate(sourceData.celebrate, meta),
        close: enrichClose(sourceData, meta),
    };
}

/**
 * Normalize source data and attach generated analysis.
 * @param {import('../repository/types.js').LedgerMonth} record
 * @param {{ touchGeneration?: boolean }} [options]
 * @returns {import('../repository/types.js').LedgerMonth}
 */
export function enrichLedgerMonth(record, { touchGeneration = false } = {}) {
    const sourceData = normalizeSourceFields(
        applyBlankSourceDefaults(structuredClone(record.sourceData), record.monthId),
    );
    const generatedAnalysis = buildGeneratedAnalysis(sourceData);

    /** @type {import('../repository/types.js').LedgerMonth} */
    const next = {
        ...record,
        sourceData,
        generatedAnalysis,
    };

    if (touchGeneration) {
        next.generation = {
            ...record.generation,
            version: (record.generation?.version ?? 0) + 1,
            generatedAt: new Date().toISOString(),
        };
    }

    return next;
}
