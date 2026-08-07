import { LocalLedgerRepository } from './LocalLedgerRepository.js';

export const ledgerRepository = new LocalLedgerRepository();

export { LocalLedgerRepository } from './LocalLedgerRepository.js';
export { LedgerRepository } from './LedgerRepository.js';
export { createBlankLedgerMonth } from './createBlankLedgerMonth.js';
export {
    LedgerRepositoryError,
    LedgerNotFoundError,
    LockedMonthError,
    ValidationError,
    ConflictError,
    StorageError,
    isLedgerRepositoryError,
} from './errors.js';
