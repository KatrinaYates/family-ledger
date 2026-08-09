import {
    loadLedgerMonth,
    listAvailableMonthIds,
    isUsingLocalData,
} from '../data/loadLedgerMonth.js';
import { mergeMonthView, resolveMonthView } from '../data/normalizeLedgerMonth.js';
import { enrichLedgerMonth } from '../data/enrichLedgerMonth.js';
import { createBlankLedgerMonth } from './createBlankLedgerMonth.js';
import { LedgerRepository } from './LedgerRepository.js';
import {
    ConflictError,
    LedgerNotFoundError,
    LockedMonthError,
    StorageError,
    ValidationError,
} from './errors.js';
import { dispatchLedgerMonthsUpdated, dispatchLedgerMonthUpdated } from '../utils/meetingEvents.js';

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
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        throw new StorageError('Could not save. Try again.', { key, cause: error });
    }
}

function readWorkflowOverride(monthId) {
    return readJson(`${WORKFLOW_KEY_PREFIX}${monthId}`, null);
}

function writeWorkflowOverride(monthId, workflow) {
    writeJson(`${WORKFLOW_KEY_PREFIX}${monthId}`, workflow);
}

/** @param {import('./types.js').Action} action @param {string} monthId */
function actionBelongsToMonth(action, monthId) {
    return action.originMonthId === monthId || action.carriedToMonthId === monthId;
}

/** @param {import('./types.js').LedgerMonth} record @param {import('./types.js').WriteOptions} [options] */
function assertExpectedVersion(record, options) {
    if (options?.expectedVersion == null) return;
    const currentVersion = record.version ?? 1;
    if (currentVersion !== options.expectedVersion) {
        throw new ConflictError(record.monthId, options.expectedVersion, currentVersion);
    }
}

/** @param {import('./types.js').LedgerMonth} record */
function bumpRecordVersion(record) {
    return {
        ...record,
        version: (record.version ?? 1) + 1,
        updatedAt: new Date().toISOString(),
    };
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
            const merged = {
                ...fromFile,
                ...overlay,
                version: overlay.version ?? fromFile.version ?? 1,
                updatedAt: overlay.updatedAt ?? fromFile.updatedAt ?? null,
                workflow: { ...fromFile.workflow, ...(overlay.workflow ?? {}) },
                generation: { ...fromFile.generation, ...(overlay.generation ?? {}) },
                dataQuality: overlay.dataQuality ?? fromFile.dataQuality,
                sourceData: overlay.sourceData ?? fromFile.sourceData,
                meetingData: overlay.meetingData ?? fromFile.meetingData,
            };
            record = enrichLedgerMonth(merged);
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

    /** @param {string} monthId */
    requireRecord(monthId) {
        const record = this.getRecord(monthId);
        if (!record) {
            throw new LedgerNotFoundError(monthId);
        }
        return record;
    }

    /** @param {string} monthId */
    assertMeetingWritable(monthId) {
        const record = this.requireRecord(monthId);
        if (record.workflow.status === 'locked') {
            throw new LockedMonthError(monthId);
        }
    }

    /** @param {import('./types.js').LedgerMonth} record @param {import('./types.js').WriteOptions} [options] */
    persistRecord(record, options) {
        assertExpectedVersion(record, options);
        const next = bumpRecordVersion(record);
        this.records.set(next.monthId, next);
        writeJson(`${CREATED_RECORD_PREFIX}${next.monthId}`, {
            schemaVersion: next.schemaVersion,
            monthId: next.monthId,
            version: next.version,
            updatedAt: next.updatedAt,
            workflow: next.workflow,
            generation: next.generation,
            dataQuality: next.dataQuality,
            sourceData: next.sourceData,
            generatedAnalysis: next.generatedAnalysis,
            meetingData: next.meetingData,
        });
        return next;
    }

    async listMonths() {
        return [...this.records.values()].map((record) => ({
            monthId: record.monthId,
            workflow: record.workflow,
            generation: record.generation,
            version: record.version ?? 1,
        }));
    }

    async listNavigableMonthIds() {
        const fromFiles = listAvailableMonthIds();
        const fromRecords = (await this.listMonths()).map((entry) => entry.monthId);
        return [...new Set([...fromFiles, ...fromRecords])].sort();
    }

    async hasLedgerData(monthId) {
        return Boolean(this.getRecord(monthId)) || listAvailableMonthIds().includes(monthId);
    }

    async getWorkflow(monthId) {
        const record = this.getRecord(monthId);
        return record?.workflow ?? null;
    }

    async getMonth(monthId) {
        const record = this.requireRecord(monthId);
        return resolveMonthView(record);
    }

    async createMonth(month) {
        const monthId = month.monthId;
        if (!monthId) {
            throw new ValidationError('monthId is required to create a month.');
        }
        if (this.getRecord(monthId)) {
            throw new ValidationError(`Month "${monthId}" already exists.`, { monthId });
        }
        const base = month.schemaVersion ? month : createBlankLedgerMonth(monthId);
        const record = enrichLedgerMonth(base, { touchGeneration: true });
        const persisted = this.persistRecord(record);
        dispatchLedgerMonthsUpdated();
        dispatchLedgerMonthUpdated(monthId);
        return persisted;
    }

    async getMonthSource(monthId) {
        const record = this.requireRecord(monthId);
        return structuredClone(record.sourceData);
    }

    async updateMonthSource(monthId, sourceData, options) {
        const record = this.requireRecord(monthId);
        assertExpectedVersion(record, options);
        const withSource = {
            ...record,
            sourceData,
            workflow: {
                ...record.workflow,
                sourceAsOf: new Date().toISOString(),
            },
        };
        const enriched = enrichLedgerMonth(withSource, { touchGeneration: true });
        const updated = {
            ...withSource,
            sourceData: enriched.sourceData,
            generatedAnalysis: enriched.generatedAnalysis,
            generation: enriched.generation,
        };
        const persisted = this.persistRecord(updated, options);
        dispatchLedgerMonthUpdated(monthId);
        return mergeMonthView(persisted);
    }

    async regenerateAnalysis(monthId, options) {
        const record = this.requireRecord(monthId);
        assertExpectedVersion(record, options);

        const enriched = enrichLedgerMonth(record, { touchGeneration: true });
        const updated = {
            ...record,
            sourceData: enriched.sourceData,
            generatedAnalysis: enriched.generatedAnalysis,
            generation: enriched.generation,
        };

        const persisted = this.persistRecord(updated, options);
        dispatchLedgerMonthUpdated(monthId);
        return mergeMonthView(persisted);
    }

    async getLedgerRecord(monthId) {
        const record = this.getRecord(monthId);
        if (!record) return null;
        return {
            monthId: record.monthId,
            schemaVersion: record.schemaVersion,
            version: record.version ?? 1,
            updatedAt: record.updatedAt ?? null,
            workflow: structuredClone(record.workflow),
            generation: structuredClone(record.generation),
            dataQuality: structuredClone(record.dataQuality),
        };
    }

    async saveMeetingEntry(monthId, key, value) {
        if (!key.startsWith('fl-ledger-')) {
            this.assertMeetingWritable(monthId);
        }
        if (typeof value === 'string') {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                throw new StorageError('Could not save. Try again.', { key, cause: error });
            }
        } else {
            writeJson(key, value);
        }
    }

    async getMeetingEntry(_monthId, key) {
        const raw = localStorage.getItem(key);
        if (raw == null) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    }

    async listActions(filters = {}) {
        const actions = readJson(ACTIONS_KEY, []);
        return actions.filter((action) => {
            if (filters.status && action.status !== filters.status) return false;
            if (filters.originMonthId && action.originMonthId !== filters.originMonthId) return false;
            if (filters.carriedToMonthId && action.carriedToMonthId !== filters.carriedToMonthId) return false;
            if (filters.forMonthId) {
                if (!actionBelongsToMonth(action, filters.forMonthId)) return false;
            }
            if (filters.forMonthIdOpen) {
                if (!actionBelongsToMonth(action, filters.forMonthIdOpen)) return false;
                if (action.status === 'done') return false;
            }
            return true;
        });
    }

    async listActionsForMonth(monthId) {
        return this.listActions({ forMonthId: monthId });
    }

    async listOpenActionsForMonth(monthId) {
        return this.listActions({ forMonthIdOpen: monthId });
    }

    async listCarryForwardCandidates(monthId) {
        return readJson(ACTIONS_KEY, []).filter(
            (action) =>
                action.originMonthId === monthId &&
                action.status !== 'done' &&
                !action.carriedToMonthId,
        );
    }

    async saveAction(action) {
        const actions = readJson(ACTIONS_KEY, []);
        actions.push(action);
        writeJson(ACTIONS_KEY, actions);
        return action;
    }

    async updateAction(id, patch) {
        const actions = readJson(ACTIONS_KEY, []);
        const index = actions.findIndex((action) => action.id === id);
        if (index < 0) {
            throw new ValidationError(`Action "${id}" not found.`, { id });
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

    async carryForwardAction(id, targetMonthId) {
        return this.updateAction(id, { carriedToMonthId: targetMonthId });
    }

    async deleteAction(id) {
        const actions = readJson(ACTIONS_KEY, []).filter((action) => action.id !== id);
        writeJson(ACTIONS_KEY, actions);
    }

    async updateWorkflow(monthId, patch, options) {
        const record = this.requireRecord(monthId);
        const workflow = { ...record.workflow, ...patch };
        writeWorkflowOverride(monthId, workflow);
        const updated = { ...record, workflow };
        this.records.set(monthId, updated);
        const persisted = this.persistRecord(updated, options);
        return persisted.workflow;
    }

    async lockMonth(monthId, options) {
        return this.updateWorkflow(
            monthId,
            {
                status: 'locked',
                lockedAt: new Date().toISOString(),
            },
            options,
        );
    }

    async unlockMonth(monthId, reason, options) {
        const record = this.requireRecord(monthId);
        const nextStatus = record.workflow.reviewedAt ? 'meeting_ready' : 'draft';
        const patch = {
            status: nextStatus,
            lockedAt: null,
            unlockReason: reason?.trim() ? reason.trim() : null,
        };
        return this.updateWorkflow(monthId, patch, options);
    }

    async isUsingLocalData(monthId) {
        return isUsingLocalData(monthId);
    }
}
