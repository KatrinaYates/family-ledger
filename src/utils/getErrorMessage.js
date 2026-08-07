import { isLedgerRepositoryError } from '../repository/errors.js';

/** @param {unknown} error @param {string} [fallback] */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    if (isLedgerRepositoryError(error)) {
        return error.message;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}
