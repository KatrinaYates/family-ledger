import { LedgerRepository } from './LedgerRepository.js';
import { createBlankLedgerMonth } from './createBlankLedgerMonth.js';
import { mergeMonthView, resolveMonthView } from '../data/normalizeLedgerMonth.js';
import { enrichLedgerMonth } from '../data/enrichLedgerMonth.js';
import {
    ConflictError,
    LedgerNotFoundError,
    LockedMonthError,
    StorageError,
    ValidationError,
} from './errors.js';
import { dispatchLedgerMonthsUpdated, dispatchLedgerMonthUpdated } from '../utils/meetingEvents.js';
import { FINANCIAL_CHECK_IN_KEY } from '../constants/financialCheckIn.js';

function toRecord(row) {
    return {
        schemaVersion: row.schema_version,
        monthId: row.month_id,
        version: row.version,
        updatedAt: row.updated_at,
        workflow: row.workflow,
        generation: row.generation,
        dataQuality: row.data_quality,
        sourceData: row.source_data,
        generatedAnalysis: row.generated_analysis,
        meetingData: row.meeting_data,
    };
}

function toMonthRow(record, householdId) {
    return {
        household_id: householdId,
        month_id: record.monthId,
        schema_version: record.schemaVersion ?? 1,
        version: record.version ?? 1,
        workflow: record.workflow ?? {},
        generation: record.generation ?? {},
        data_quality: record.dataQuality ?? { staleConnections: [], missingAccounts: [], warnings: [] },
        source_data: record.sourceData ?? {},
        generated_analysis: record.generatedAnalysis ?? {},
        meeting_data: record.meetingData ?? {},
        updated_at: record.updatedAt ?? new Date().toISOString(),
    };
}

function toAction(row) {
    return {
        id: row.id,
        householdId: row.household_id,
        originMonthId: row.origin_month_id,
        carriedToMonthId: row.carried_to_month_id,
        title: row.title,
        owner: row.owner,
        dueDate: row.due_date,
        status: row.status,
        priority: row.priority,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at,
    };
}

function toActionRow(action, householdId) {
    return {
        id: action.id,
        household_id: householdId,
        origin_month_id: action.originMonthId,
        carried_to_month_id: action.carriedToMonthId ?? null,
        title: action.title ?? '',
        owner: action.owner ?? '',
        due_date: action.dueDate || null,
        status: action.status ?? 'not_started',
        priority: action.priority ?? 'normal',
        notes: action.notes ?? '',
        completed_at: action.completedAt ?? null,
        created_at: action.createdAt ?? new Date().toISOString(),
        updated_at: action.updatedAt ?? new Date().toISOString(),
    };
}

function storageError(error, message = 'Could not access Family Ledger data.') {
    return new StorageError(message, { cause: error, code: error?.code });
}

export class SupabaseLedgerRepository extends LedgerRepository {
    constructor(client) {
        super();
        if (!client) throw new ValidationError('Supabase client is required.');
        this.client = client;
        this.householdId = null;
    }

    async requireUser() {
        const { data, error } = await this.client.auth.getUser();
        if (error) throw storageError(error, 'Could not verify your sign-in.');
        if (!data.user) throw new ValidationError('Sign in to use the Supabase ledger.');
        return data.user;
    }

    async listHouseholds() {
        await this.requireUser();
        const { data: memberships, error: membershipError } = await this.client
            .from('household_members')
            .select('household_id, role')
            .order('created_at');
        if (membershipError) throw storageError(membershipError, 'Could not load your households.');
        if (!memberships?.length) return [];

        const ids = memberships.map((row) => row.household_id);
        const { data: households, error: householdError } = await this.client
            .from('households')
            .select('id, name, created_at')
            .in('id', ids);
        if (householdError) throw storageError(householdError, 'Could not load your households.');

        const byId = new Map((households ?? []).map((row) => [row.id, row]));
        const seen = new Set();
        return memberships
            .map((membership) => {
                const household = byId.get(membership.household_id);
                if (!household) return null;
                return {
                    id: household.id,
                    name: household.name,
                    role: membership.role,
                    createdAt: household.created_at,
                };
            })
            .filter(Boolean)
            .filter((entry) => {
                if (seen.has(entry.id)) return false;
                seen.add(entry.id);
                return true;
            });
    }

    async setActiveHousehold(householdId) {
        if (!householdId) {
            this.householdId = null;
            return null;
        }
        const households = await this.listHouseholds();
        const household = households.find((entry) => entry.id === householdId);
        if (!household) throw new ValidationError('You do not have access to that household.');
        this.householdId = household.id;
        return household;
    }

    async getActiveHousehold() {
        if (!this.householdId) return null;
        const households = await this.listHouseholds();
        return households.find((entry) => entry.id === this.householdId) ?? null;
    }

    async createHousehold(name) {
        const householdName = name?.trim();
        if (!householdName) throw new ValidationError('Household name is required.');
        await this.requireUser();
        const { data, error } = await this.client.rpc('create_household', {
            household_name: householdName,
        });
        if (error) throw storageError(error, 'Could not create your household.');
        this.householdId = data;
        dispatchLedgerMonthsUpdated();
        return this.getActiveHousehold();
    }

    async createHouseholdInvitation(email) {
        const householdId = await this.requireHouseholdId();
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail) throw new ValidationError('Email is required.');
        const { data, error } = await this.client.rpc('create_household_invitation', {
            target_household_id: householdId,
            invite_email: normalizedEmail,
        });
        if (error) throw storageError(error, 'Could not create the household invitation.');
        const row = Array.isArray(data) ? data[0] : data;
        return {
            id: row.invitation_id,
            token: row.invitation_token,
            expiresAt: row.expires_at,
            email: normalizedEmail,
        };
    }

    async acceptHouseholdInvitation(token) {
        const invitationToken = token?.trim();
        if (!invitationToken) throw new ValidationError('Invitation token is required.');
        const { data, error } = await this.client.rpc('accept_household_invitation', {
            invitation_token: invitationToken,
        });
        if (error) throw storageError(error, error.message || 'Could not accept the household invitation.');
        this.householdId = data;
        dispatchLedgerMonthsUpdated();
        return this.getActiveHousehold();
    }

    async listHouseholdInvitations() {
        const householdId = await this.requireHouseholdId();
        const { data, error } = await this.client
            .from('household_invitations')
            .select('id, email, expires_at, accepted_at, created_at')
            .eq('household_id', householdId)
            .order('created_at', { ascending: false });
        if (error) throw storageError(error, 'Could not load household invitations.');
        return (data ?? []).map((row) => ({
            id: row.id,
            email: row.email,
            expiresAt: row.expires_at,
            acceptedAt: row.accepted_at,
            createdAt: row.created_at,
        }));
    }

    async getHouseholdId() {
        if (this.householdId) return this.householdId;
        const households = await this.listHouseholds();
        if (households.length === 1) {
            this.householdId = households[0].id;
            return this.householdId;
        }
        if (households.length === 0) return null;
        throw new ValidationError('Choose a household before opening the ledger.');
    }

    async requireHouseholdId() {
        const householdId = await this.getHouseholdId();
        if (!householdId) throw new ValidationError('Create or join a household before using the ledger.');
        return householdId;
    }

    async getRecord(monthId) {
        const householdId = await this.getHouseholdId();
        if (!householdId) return null;
        const { data, error } = await this.client
            .from('ledger_months')
            .select('*')
            .eq('household_id', householdId)
            .eq('month_id', monthId)
            .maybeSingle();
        if (error) throw storageError(error);
        return data ? toRecord(data) : null;
    }

    async requireRecord(monthId) {
        const record = await this.getRecord(monthId);
        if (!record) throw new LedgerNotFoundError(monthId);
        return record;
    }

    async listMonths() {
        const householdId = await this.getHouseholdId();
        if (!householdId) return [];
        const { data, error } = await this.client
            .from('ledger_months')
            .select('month_id, workflow, generation, version')
            .eq('household_id', householdId)
            .order('month_id');
        if (error) throw storageError(error);
        return (data ?? []).map((row) => ({
            monthId: row.month_id,
            workflow: row.workflow,
            generation: row.generation,
            version: row.version,
        }));
    }

    async listNavigableMonthIds() {
        return (await this.listMonths()).map((entry) => entry.monthId);
    }

    async hasLedgerData(monthId) {
        return Boolean(await this.getRecord(monthId));
    }

    async getWorkflow(monthId) {
        return (await this.getRecord(monthId))?.workflow ?? null;
    }

    async getMonth(monthId) {
        return resolveMonthView(await this.requireRecord(monthId));
    }

    async getLedgerRecord(monthId) {
        const record = await this.getRecord(monthId);
        if (!record) return null;
        return {
            monthId: record.monthId,
            schemaVersion: record.schemaVersion,
            version: record.version,
            updatedAt: record.updatedAt,
            workflow: structuredClone(record.workflow),
            generation: structuredClone(record.generation),
            dataQuality: structuredClone(record.dataQuality),
        };
    }

    async createMonth(month) {
        if (!month?.monthId) throw new ValidationError('monthId is required to create a month.');
        if (await this.hasLedgerData(month.monthId)) {
            throw new ValidationError(`Month "${month.monthId}" already exists.`, { monthId: month.monthId });
        }
        const householdId = await this.requireHouseholdId();
        const base = month.schemaVersion ? month : createBlankLedgerMonth(month.monthId);
        const record = enrichLedgerMonth(base, { touchGeneration: true });
        const { data, error } = await this.client
            .from('ledger_months')
            .insert(toMonthRow(record, householdId))
            .select('*')
            .single();
        if (error) throw storageError(error, 'Could not create the month.');
        dispatchLedgerMonthsUpdated();
        dispatchLedgerMonthUpdated(record.monthId);
        return toRecord(data);
    }

    async getMonthSource(monthId) {
        return structuredClone((await this.requireRecord(monthId)).sourceData);
    }

    async persistRecord(record, options) {
        const householdId = await this.requireHouseholdId();
        const expectedVersion = options?.expectedVersion ?? record.version;
        const next = {
            ...record,
            version: expectedVersion + 1,
            updatedAt: new Date().toISOString(),
        };
        const { data, error } = await this.client
            .from('ledger_months')
            .update(toMonthRow(next, householdId))
            .eq('household_id', householdId)
            .eq('month_id', record.monthId)
            .eq('version', expectedVersion)
            .select('*');
        if (error) throw storageError(error, 'Could not save the month.');
        if (!data?.length) {
            const current = await this.requireRecord(record.monthId);
            throw new ConflictError(record.monthId, expectedVersion, current.version);
        }
        return toRecord(data[0]);
    }

    async updateMonthSource(monthId, sourceData, options) {
        const record = await this.requireRecord(monthId);
        const enriched = enrichLedgerMonth({
            ...record,
            sourceData,
            workflow: { ...record.workflow, sourceAsOf: new Date().toISOString() },
        }, { touchGeneration: true });
        const view = mergeMonthView(await this.persistRecord(enriched, options));
        dispatchLedgerMonthUpdated(monthId);
        return view;
    }

    async regenerateAnalysis(monthId, options) {
        const record = await this.requireRecord(monthId);
        const enriched = enrichLedgerMonth(record, { touchGeneration: true });
        const view = mergeMonthView(await this.persistRecord(enriched, options));
        dispatchLedgerMonthUpdated(monthId);
        return view;
    }

    async assertMeetingWritable(monthId) {
        if (!monthId) return;
        const record = await this.requireRecord(monthId);
        if (record.workflow.status === 'locked') throw new LockedMonthError(monthId);
    }

    async saveMeetingEntry(monthId, key, value) {
        if (monthId && !key.startsWith('fl-ledger-')) await this.assertMeetingWritable(monthId);
        const householdId = await this.requireHouseholdId();
        const table = monthId ? 'meeting_entries' : 'ledger_entries';
        const row = monthId
            ? { household_id: householdId, month_id: monthId, entry_key: key, value, updated_at: new Date().toISOString() }
            : { household_id: householdId, entry_key: key, value, updated_at: new Date().toISOString() };
        const onConflict = monthId ? 'household_id,month_id,entry_key' : 'household_id,entry_key';
        const { error } = await this.client.from(table).upsert(row, { onConflict });
        if (error) throw storageError(error, 'Could not save your meeting entry.');
    }

    async getMeetingEntry(monthId, key) {
        const householdId = await this.getHouseholdId();
        if (!householdId) return null;
        const table = monthId ? 'meeting_entries' : 'ledger_entries';
        let query = this.client
            .from(table)
            .select('value')
            .eq('household_id', householdId)
            .eq('entry_key', key);
        if (monthId) query = query.eq('month_id', monthId);
        const { data, error } = await query.maybeSingle();
        if (error) throw storageError(error);
        return data?.value ?? null;
    }

    async listActions(filters = {}) {
        const householdId = await this.getHouseholdId();
        if (!householdId) return [];
        let query = this.client.from('actions').select('*').eq('household_id', householdId);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.originMonthId) query = query.eq('origin_month_id', filters.originMonthId);
        if (filters.carriedToMonthId) query = query.eq('carried_to_month_id', filters.carriedToMonthId);
        const { data, error } = await query.order('created_at');
        if (error) throw storageError(error);
        let actions = (data ?? []).map(toAction);
        const monthId = filters.forMonthId ?? filters.forMonthIdOpen;
        if (monthId) actions = actions.filter((a) => a.originMonthId === monthId || a.carriedToMonthId === monthId);
        if (filters.forMonthIdOpen) actions = actions.filter((a) => a.status !== 'done');
        return actions;
    }

    async listActionsForMonth(monthId) { return this.listActions({ forMonthId: monthId }); }
    async listOpenActionsForMonth(monthId) { return this.listActions({ forMonthIdOpen: monthId }); }

    async listCarryForwardCandidates(monthId) {
        return (await this.listActions({ originMonthId: monthId }))
            .filter((action) => action.status !== 'done' && !action.carriedToMonthId);
    }

    async saveAction(action) {
        const householdId = await this.requireHouseholdId();
        const { data, error } = await this.client
            .from('actions')
            .insert(toActionRow(action, householdId))
            .select('*')
            .single();
        if (error) throw storageError(error, 'Could not save the action.');
        return toAction(data);
    }

    async updateAction(id, patch) {
        const householdId = await this.requireHouseholdId();
        const current = (await this.listActions()).find((action) => action.id === id);
        if (!current) throw new ValidationError(`Action "${id}" not found.`, { id });
        const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
        if (merged.status === 'done' && !merged.completedAt) merged.completedAt = new Date().toISOString();
        if (merged.status !== 'done') merged.completedAt = null;
        const { data, error } = await this.client
            .from('actions')
            .update(toActionRow(merged, householdId))
            .eq('household_id', householdId)
            .eq('id', id)
            .select('*')
            .single();
        if (error) throw storageError(error, 'Could not update the action.');
        return toAction(data);
    }

    async carryForwardAction(id, targetMonthId) {
        return this.updateAction(id, { carriedToMonthId: targetMonthId });
    }

    async deleteAction(id) {
        const householdId = await this.requireHouseholdId();
        const { error } = await this.client.from('actions').delete().eq('household_id', householdId).eq('id', id);
        if (error) throw storageError(error, 'Could not delete the action.');
    }

    async updateWorkflow(monthId, patch, options) {
        const record = await this.requireRecord(monthId);
        return (await this.persistRecord({ ...record, workflow: { ...record.workflow, ...patch } }, options)).workflow;
    }

    async lockMonth(monthId, options) {
        return this.updateWorkflow(monthId, { status: 'locked', lockedAt: new Date().toISOString() }, options);
    }

    async unlockMonth(monthId, reason, options) {
        const record = await this.requireRecord(monthId);
        return this.updateWorkflow(monthId, {
            status: record.workflow.reviewedAt ? 'meeting_ready' : 'draft',
            lockedAt: null,
            unlockReason: reason?.trim() ? reason.trim() : null,
        }, options);
    }

    async isUsingLocalData() {
        return false;
    }

    async getLatestFinancialCheckIn() {
        const value = await this.getMeetingEntry(null, FINANCIAL_CHECK_IN_KEY);
        if (!value || typeof value !== 'object') return null;
        return value;
    }
}
