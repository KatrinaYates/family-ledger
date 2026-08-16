import { buildFutureProgress, resolveDebtPayments } from './futureProgress.js';
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

/** @param {object} sourceData @param {{ total?: string, components?: Array<{ label: string, value: string }> } | null} futureProgress */
function buildSummary(sourceData, futureProgress) {
  const components = futureProgress?.components ?? [];
  if (!components.length) return '';

  const labels = new Set(components.map((component) => component.label.toLowerCase()));
  const phrases = [];

  if (labels.has('retirement')) phrases.push('investing for retirement');
  if (labels.has('kids savings')) phrases.push('the kids');

  const emergency = sourceData.snapshot?.emergencyFund ?? {};
  const target = parseAmount(emergency.target);
  if (labels.has('emergency fund')) {
    phrases.push(target != null && target > 0
      ? `moving the starter emergency fund closer to ${formatCurrencyDetailed(target, false)}`
      : 'the starter emergency fund');
  }

  if (labels.has('other savings')) phrases.push('other savings goals');
  if (labels.has('debt payments')) phrases.push('paying down debt');
  if (!phrases.length) return '';
  if (phrases.length === 1) return `We continued ${phrases[0]} this month.`;

  const last = phrases[phrases.length - 1];
  const rest = phrases.slice(0, -1);
  return last.startsWith('moving ')
    ? `We continued ${rest.join(' and ')} while ${last}.`
    : `We continued ${rest.join(', ')} and ${last} this month.`;
}

/** @param {object} sourceData */
function buildGoals(sourceData) {
  const snapshot = sourceData.snapshot ?? {};
  const future = sourceData.future ?? {};
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
      context: emergency.context?.trim() || emergency.strategy?.trim() || null,
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
      current: debt.total,
      monthlyProgress: hasValue(debtPayments) ? debtPayments : null,
      status: baselineUnavailable ? 'baseline-unavailable' : null,
    });
  }

  const retirement = future.retirement ?? {};
  if (hasValue(retirement.monthContributions) || hasValue(retirement.balance)) {
    goals.push({
      id: 'retirement',
      type: 'retirement',
      title: 'Retirement',
      monthlyProgress: formatContribution(retirement.monthContributions),
      secondaryValue: retirement.balance ?? null,
    });
  }

  const kids = future.kidsSavings ?? {};
  if (hasValue(kids.monthContributions) || hasValue(kids.total) || (kids.accounts ?? []).length) {
    goals.push({
      id: 'kids-savings',
      type: 'kids-savings',
      title: 'Kids savings',
      monthlyProgress: formatContribution(kids.monthContributions),
      secondaryValue: kids.total ?? null,
    });
  }

  return goals;
}

function buildDetailedDebt(sourceData) {
  const snapshotDebt = sourceData.snapshot?.debt ?? {};
  const paymentActivity = sourceData.story?.debtPayments?.items ?? [];
  const paidThisMonth = resolveDebtPayments(sourceData);
  const authored = sourceData.future?.debt ?? {};

  const hasDebtContent = hasValue(snapshotDebt.total)
    || (snapshotDebt.creditCards ?? []).length
    || (snapshotDebt.loans ?? []).length
    || paymentActivity.length;

  if (!hasDebtContent && !Object.keys(authored).length) return null;

  return {
    total: snapshotDebt.total ?? authored.total ?? null,
    insight: snapshotDebt.insight?.trim() || authored.insight?.trim() || null,
    creditCards: authored.creditCards ?? snapshotDebt.creditCards ?? [],
    loans: authored.loans ?? snapshotDebt.loans ?? [],
    paymentActivity,
    paidThisMonth: hasValue(paidThisMonth) ? paidThisMonth : null,
  };
}

function buildDebtPayoffPlan(sourceData) {
  const authored = sourceData.future?.debtPayoffPlan;
  if (authored?.queue?.length) return authored;

  const cards = sourceData.snapshot?.debt?.creditCards ?? [];
  if (!cards.length) return null;
  return {
    strategy: 'Use the household payoff order captured for this month; verify current APRs before changing the order.',
    currentTarget: cards[0]?.name ?? null,
    queue: cards.map((card) => ({ name: card.name, balance: card.amount })),
  };
}

function buildEmergencyFund(sourceData) {
  return sourceData.future?.emergencyFund ?? sourceData.snapshot?.emergencyFund ?? null;
}

function buildSavings(sourceData) {
  const future = sourceData.future ?? {};
  const kids = future.kidsSavings ?? null;
  const other = future.savings ?? future.otherSavings ?? [];
  if (!kids && !other.length) return null;
  return { kids, other };
}

function buildRetirement(sourceData) {
  const future = sourceData.future ?? {};
  const authored = future.retirement ?? {};
  const snapshot = sourceData.snapshot?.retirement ?? {};
  if (!Object.keys(authored).length && !Object.keys(snapshot).length) return null;
  return {
    ...snapshot,
    ...authored,
    accounts: authored.accounts ?? snapshot.accounts ?? [],
    accountActivity: authored.accountActivity ?? [],
  };
}

function buildDirection(future) {
  const raw = Array.isArray(future.direction) ? future.direction : (future.goals ?? []);
  return raw
    .map((item, index) => {
      if (typeof item === 'string') {
        const text = item.trim();
        return text ? { id: `direction-${index}`, text } : null;
      }
      if (!item || typeof item !== 'object') return null;
      const text = item.directionText?.trim() || item.priority?.trim() || item.text?.trim() || '';
      return text ? { id: item.id ?? `direction-${index}`, text } : null;
    })
    .filter(Boolean);
}

function buildComingUp(future) {
  const upcoming = future.upcoming ?? future.upcomingExpenses ?? [];
  return upcoming.filter((item) => item && typeof item === 'object' && item.title?.trim());
}

function buildDiscussionPrompts(sourceData, goals) {
  const prompts = [];
  const emergency = sourceData.snapshot?.emergencyFund ?? {};
  const targetNum = parseAmount(emergency.target);
  const strategyText = `${emergency.strategy ?? ''} ${emergency.context ?? ''}`.toLowerCase();

  if (targetNum === 1000 && (/pause|debt|priority/i.test(strategyText) || emergency.strategy?.trim() || emergency.context?.trim())) {
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

export function enrichFuture(sourceData, meta) {
  const future = sourceData.future ?? {};
  const futureProgress = buildFutureProgress(sourceData);
  const goals = buildGoals(sourceData);

  return {
    subtitle: 'Debt, emergency savings, family savings, retirement, and what future-us needs next.',
    futureProgress,
    summary: buildSummary(sourceData, futureProgress),
    goals,
    debt: buildDetailedDebt(sourceData),
    debtPayoffPlan: buildDebtPayoffPlan(sourceData),
    emergencyFund: buildEmergencyFund(sourceData),
    savings: buildSavings(sourceData),
    retirement: buildRetirement(sourceData),
    direction: buildDirection(future),
    comingUp: buildComingUp(future),
    discussionPrompts: buildDiscussionPrompts(sourceData, goals),
    atAGlanceLabel: 'Future at a Glance',
    directionLabel: 'Where We’re Headed',
    comingUpLabel: 'Coming Up',
    talkTogetherLabel: 'Talk About Together',
  };
}
