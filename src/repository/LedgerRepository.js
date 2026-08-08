/**
 * Ledger repository interface — implemented by LocalLedgerRepository and SupabaseLedgerRepository.
 * All I/O boundary methods return Promises.
 * @interface
 */
export class LedgerRepository {
    listHouseholds() { throw new Error('Not implemented'); }
    setActiveHousehold(_householdId) { throw new Error('Not implemented'); }
    getActiveHousehold() { throw new Error('Not implemented'); }
    createHousehold(_name) { throw new Error('Not implemented'); }
    createHouseholdInvitation(_email) { throw new Error('Not implemented'); }
    acceptHouseholdInvitation(_token) { throw new Error('Not implemented'); }
    listHouseholdInvitations() { throw new Error('Not implemented'); }

    listMonths() { throw new Error('Not implemented'); }
    listNavigableMonthIds() { throw new Error('Not implemented'); }
    hasLedgerData(_monthId) { throw new Error('Not implemented'); }
    getWorkflow(_monthId) { throw new Error('Not implemented'); }
    getMonth(_monthId) { throw new Error('Not implemented'); }
    getLedgerRecord(_monthId) { throw new Error('Not implemented'); }
    createMonth(_month) { throw new Error('Not implemented'); }
    getMonthSource(_monthId) { throw new Error('Not implemented'); }
    updateMonthSource(_monthId, _sourceData, _options) { throw new Error('Not implemented'); }
    regenerateAnalysis(_monthId, _options) { throw new Error('Not implemented'); }
    saveMeetingEntry(_monthId, _key, _value) { throw new Error('Not implemented'); }
    getMeetingEntry(_monthId, _key) { throw new Error('Not implemented'); }
    listActions(_filters) { throw new Error('Not implemented'); }
    listActionsForMonth(_monthId) { throw new Error('Not implemented'); }
    listOpenActionsForMonth(_monthId) { throw new Error('Not implemented'); }
    listCarryForwardCandidates(_monthId) { throw new Error('Not implemented'); }
    saveAction(_action) { throw new Error('Not implemented'); }
    updateAction(_id, _patch) { throw new Error('Not implemented'); }
    carryForwardAction(_id, _targetMonthId) { throw new Error('Not implemented'); }
    deleteAction(_id) { throw new Error('Not implemented'); }
    updateWorkflow(_monthId, _patch, _options) { throw new Error('Not implemented'); }
    lockMonth(_monthId, _options) { throw new Error('Not implemented'); }
    unlockMonth(_monthId, _reason, _options) { throw new Error('Not implemented'); }
    isUsingLocalData(_monthId) { throw new Error('Not implemented'); }
}
