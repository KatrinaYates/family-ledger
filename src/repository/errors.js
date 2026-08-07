/** @typedef {'NOT_FOUND' | 'LOCKED' | 'VALIDATION' | 'CONFLICT' | 'STORAGE'} LedgerErrorCode */

export class LedgerRepositoryError extends Error {
    /** @param {LedgerErrorCode} code @param {string} message @param {Record<string, unknown>} [details] */
    constructor(code, message, details = {}) {
        super(message);
        this.name = 'LedgerRepositoryError';
        this.code = code;
        this.details = details;
    }
}

export class LedgerNotFoundError extends LedgerRepositoryError {
    /** @param {string} monthId */
    constructor(monthId) {
        super('NOT_FOUND', `No ledger data found for month "${monthId}".`, { monthId });
        this.name = 'LedgerNotFoundError';
    }
}

export class LockedMonthError extends LedgerRepositoryError {
    /** @param {string} monthId */
    constructor(monthId) {
        super('LOCKED', 'Month is locked. Unlock to continue editing.', { monthId });
        this.name = 'LockedMonthError';
    }
}

export class ValidationError extends LedgerRepositoryError {
    /** @param {string} message @param {Record<string, unknown>} [details] */
    constructor(message, details = {}) {
        super('VALIDATION', message, details);
        this.name = 'ValidationError';
    }
}

export class ConflictError extends LedgerRepositoryError {
    /** @param {string} monthId @param {number} expectedVersion @param {number} currentVersion */
    constructor(monthId, expectedVersion, currentVersion) {
        super('CONFLICT', 'This month was updated elsewhere. Reload to continue.', {
            monthId,
            expectedVersion,
            currentVersion,
        });
        this.name = 'ConflictError';
    }
}

export class StorageError extends LedgerRepositoryError {
    /** @param {string} message @param {Record<string, unknown>} [details] */
    constructor(message, details = {}) {
        super('STORAGE', message, details);
        this.name = 'StorageError';
    }
}

/** @param {unknown} error */
export function isLedgerRepositoryError(error) {
    return error instanceof LedgerRepositoryError;
}
