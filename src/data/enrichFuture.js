import { buildFutureProgress } from './futureProgress.js';
import { formatCurrencyDetailed, parseAmount } from './spendingAnalysis.js';

/** @param {string | undefined} value */
function hasValue(value) {
  return Boolean(value && value !== '—');
}

/** @param {string | null | undefined} value */
function formatContribution(value) {
  if (!hasValue(value)) return null;
  const trimmed = String(value).trim();
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
}

/** @param {object} sourceData */
function resolveDebtPayments(sourceData) {
  const debt = sourceData.snapshot?.debt ?? {};
  if (hasValue(debt.monthPayments)) return debt.monthPayments;

  const items = sourceData.story?.debtPayments?.items ?? [];
  const total = items.reduce((sum, item) => {
    const amount = parseAmount(item.amount);
    return amount != null ? sum + amount : sum;
  }, 0);
  return total > 0 ? formatCurrencyDetailed(total, true) : null;
}

/** @param {object} sourceData @param {{ total?: string, components?: Array<{ label: string, value: string }> } | null} futureProgress */
function buildSummary(sourceData, futureProgress) {
  const components = futureProgress?.components ?? [];
  if (!components.length) return '';

  const labels = new Set(components.map((component) => component.label.toLowerCase()));
  /** @type {string[]} */
  const phrases = [];

  if (labels.has('retirement')) phrases.push('investing for retirement');
  if (labels.has('kids savings')) phrases.push('the kids');

  const emergency = sourceData.snapshot?.emergencyFund ?? {};
  const target = parseAmount(emergency.target);
  if (labels.has('emergency fund')) {
    if (target != null && target > 0) {
      phrases.push(`moving the starter emergency fund closer to ${formatCurrencyDetailed(target, false)}`);
    } else {
      phrases.push('the starter emergency fund');
    }
  }

  if (labels.has('other savings')) phrases.push('other savings goals');

  if (!phrases.length) return '';

  if (phrases.length === 1) {
    return `We continued ${phrases[0]} this month.`;
  }

  const last = phrases[phrases.length - 1];
  const rest = phrases.slice(0, -1);
  if (last.startsWith('moving ')) {
    return `We continued ${rest.join(' and ')} while ${last}.`;
  }
  return `We continued ${rest.join(', ')} and ${last} this month.`;
}

/** @param {object} sourceData */
function buildGoals(sourceData) {
  const snapshot = sourceData.snapshot ?? {};
  const future = sourceData.future ?? {};
  /** @type {Array<object>} */
  const goals = [];

  const emergency = snapshot.emergencyFund ?? {};
  if (hasValue(emergency.value) || hasValue(emergency.target)) {
    const currentNum = parseAmount(emergency.value);
    const targetNum = parseAmount(emergency.target);
    const progressPercent = currentNum != null && targetNum != null && targetNum > 0
      ? Math.min(100, Math.round((currentNum / targetNum) * 100))
      : null;
    const remainingNum = currentNum != null && targetNum != null
      ? Math.max(0, targetNum - currentNum)
      : parseAmount(emergency.remaining);

    goals.push({
      id: 'starter-emergency-fund',
      type: 'emergency-fund',
      title: emergency.title ?? 'Starter emergency fund',
      icon: '🛟',
      current: emergency.value ?? null,
      target: emergency.target ?? null,
      progressPercent,
      monthlyProgress: formatContribution(emergency.monthContributions),
      secondaryValue: remainingNum != null ? formatCurrencyDetailed(remainingNum, true) : null,
      secondaryLabel: 'remaining',
      context: emergency.context?.trim()
        || emergency.strategy?.trim()
        || null,
    });
  }

  const debt = snapshot.debt ?? {};
  const debtPayments = resolveDebtPayments(sourceData);
  if (hasValue(debt.total)) {
    const baselineUnavailable = debt.measurementStatus === 'historical_baseline_unavailable';
    goals.push({
      id: 'debt-payoff',
      type: 'debt',
      title: 'Debt payoff',
      icon: '💳',
      current: debt.total,
      target: null,
      progressPercent: null,
      monthlyProgress: hasValue(debtPayments) ? debtPayments : null,
      monthlyProgressLabel: 'paid toward debt this month',
      caveat: baselineUnavailable
        ? 'Principal change unavailable because a comparable June 30 balance was not captured.'
        : debt.progressCaveat?.trim() || null,
      status: baselineUnavailable ? 'baseline-unavailable' : null,
    });
  }

  const retirement = future.retirement ?? {};
  if (hasValue(retirement.monthContributions) || hasValue(retirement.balance)) {
    goals.push({
      id: 'retirement',
      type: 'retirement',
      title: 'Retirement',
      icon: '🌱',
      monthlyProgress: formatContribution(retirement.monthContributions),
      monthlyProgressLabel: 'contributed this month',
      secondaryValue: retirement.balance ?? null,
      secondaryLabel: 'connected balance',
      caveat: retirement.balanceCaveat?.trim()
        || retirement.balanceNote?.trim()
        || null,
    });
  }

  const kids = future.kidsSavings ?? {};
  const childSplits = (kids.accounts ?? [])
    .filter((account) => hasValue(account.monthContributions) && account.name)
    .map((account) => {
      const amount = String(account.monthContributions).replace(/^\+/, '');
      return `${account.name} +${amount}`;
    });

  if (hasValue(kids.monthContributions) || hasValue(kids.total) || childSplits.length) {
    goals.push({
      id: 'kids-savings',
      type: 'kids-savings',
      title: 'Kids savings',
      icon: '👨‍👩‍👦',
      monthlyProgress: formatContribution(kids.monthContributions),
      monthlyProgressLabel: 'contributed this month',
      secondaryValue: kids.total ?? null,
      secondaryLabel: 'protected for the kids',
      context: kids.note?.trim()
        || 'Protected for the kids and excluded from household spendable cash.',
      childSplits,
    });
  }

  const sourceGoals = future.goals ?? [];
  for (const goal of sourceGoals) {
    if (!goal || typeof goal !== 'object' || !goal.id) continue;
    const existing = goals.find((entry) => entry.id === goal.id);
    if (existing) {
      Object.assign(existing, goal);
    } else {
      goals.push(goal);
    }
  }

  return goals;
}

/** @param {object} sourceData @param {{ total?: string, components?: Array<{ label: string, value: string }> } | null} futureProgress */
function buildMonthlyActivity(sourceData, futureProgress) {
  /** @type {Array<object>} */
  const items = [];

  for (const component of futureProgress?.components ?? []) {
    items.push({
      label: component.label,
      value: formatContribution(component.value) ?? component.value,
      type: 'contribution',
    });
  }

  const debtPayments = resolveDebtPayments(sourceData);
  if (hasValue(debtPayments)) {
    const debt = sourceData.snapshot?.debt ?? {};
    const baselineUnavailable = debt.measurementStatus === 'historical_baseline_unavailable';
    items.push({
      label: 'Debt payments',
      value: debtPayments,
      type: 'debt-payment',
      context: baselineUnavailable
        ? 'Debt payment activity is known, but principal reduction cannot yet be measured.'
        : null,
    });
  }

  return items;
}

/** @param {object} future */
function buildComingUp(future) {
  const upcoming = future.upcoming ?? [];
  return upcoming.filter((item) => item && typeof item === 'object' && item.title?.trim());
}

/** @param {object} sourceData @param {Array<object>} goals */
function buildDiscussionPrompts(sourceData, goals) {
  /** @type {string[]} */
  const prompts = [];
  const emergency = sourceData.snapshot?.emergencyFund ?? {};
  const targetNum = parseAmount(emergency.target);
  const strategyText = `${emergency.strategy ?? ''} ${emergency.context ?? ''}`.toLowerCase();

  if (
    targetNum === 1000
    && (/pause|debt|priority/i.test(strategyText) || emergency.strategy?.trim() || emergency.context?.trim())
  ) {
    prompts.push('Do we still want to stop the emergency fund at $1,000 while debt is the priority?');
  }

  const debtGoal = goals.find((goal) => goal.type === 'debt');
  if (debtGoal?.status === 'baseline-unavailable') {
    prompts.push('Once reliable debt comparisons are available, which balance do we want to measure payoff progress against?');
  }

  const debtTotal = parseAmount(sourceData.snapshot?.debt?.total);
  if (debtTotal != null && debtTotal > 0 && prompts.length < 3) {
    prompts.push('Do home or auto repairs need their own future fund, or can that wait until after the credit cards?');
  }

  return prompts.slice(0, 3);
}

/**
 * Future presentation enrichment — synthesizes trajectory-first view from source facts.
 * @param {object} sourceData
 * @param {object | undefined} meta
 */
export function enrichFuture(sourceData, meta) {
  const future = sourceData.future ?? {};
  const futureProgress = buildFutureProgress(sourceData);
  const goals = buildGoals(sourceData);
  const monthlyActivity = buildMonthlyActivity(sourceData, futureProgress);
  const comingUp = buildComingUp(future);
  const summary = buildSummary(sourceData, futureProgress);
  const discussionPrompts = buildDiscussionPrompts(sourceData, goals);
  const label = meta?.month?.trim() || 'This month';

  return {
    subtitle: 'Are we moving toward the life and goals we actually care about?',
    futureProgress,
    summary,
    goals,
    monthlyActivity,
    comingUp,
    discussionPrompts,
    atAGlanceLabel: `Future at a Glance`,
    goalsLabel: 'Our Goals',
    activityLabel: `What Changed in ${label}`,
    comingUpLabel: 'Coming Up',
    talkTogetherLabel: 'Talk About Together',
  };
}
