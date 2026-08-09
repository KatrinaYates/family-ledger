/** @typedef {'draft' | 'meeting_ready' | 'locked'} WorkflowStatus */

/**
 * @typedef {Object} Workflow
 * @property {WorkflowStatus} status
 * @property {string | null} sourceAsOf
 * @property {string | null} reviewedAt
 * @property {string | null} lockedAt
 * @property {string | null} [unlockReason]
 */

/**
 * @typedef {Object} Generation
 * @property {'chatgpt' | 'manual' | 'sample'} source
 * @property {number} version
 * @property {string | null} generatedAt
 */

/**
 * @typedef {Object} DataQualityWarning
 * @property {string} [code]
 * @property {string} message
 * @property {'info' | 'warning' | 'error'} [severity]
 */

/**
 * @typedef {Object} StaleConnection
 * @property {string} institution
 * @property {string} [lastSync]
 */

/**
 * @typedef {Object} MissingAccount
 * @property {string} name
 * @property {string} [type]
 */

/**
 * @typedef {Object} DataQuality
 * @property {StaleConnection[]} staleConnections
 * @property {MissingAccount[]} missingAccounts
 * @property {DataQualityWarning[]} warnings
 */

/**
 * @typedef {Object} LedgerMonth
 * @property {number} schemaVersion
 * @property {string} monthId
 * @property {number} version
 * @property {string | null} updatedAt
 * @property {Workflow} workflow
 * @property {Generation} generation
 * @property {DataQuality} dataQuality
 * @property {object} sourceData
 * @property {object} generatedAnalysis
 * @property {object} meetingData
 */

/**
 * @typedef {Object} LedgerRecordMeta
 * @property {string} monthId
 * @property {number} schemaVersion
 * @property {number} version
 * @property {string | null} updatedAt
 * @property {Workflow} workflow
 * @property {Generation} generation
 * @property {DataQuality} dataQuality
 */

/**
 * @typedef {Object} WriteOptions
 * @property {number} [expectedVersion]
 */

/**
 * @typedef {'not_started' | 'in_progress' | 'done' | 'deferred'} ActionStatus
 */

/**
 * @typedef {Object} Action
 * @property {string} id
 * @property {string | null} householdId
 * @property {string} originMonthId
 * @property {string | null} carriedToMonthId
 * @property {string} title
 * @property {string} owner
 * @property {string | null} dueDate
 * @property {ActionStatus} status
 * @property {string} priority
 * @property {string} notes
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string | null} completedAt
 */

export {};
