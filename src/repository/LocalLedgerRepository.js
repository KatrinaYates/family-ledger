import { months } from '../data/months.js';
import {
    loadLedgerMonth,
    listAvailableMonthIds,
    isUsingLocalData,
} from '../data/loadLedgerMonth.js';
import { mergeMonthView } from '../data/normalizeLedgerMonth.js';
import { enrichLedgerMonth } from '../data/enrichLedgerMonth.js';
import { createBlankLedgerMonth } from './createBlankLedgerMonth.js';
import { LedgerRepository } from './LedgerRepository.js';

const ACTIONS_KEY = 'fl-actions';
const WORKFLOW_KEY_PREFIX = 'fl-ledger-workflow-';
const CREATED_RECORD_PREFIX = 'fl-ledger-record-';

function readJson(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        if (stored != null) return JSON.parse(stored);
    } catch {
        /* ignore */
    }
    return fallback;
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function readWorkflowOverride(monthId) {
    return readJson(`${WORKFLOW_KEY_PREFIX}${monthId}`, null);
}

function writeWorkflowOverride(monthId, workflow) {
    writeJson(`${WORKFLOW_KEY_PREFIX}${monthId}`, workflow);
}

export class LocalLedgerRepository extends LedgerRepository {
    constructor() {
        super();
        /** @type {Map<string, import('./types.js').LedgerMonth>} */
        this.records = new Map();
        this.bootstrap();
    }

    bootstrap() {
        for (const monthId of listAvailableMonthIds()) {
            this.loadRecordFromFile(monthId);
        }

        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (!key?.startsWith(CREATED_RECORD_PREFIX)) continue;
            const monthId = key.slice(CREATED_RECORD_PREFIX.length);
            if (this.records.has(monthId)) continue;
            const stored = readJson(key, null);
            if (stored) {
                this.records.set(monthId, this.applyWorkflowOverride(stored));
            }
        }
    }

    /** @param {import('./types.js').LedgerMonth} record */
    applyWorkflowOverride(record) {
        const override = readWorkflowOverride(record.monthId);
        if (!override) return record;
        return {
            ...record,
            workflow: { ...record.workflow, ...override },
        };
    }

    /** @param {string} monthId */
    loadRecordFromFile(monthId) {
        const { record: fromFile } = loadLedgerMonth(monthId);
        const overlay = readJson(`${CREATED_RECORD_PREFIX}${monthId}`, null);
        let record = fromFile;
        if (overlay) {
            record = {
                ...fromFile,
                ...overlay,
                workflow: { ...fromFile.workflow, ...(overlay.workflow ?? {}) },
                generation: { ...fromFile.generation, ...(overlay.generation ?? {}) },
                dataQuality: overlay.dataQuality ?? fromFile.dataQuality,
                sourceData: overlay.sourceData ?? fromFile.sourceData,
                generatedAnalysis:
                    overlay.generatedAnalysis && Object.keys(overlay.generatedAnalysis).length > 0
                        ? overlay.generatedAnalysis
                        : fromFile.generatedAnalysis,
                meetingData: overlay.meetingData ?? fromFile.meetingData,
            };
        }
        this.records.set(monthId, this.applyWorkflowOverride(record));
        return this.records.get(monthId);
    }

    /** @param {string} monthId */
    getRecord(monthId) {
        if (this.records.has(monthId)) {
            return this.records.get(monthId);
        }
        if (listAvailableMonthIds().includes(monthId)) {
            return this.loadRecordFromFile(monthId);
        }
        const stored = readJson(`${CREATED_RECORD_PREFIX}${monthId}`, null);
        if (stored) {
            const record = this.applyWorkflowOverride(stored);
            this.records.set(monthId, record);
            return record;
        }
        return null;
    }

    /** @param {import('./types.js').LedgerMonth} record */
    persistRecord(record) {
        this.records.set(record.monthId, record);
        writeJson(`${CREATED_RECORD_PREFIX}${record.monthId}`, {
            schemaVersion: record.schemaVersion,
            monthId: record.monthId,
            workflow: record.workflow,
            generation: record.generation,
            dataQuality: record.dataQuality,
            sourceData: record.sourceData,
            generatedAnalysis: record.generatedAnalysis,
            meetingData: record.meetingData,
        });
    }

    listMonths() {
        return [...this.records.values()].map((record) => ({
            monthId: record.monthId,
            workflow: record.workflow,
            generation: record.generation,
        }));
    }

    getMonth(monthId) {
        const record = this.getRecord(monthId);
        if (!record) {
            throw new Error(`No ledger data found for month "${monthId}".`);
        }
        return mergeMonthView(record);
    }

    createMonth(month) {
        const monthId = month.monthId;
        if (this.getRecord(monthId)) {
            throw new Error(`Month "${monthId}" already exists.`);
        }
        const record = month.schemaVersion ? month : createBlankLedgerMonth(monthId);
        this.persistRecord(record);
        return record;
    }

    getMonthSource(monthId) {
        const record = this.getRecord(monthId);
        if (!record) {
            throw new Error(`No ledger data found for month "${monthId}".`);
        }
        return structuredClone(record.sourceData);
    }

    updateMonthSource(monthId, sourceData) {
        const record = this.getRecord(monthId);
        if (!record) {
            throw new Error(`No ledger data found for month "${monthId}".`);
        }
        const updated = {
            ...record,
            sourceData,
            workflow: {
                ...record.workflow,
                sourceAsOf: new Date().toISOString(),
            },
        };
        this.persistRecord(updated);
        return this.regenerateAnalysis(monthId);
    }

    regenerateAnalysis(monthId) {
        const record = this.getRecord(monthId);
        if (!record) {
            throw new Error(`No ledger data found for month "${monthId}".`);
        }

        const enriched = enrichLedgerMonth(record, { touchGeneration: true });
        const updated = {
            ...record,
            sourceData: enriched.sourceData,
            generatedAnalysis: enriched.generatedAnalysis,
            generation: enriched.generation,
        };

        this.persistRecord(updated);
        return mergeMonthView(updated);
    }

    getLedgerRecord(monthId) {
        const record = this.getRecord(monthId);
        if (!record) return null;
        return {
            monthId: record.monthId,
            schemaVersion: record.schemaVersion,
            workflow: structuredClone(record.workflow),
            generation: structuredClone(record.generation),
            dataQuality: structuredClone(record.dataQuality),
        };
    }

    saveMeetingEntry(monthId, key, value) {
        if (typeof value === 'string') {
            localStorage.setItem(key, value);
        } else {
            writeJson(key, value);
        }
    }

    getMeetingEntry(monthId, key) {
        void monthId;
        const raw = localStorage.getItem(key);
        if (raw == null) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    }

    listActions(filters = {}) {
        const actions = readJson(ACTIONS_KEY, []);
        return actions.filter((action) => {
            if (filters.status && action.status !== filters.status) return false;
            if (filters.originMonthId && action.originMonthId !== filters.originMonthId) return false;
            if (filters.carriedToMonthId && action.carriedToMonthId !== filters.carriedToMonthId) return false;
            if (filters.forMonthId) {
                const monthId = filters.forMonthId;
                const isOpen = action.status !== 'done';
                const onOrigin = action.originMonthId === monthId;
                const carriedHere = action.carriedToMonthId === monthId;
                if (!isOpen || (!onOrigin && !carriedHere)) return false;
            }
            return true;
        });
    }

    listActionsForMonth(monthId) {
        return this.listActions({ forMonthId: monthId });
    }

    listCarryForwardCandidates(monthId) {
        return readJson(ACTIONS_KEY, []).filter(
            (action) =>
                action.originMonthId === monthId &&
                action.status !== 'done' &&
                !action.carriedToMonthId,
        );
    }

    saveAction(action) {
        const actions = readJson(ACTIONS_KEY, []);
        actions.push(action);
        writeJson(ACTIONS_KEY, actions);
        return action;
    }

    updateAction(id, patch) {
        const actions = readJson(ACTIONS_KEY, []);
        const index = actions.findIndex((action) => action.id === id);
        if (index < 0) {
            throw new Error(`Action "${id}" not found.`);
        }
        const merged = {
            ...actions[index],
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        if (merged.status === 'done' && !merged.completedAt) {
            merged.completedAt = new Date().toISOString();
        }
        if (merged.status !== 'done') {
            merged.completedAt = null;
        }
        actions[index] = merged;
        writeJson(ACTIONS_KEY, actions);
        return actions[index];
    }

    carryForwardAction(id, targetMonthId) {
        return this.updateAction(id, { carriedToMonthId: targetMonthId });
    }

    deleteAction(id) {
        const actions = readJson(ACTIONS_KEY, []).filter((action) => action.id !== id);
        writeJson(ACTIONS_KEY, actions);
    }

    updateWorkflow(monthId, patch) {
        const record = this.getRecord(monthId);
        if (!record) {
            throw new Error(`No ledger data found for month "${monthId}".`);
        }
        const workflow = { ...record.workflow, ...patch };
        writeWorkflowOverride(monthId, workflow);
        const updated = { ...record, workflow };
        this.records.set(monthId, updated);
        if (localStorage.getItem(`${CREATED_RECORD_PREFIX}${monthId}`)) {
            const record = this.getRecord(monthId);
            if (record) this.persistRecord({ ...record, workflow });
        }
        return workflow;
    }

    lockMonth(monthId) {
        return this.updateWorkflow(monthId, {
            status: 'locked',
            lockedAt: new Date().toISOString(),
        });
    }

    /** @param {string} monthId */
    isUsingLocalData(monthId) {
        return isUsingLocalData(monthId);
    }

    /** Catalog months that have ledger records. */
    listAvailableMonthIds() {
        return listAvailableMonthIds();
    }

    /** @param {string} monthId */
    hasLedgerData(monthId) {
        return Boolean(this.getRecord(monthId)) || listAvailableMonthIds().includes(monthId);
    }

    getWorkflow(monthId) {
        const record = this.getRecord(monthId);
        return record?.workflow ?? null;
    }
}

/** @param {string} monthId */
export function listNavigableMonthIds(repo) {
    const fromFiles = repo.listAvailableMonthIds();
    const fromRecords = repo.listMonths().map((entry) => entry.monthId);
    return [...new Set([...fromFiles, ...fromRecords])].sort();
}

export { months };
