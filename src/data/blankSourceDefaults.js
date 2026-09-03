import { getMonthCatalogEntry } from './months.js';

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
    const retrospective = sourceData.retrospective ?? {};
    const celebrate = sourceData.celebrate ?? {};
    const handoff = sourceData.handoff ?? {};

    return {
        meta: {
            monthId,
            month: label,
            year,
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
            emergencyFund: { value: '—', description: '', target: null, monthContributions: null },
            debt: { total: '—', groups: [], monthPayments: null, measurementStatus: null },
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
                target: null,
                monthContributions: null,
                ...snapshot.emergencyFund,
            },
            debt: {
                total: '—',
                groups: [],
                loans: [],
                creditCards: [],
                insight: '',
                monthPayments: null,
                measurementStatus: null,
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
            transactions: [],
            patterns: [],
            merchants: [],
            merchantActivity: [],
            recurring: [],
            fees: [],
            ...spending,
        },
        cfo: {
            ...cfo,
            recommendations:
                Array.isArray(cfo.recommendations) && cfo.recommendations.length > 0
                    ? cfo.recommendations
                    : [],
            priorities: Array.isArray(cfo.priorities) ? cfo.priorities : [],
        },
        future: {
            goals: [],
            upcoming: [],
            debtPayoffPlan: null,
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
                balanceCaveat: '',
                ...future.retirement,
            },
            ...future,
        },
        meeting: {
            questions: [],
            ...meeting,
        },
        actions: {
            items: [],
            monthlyFocus: '',
            ...actions,
        },
        retrospective: {
            subtitle: '',
            questionsToConsider: [],
            ...retrospective,
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
            ...handoff,
        },
    };
}
