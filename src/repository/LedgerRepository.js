/**
 * Ledger repository interface — implemented by LocalLedgerRepository and future SupabaseLedgerRepository.
 * @interface
 */
export class LedgerRepository {
    listMonths() {
        throw new Error('Not implemented');
    }

    getMonth(_monthId) {
        throw new Error('Not implemented');
    }

    createMonth(_month) {
        throw new Error('Not implemented');
    }

    getMonthSource(_monthId) {
        throw new Error('Not implemented');
    }

    updateMonthSource(_monthId, _sourceData) {
        throw new Error('Not implemented');
    }

    regenerateAnalysis(_monthId) {
        throw new Error('Not implemented');
    }

    getLedgerRecord(_monthId) {
        throw new Error('Not implemented');
    }

    saveMeetingEntry(_monthId, _key, _value) {
        throw new Error('Not implemented');
    }

    getMeetingEntry(_monthId, _key) {
        throw new Error('Not implemented');
    }

    listActions(_filters) {
        throw new Error('Not implemented');
    }

    listActionsForMonth(_monthId) {
        throw new Error('Not implemented');
    }

    listCarryForwardCandidates(_monthId) {
        throw new Error('Not implemented');
    }

    saveAction(_action) {
        throw new Error('Not implemented');
    }

    updateAction(_id, _patch) {
        throw new Error('Not implemented');
    }

    carryForwardAction(_id, _targetMonthId) {
        throw new Error('Not implemented');
    }

    deleteAction(_id) {
        throw new Error('Not implemented');
    }

    updateWorkflow(_monthId, _patch) {
        throw new Error('Not implemented');
    }

    lockMonth(_monthId) {
        throw new Error('Not implemented');
    }
}
