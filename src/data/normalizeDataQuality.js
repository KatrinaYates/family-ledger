/** @typedef {{ code?: string, message: string }} DataQualityWarning */
/** @typedef {{ institution: string, lastSync?: string }} StaleConnection */
/** @typedef {{ name: string, type?: string }} MissingAccount */

const EMPTY = {
    staleConnections: [],
    missingAccounts: [],
    warnings: [],
};

/**
 * @param {import('../repository/types.js').DataQuality | null | undefined} raw
 * @returns {import('../repository/types.js').DataQuality}
 */
export function normalizeDataQuality(raw) {
    if (!raw || typeof raw !== 'object') {
        return { ...EMPTY };
    }

    return {
        staleConnections: Array.isArray(raw.staleConnections)
            ? raw.staleConnections.filter((item) => item && typeof item === 'object')
            : [],
        missingAccounts: Array.isArray(raw.missingAccounts)
            ? raw.missingAccounts.filter((item) => item && typeof item === 'object')
            : [],
        warnings: Array.isArray(raw.warnings)
            ? raw.warnings.filter((item) => item && typeof item.message === 'string' && item.message.trim())
            : [],
    };
}

/**
 * Flatten dataQuality into display-ready banner items.
 * @param {import('../repository/types.js').DataQuality | null | undefined} dataQuality
 * @returns {Array<{ kind: string, text: string }>}
 */
export function collectDataQualityItems(dataQuality) {
    const normalized = normalizeDataQuality(dataQuality);
    /** @type {Array<{ kind: string, text: string }>} */
    const items = [];

    for (const warning of normalized.warnings) {
        items.push({
            kind: warning.code || 'warning',
            text: warning.message.trim(),
        });
    }

    for (const connection of normalized.staleConnections) {
        const institution = connection.institution?.trim();
        if (!institution) continue;
        const syncNote = connection.lastSync ? ` (last sync ${connection.lastSync})` : '';
        items.push({
            kind: 'stale_connection',
            text: `${institution} connection may be stale${syncNote}.`,
        });
    }

    for (const account of normalized.missingAccounts) {
        const name = account.name?.trim();
        if (!name) continue;
        const typeNote = account.type ? ` (${account.type})` : '';
        items.push({
            kind: 'missing_account',
            text: `Missing account: ${name}${typeNote}.`,
        });
    }

    return items;
}
