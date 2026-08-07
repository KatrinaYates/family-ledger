import { enrichSnapshot } from './enrichSnapshot.js';
import { enrichStory } from './enrichStory.js';
import { enrichSpending } from './enrichSpending.js';
import { enrichCfo } from './enrichCfo.js';
import { enrichFuture } from './enrichFuture.js';
import { enrichMeeting } from './enrichMeeting.js';
import { enrichActions } from './enrichActions.js';
import { enrichCelebrate } from './enrichCelebrate.js';
import { enrichHandoff } from './enrichHandoff.js';
import { normalizeSourceFields } from './normalizeLedgerMonth.js';
import { applyBlankSourceDefaults } from './blankSourceDefaults.js';

/** @param {object | undefined} meta */
function monthLabel(meta) {
    return meta?.month?.trim() || 'the month';
}

/**
 * Pure enrichment — presentation output only. Never mutates meeting entries or actions.
 * @param {object} sourceData
 */
export function buildGeneratedAnalysis(sourceData) {
    const meta = sourceData.meta ?? {};
    const label = monthLabel(meta);

    return {
        snapshot: enrichSnapshot(sourceData.snapshot, meta),
        story: enrichStory(sourceData.story, meta),
        spending: enrichSpending(sourceData.spending, meta),
        cfo: enrichCfo(sourceData.cfo, meta),
        future: enrichFuture(sourceData.future, meta),
        meeting: enrichMeeting(sourceData.meeting, meta),
        actions: enrichActions(sourceData.actions),
        celebrate: enrichCelebrate(sourceData.celebrate, meta),
        handoff: enrichHandoff(sourceData.handoff, meta),
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
