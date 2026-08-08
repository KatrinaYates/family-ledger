import { LocalLedgerRepository } from './LocalLedgerRepository.js';
import { SupabaseLedgerRepository } from './SupabaseLedgerRepository.js';
import { supabase, isSupabaseConfigured } from '../supabase/client.js';

export const isSupabaseBackend = import.meta.env.VITE_LEDGER_BACKEND === 'supabase';

if (isSupabaseBackend && !isSupabaseConfigured) {
    throw new Error('VITE_LEDGER_BACKEND is supabase, but Supabase environment variables are missing.');
}

export const ledgerRepository = isSupabaseBackend
    ? new SupabaseLedgerRepository(supabase)
    : new LocalLedgerRepository();

export { LocalLedgerRepository } from './LocalLedgerRepository.js';
export { SupabaseLedgerRepository } from './SupabaseLedgerRepository.js';
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
