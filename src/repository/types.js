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
 * @typedef {Object} HouseholdSummary
 * @property {string} id
 * @property {string} name
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} HouseholdMemberSummary
 * @property {string} userId
 * @property {string} email
 * @property {string} displayName
 * @property {string} joinedAt
 * @property {boolean} isSelf
 */

/**
 * @typedef {Object} GeneratedFutureAnalysis
 * @property {string} subtitle
 * @property {{ total?: string, components?: Array<{ label: string, value: string }> } | null} futureProgress
 * @property {string} summary
 * @property {Array<Object>} goals
 * @property {Array<Object>} comingUp
 * @property {string[]} discussionPrompts
 */

/**
 * @typedef {Object} DebtPlanningRow
 * @property {string} id
 * @property {string} name
 * @property {number} balance
 * @property {number | null} apr
 * @property {number} minimum
 * @property {number} priority
 */

/**
 * ChatGPT-authored inputs for the interactive payoff projection. The frontend
 * models only these supplied values; it does not infer a debt budget or APR.
 * @typedef {Object} DebtPlanningSnapshot
 * @property {string} asOf
 * @property {number} baselineMonthlyBudget
 * @property {string} baselineLabel
 * @property {DebtPlanningRow[]} debts
 */

/**
 * @typedef {Object} ActionSeed
 * @property {string} id
 * @property {string} action
 * @property {string} owner
 * @property {string | null} dueDate
 * @property {'not_started' | 'in_progress' | 'done' | 'deferred'} status
 */

/**
 * @typedef {Object} CfoRecommendationTarget
 * @property {string} [type]
 * @property {string} [name]
 * @property {number} [currentBalance]
 * @property {number} [projectedBalance]
 */

/**
 * @typedef {Object} CfoRecommendationVisualization
 * @property {'balance_comparison' | 'payment_comparison' | 'allocation' | 'timeline' | string} [type]
 * @property {number} [currentValue]
 * @property {number} [projectedValue]
 * @property {string} [currentLabel]
 * @property {string} [projectedLabel]
 * @property {Array<{ label: string, value: number }>} [items]
 */

/**
 * @typedef {Object} CfoRecommendation
 * @property {string} id
 * @property {number} rank
 * @property {string} type
 * @property {string} headline
 * @property {string} action
 * @property {string} [timeframe]
 * @property {number} [amountFreed]
 * @property {CfoRecommendationTarget} [target]
 * @property {Object} [impact]
 * @property {Array<{ label: string, value: number | string }>} [evidence]
 * @property {string} [calculationLine]
 * @property {string[]} [assumptions]
 * @property {string} [confidence]
 * @property {CfoRecommendationVisualization} [visualization]
 * @property {boolean} [isLegacy]
 */

/**
 * @typedef {Object} RetrospectiveQuestion
 * @property {string} id
 * @property {string} question
 * @property {string} [context]
 * @property {boolean} [allowResponse]
 * @property {boolean} [isGenericFallback]
 */

export {};
