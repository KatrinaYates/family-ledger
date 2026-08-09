import { getMonthCatalogEntry } from './months.js';

/** @param {number} index */
function emptyCfoPriority(index) {
    return {
        number: index + 1,
        title: 'Add a priority',
        why: 'Describe why this matters for the household.',
        benefit: 'What improves if you act on this?',
        difficulty: 'Easy · Medium · Hard',
        note: '',
        suggestedFunds: [],
        decisions: [],
    };
}

/**
 * Fill missing section shapes so blank months enrich and render without crashing.
 * @param {object} sourceData
 * @param {string} monthId
 */
export function applyBlankSourceDefaults(sourceData = {}, monthId) {
    const catalog = getMonthCatalogEntry(monthId);
    const label = catalog?.label ?? '';
    const year = catalog?.year ?? 2026;

    const snapshot = sourceData.snapshot ?? {};
    const story = sourceData.story ?? {};
    const spending = sourceData.spending ?? {};
    const cfo = sourceData.cfo ?? {};
    const future = sourceData.future ?? {};
    const meeting = sourceData.meeting ?? {};
    const actions = sourceData.actions ?? {};
    const celebrate = sourceData.celebrate ?? {};
    const handoff = sourceData.handoff ?? {};

    return {
        meta: {
            monthId,
            month: label,
            year,
            meetingDate: '',
            meetingLength: '',
            motto: '',
            intention: '',
            focus: '',
            biggestWin: '',
            biggestFocus: '',
            names: '',
            ...sourceData.meta,
        },
        snapshot: {
            netWorth: { value: '—', insight: '', components: [], status: '', caveat: '' },
            cash: { total: '—', totalExact: '—', status: '', insight: '', kpis: [], accounts: [] },
            retirement: { total: '—', totalExact: '—', monthContributions: '—', accounts: [] },
            emergencyFund: { value: '—', description: '' },
            debt: { total: '—', groups: [] },
            ...snapshot,
            cash: {
                total: '—',
                totalExact: '—',
                status: '',
                insight: '',
                kpis: [],
                accounts: [],
                ...snapshot.cash,
            },
            retirement: {
                total: '—',
                totalExact: '—',
                monthContributions: '—',
                accounts: [],
                ...snapshot.retirement,
            },
            netWorth: {
                value: '—',
                insight: '',
                components: [],
                status: '',
                caveat: '',
                ...snapshot.netWorth,
            },
            emergencyFund: {
                value: '—',
                description: '',
                ...snapshot.emergencyFund,
            },
            debt: {
                total: '—',
                groups: [],
                loans: [],
                creditCards: [],
                insight: '',
                ...snapshot.debt,
            },
            missingBeforeLock: [],
        },
        story: {
            income: { total: '—', period: '', groups: [] },
            bills: { groups: [], items: [] },
            lifestyle: { groups: [], items: [] },
            savings: { missing: [] },
            investments: { monthContributions: '—' },
            debtPayments: { items: [] },
            endingPosition: { totalCash: '—', billsAccount: '—', available: '—' },
            explanation: { title: 'What explains the month', items: [], closing: '' },
            ...story,
            income: {
                total: '—',
                period: '',
                groups: [],
                ...story.income,
            },
            endingPosition: {
                totalCash: '—',
                billsAccount: '—',
                available: '—',
                ...story.endingPosition,
            },
            explanation: {
                items: [],
                closing: '',
                ...story.explanation,
            },
        },
        spending: {
            total: '—',
            priorMonth: '—',
            change: '—',
            changePercent: '—',
            topCategories: [],
            momChanges: [],
            bigPurchases: [],
            unexpected: [],
            changes: [],
            questions: [],
            ...spending,
        },
        cfo: {
            ...cfo,
            priorities:
                Array.isArray(cfo.priorities) && cfo.priorities.length > 0
                    ? cfo.priorities
                    : [0, 1, 2].map(emptyCfoPriority),
        },
        future: {
            goals: [],
            upcomingExpenses: [],
            kidsSavings: {
                total: '—',
                monthAdded: '—',
                monthContributions: '—',
                monthInterest: '—',
                accounts: [],
                note: 'Protected for the kids and excluded from household spendable cash.',
                ...future.kidsSavings,
            },
            retirement: {
                balance: '—',
                monthContributions: '—',
                projectionNote: '',
                ...future.retirement,
            },
            ...future,
        },
        meeting: {
            prompts: [],
            sections: [],
            questions: [],
            insight: '',
            ...meeting,
        },
        actions: {
            items: [],
            monthlyFocus: '',
            ...actions,
        },
        celebrate: {
            biggestWin: '—',
            bestHabit: '—',
            moneySaved: '—',
            debtReduced: '—',
            ...celebrate,
        },
        handoff: {
            summary: '',
            carryForward: [],
            revisit: [],
            feedback: {},
            ...handoff,
        },
    };
}
