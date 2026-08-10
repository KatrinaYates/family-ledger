/** Household-scoped ledger_entries key for the latest financial check-in snapshot. */
export const FINANCIAL_CHECK_IN_KEY = 'fl-financial-check-in-latest';

/** Snapshots older than this are labeled stale in the UI. */
export const CHECK_IN_STALE_MS = 48 * 60 * 60 * 1000;
