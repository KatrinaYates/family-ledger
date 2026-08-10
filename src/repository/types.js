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

/**
 * @typedef {'available' | 'protected' | 'neutral'} CashClassification
 */

/**
 * @typedef {Object} CheckInCashAccount
 * @property {string} name
 * @property {number | string} balance
 * @property {CashClassification} [classification]
 * @property {string} [purpose]
 */

/**
 * @typedef {Object} CheckInBillBucket
 * @property {string} name
 * @property {number | string} current
 * @property {number | string} target
 * @property {boolean} [funded]
 */

/**
 * @typedef {Object} FinancialCheckInSnapshot
 * @property {string} [householdId]
 * @property {string} [refreshedAt]
 * @property {string} [status]
 * @property {Object} [cash]
 * @property {Object} [bills]
 * @property {Object} [kidsSavings]
 * @property {Object} [emergencyFund]
 * @property {Object} [debt]
 * @property {Object} [retirement]
 * @property {Object} [netWorth]
 * @property {Object} [recentActivity]
 */

/**
 * @typedef {Object} FutureGoalSource
 * @property {string} id
 * @property {string} [type]
 * @property {string} [title]
 * @property {string | number} [target]
 * @property {string | number} [currentPosition]
 * @property {string | number} [monthlyProgress]
 * @property {string} [asOf]
 * @property {string} [measurementStatus]
 * @property {string} [context]
 */

/**
 * @typedef {Object} FutureUpcomingSource
 * @property {string} id
 * @property {string} title
 * @property {string} [date]
 * @property {string} [amount]
 * @property {string} [type]
 * @property {string} [context]
 */

/**
 * @typedef {Object} GeneratedFutureAnalysis
 * @property {string} subtitle
 * @property {{ total?: string, components?: Array<{ label: string, value: string }> } | null} futureProgress
 * @property {string} summary
 * @property {Array<Object>} goals
 * @property {Array<Object>} monthlyActivity
 * @property {Array<Object>} comingUp
 * @property {string[]} discussionPrompts
 */

export {};
