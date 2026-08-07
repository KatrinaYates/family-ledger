import { normalizeToContract } from './normalizeLedgerMonth.js';
import { enrichLedgerMonth } from './enrichLedgerMonth.js';

const sampleModules = import.meta.glob('./months/*.sample.js', { eager: true });
const localModules = import.meta.glob('./months/*.local.js', { eager: true });

const forceSample = import.meta.env.VITE_USE_SAMPLE_DATA === 'true';

/** @type {Map<string, 'local' | 'sample'>} */
const dataSourceByMonth = new Map();

/**
 * @param {string} monthId
 * @returns {{ raw: object, source: 'local' | 'sample' }}
 */
function resolveMonthRaw(monthId) {
    const samplePath = `./months/${monthId}.sample.js`;
    const localPath = `./months/${monthId}.local.js`;

    const local = localModules[localPath]?.default;
    const sample = sampleModules[samplePath]?.default;

    if (local && !forceSample) {
        dataSourceByMonth.set(monthId, 'local');
        return { raw: local, source: 'local' };
    }
    if (sample) {
        dataSourceByMonth.set(monthId, 'sample');
        return { raw: sample, source: 'sample' };
    }

    throw new Error(
        `No ledger data found for month "${monthId}". Expected ${samplePath} or ${localPath}.`,
    );
}

/** @param {string} monthId */
export function loadLedgerMonth(monthId) {
    const { raw, source } = resolveMonthRaw(monthId);
    const normalized = normalizeToContract(raw, monthId);
    if (source === 'local' && normalized.generation.source === 'sample') {
        normalized.generation = { ...normalized.generation, source: 'manual' };
    }
    const record = enrichLedgerMonth(normalized);
    return { record, dataSource: source };
}

/** @returns {string[]} */
export function listAvailableMonthIds() {
    return Object.keys(sampleModules)
        .map((path) => path.match(/\/(\d{4}-\d{2})\.sample\.js$/)?.[1])
        .filter(Boolean)
        .sort();
}

/** @param {string} monthId */
export function isUsingLocalData(monthId) {
    if (dataSourceByMonth.has(monthId)) {
        return dataSourceByMonth.get(monthId) === 'local';
    }
    try {
        resolveMonthRaw(monthId);
        return dataSourceByMonth.get(monthId) === 'local';
    } catch {
        return false;
    }
}

/** @param {string} monthId */
export function hasLedgerDataFile(monthId) {
    try {
        resolveMonthRaw(monthId);
        return true;
    } catch {
        return false;
    }
}
