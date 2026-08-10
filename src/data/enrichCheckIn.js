import { CHECK_IN_STALE_MS } from '../constants/financialCheckIn.js';
import {
  buildDailySpendBars,
  buildStackedComposition,
  parseCheckInAmount,
  progressPercent,
  sumAccountsByClassification,
  sumAmounts,
} from './checkInVisualHelpers.js';

function parseAmount(value) {
  return parseCheckInAmount(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function displayAmount(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return formatCurrency(value);
  const parsed = parseAmount(value);
  return parsed != null ? formatCurrency(parsed) : String(value);
}

function formatRefreshedAt(refreshedAt) {
  if (!refreshedAt) return null;
  const date = new Date(refreshedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function isStale(refreshedAt) {
  if (!refreshedAt) return false;
  const date = new Date(refreshedAt);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > CHECK_IN_STALE_MS;
}

function classifyAccounts(accounts = []) {
  return accounts.map((account) => ({
    ...account,
    balanceLabel: displayAmount(account.balance),
    classificationLabel:
      account.classification === 'available'
        ? 'Available'
        : account.classification === 'protected'
          ? 'Protected'
          : account.classification === 'neutral'
            ? 'Neutral'
            : account.purpose || 'Account',
  }));
}

function enrichCashVisuals(cash) {
  const connected = parseAmount(cash.connectedTotal);
  const available = parseAmount(cash.availableTotal);
  const protectedAmount = parseAmount(cash.protectedTotal);
  let neutral = sumAccountsByClassification(cash.accounts, 'neutral');

  if (neutral === 0 && connected != null && available != null && protectedAmount != null) {
    const remainder = connected - available - protectedAmount;
    if (remainder > 0.01) neutral = remainder;
  }

  const composition = buildStackedComposition(
    [
      { key: 'available', label: 'Available', value: available, tone: 'green' },
      { key: 'protected', label: 'Protected', value: protectedAmount, tone: 'yellow' },
      { key: 'neutral', label: 'Neutral', value: neutral > 0 ? neutral : null, tone: 'slate' },
    ].map((segment) => ({
      ...segment,
      valueLabel: displayAmount(segment.value),
    })),
    connected,
  );

  return composition;
}

function enrichBills(bills) {
  if (!bills) return null;
  const gap = parseAmount(bills.fundingGap);
  const requiredTotal = parseAmount(bills.requiredTotal);
  const fundedAmount =
    requiredTotal != null && gap != null ? Math.max(0, requiredTotal - gap) : null;
  const fundedPercent = progressPercent(fundedAmount, requiredTotal);

  const fundingStatus =
    gap == null
      ? null
      : gap <= 0
        ? 'Fully funded'
        : `${displayAmount(gap)} still needed`;

  return {
    ...bills,
    balanceLabel: displayAmount(bills.balance),
    requiredTotalLabel: displayAmount(bills.requiredTotal),
    fundingGapLabel: displayAmount(bills.fundingGap),
    fundedAmountLabel: displayAmount(fundedAmount),
    fundedPercent,
    fundingStatus,
    isFullyFunded: gap != null && gap <= 0,
    buckets: (bills.buckets ?? []).map((bucket) => {
      const current = parseAmount(bucket.current);
      const target = parseAmount(bucket.target);
      const bucketPercent = progressPercent(current, target);
      return {
        ...bucket,
        currentLabel: displayAmount(bucket.current),
        targetLabel: displayAmount(bucket.target),
        progressPercent: bucketPercent,
        statusLabel: bucket.funded ? 'Funded' : 'Short',
        statusClass: bucket.funded ? 'is-funded' : 'is-short',
        progressTone: bucket.funded ? 'green' : 'coral',
      };
    }),
    fundedSummary:
      bills.fundedCount != null && bills.requiredCount != null
        ? `${bills.fundedCount} of ${bills.requiredCount} required buckets funded`
        : null,
    fundingProgressLabel:
      fundedPercent != null ? `${fundedPercent}% funded` : null,
    fundingAriaLabel:
      fundedPercent != null && requiredTotal != null
        ? `Bills funding ${fundedPercent}% of ${displayAmount(requiredTotal)} required`
        : null,
  };
}

function enrichEmergencyFund(emergencyFund) {
  if (!emergencyFund) return null;
  const balance = parseAmount(emergencyFund.balance);
  const target = parseAmount(emergencyFund.target);
  const gap = parseAmount(emergencyFund.gap);
  let progressPercent = null;
  if (balance != null && target != null && target > 0) {
    progressPercent = Math.min(100, Math.round((balance / target) * 100));
  }

  return {
    ...emergencyFund,
    balanceLabel: displayAmount(emergencyFund.balance),
    targetLabel: displayAmount(emergencyFund.target),
    gapLabel: displayAmount(emergencyFund.gap ?? (balance != null && target != null ? Math.max(0, target - balance) : null)),
    progressPercent,
  };
}

function enrichKidsSavings(kidsSavings) {
  if (!kidsSavings) return null;
  const total = parseAmount(kidsSavings.total) ?? sumAmounts(kidsSavings.accounts);
  const accounts = (kidsSavings.accounts ?? []).map((account) => {
    const balance = parseAmount(account.balance);
    const sharePercent = progressPercent(balance, total);
    return {
      ...account,
      balanceLabel: displayAmount(account.balance),
      sharePercent,
      target: parseAmount(account.target),
      targetLabel: account.target != null ? displayAmount(account.target) : null,
      progressPercent: account.target != null
        ? progressPercent(balance, parseAmount(account.target))
        : sharePercent,
      barTone: account.target != null ? 'teal' : 'purple',
      barMode: account.target != null ? 'target' : 'share',
    };
  });

  return {
    ...kidsSavings,
    totalLabel: displayAmount(kidsSavings.total ?? total),
    accounts,
  };
}

function normalizeDebtItems(items = []) {
  return items.map((item) => ({
    name: item.name,
    amount: displayAmount(item.amount ?? item.balance) ?? '—',
  }));
}

function enrichCreditCards(creditCards = []) {
  return creditCards.map((item) => {
    const balance = parseAmount(item.amount ?? item.balance);
    const limit = parseAmount(item.limit ?? item.creditLimit);
    const utilizationPercent = progressPercent(balance, limit);
    return {
      name: item.name,
      amount: displayAmount(item.amount ?? item.balance) ?? '—',
      balanceLabel: displayAmount(balance),
      limitLabel: displayAmount(limit),
      utilizationPercent,
      balance,
      limit,
    };
  });
}

function enrichDebt(debt) {
  if (!debt) return null;
  const creditCards = enrichCreditCards(debt.creditCards);
  const loans = normalizeDebtItems(debt.loans);

  let cardsTotal = parseAmount(debt.creditCardsTotal);
  let loansTotal = parseAmount(debt.loansTotal);
  if (cardsTotal == null) cardsTotal = sumAmounts(debt.creditCards) || null;
  if (loansTotal == null) loansTotal = sumAmounts(debt.loans) || null;

  const total = parseAmount(debt.total) ?? (
    cardsTotal != null && loansTotal != null ? cardsTotal + loansTotal : null
  );

  const composition = buildStackedComposition(
    [
      { key: 'cards', label: 'Credit cards', value: cardsTotal, tone: 'coral' },
      { key: 'loans', label: 'Loans', value: loansTotal, tone: 'blue' },
    ].map((segment) => ({
      ...segment,
      valueLabel: displayAmount(segment.value),
    })),
    total,
  );

  return {
    ...debt,
    creditCards,
    loans,
    totalLabel: displayAmount(debt.total ?? total),
    creditCardsTotalLabel: displayAmount(debt.creditCardsTotal ?? cardsTotal),
    loansTotalLabel: displayAmount(debt.loansTotal ?? loansTotal),
    composition,
  };
}

function enrichNetWorthVisuals(netWorth, debt) {
  const connected = parseAmount(netWorth?.connected);
  const debtTotal = parseAmount(debt?.total);
  if (connected == null || debtTotal == null) return null;

  const netEquity = Math.max(0, connected);
  const composition = buildStackedComposition(
    [
      { key: 'debt', label: 'Connected debt', value: debtTotal, tone: 'coral' },
      { key: 'equity', label: 'Net equity', value: netEquity, tone: 'teal' },
    ].map((segment) => ({
      ...segment,
      valueLabel: displayAmount(segment.value),
    })),
    debtTotal + netEquity,
  );

  return composition;
}

function enrichRecentActivity(recentActivity) {
  if (!recentActivity) return null;
  const dailyBars = buildDailySpendBars(
    recentActivity.dailySpend
      ?? recentActivity.sevenDayDaily
      ?? recentActivity.daily
      ?? [],
  );

  return {
    ...recentActivity,
    sevenDaySpendLabel: displayAmount(recentActivity.sevenDaySpend),
    items: recentActivity.items ?? [],
    dailyBars: dailyBars?.map((bar) => ({
      ...bar,
      valueLabel: displayAmount(bar.value),
    })) ?? null,
  };
}

function buildKpis(snapshot) {
  const items = [];

  if (snapshot.cash?.connectedTotal != null) {
    items.push({
      icon: '💵',
      label: 'Connected cash',
      value: displayAmount(snapshot.cash.connectedTotal),
      chip: { text: 'All accounts', tone: 'blue' },
    });
  }

  if (snapshot.cash?.availableTotal != null) {
    items.push({
      icon: '✅',
      label: 'Available cash',
      value: displayAmount(snapshot.cash.availableTotal),
      chip: { text: 'May spend', tone: 'green' },
    });
  }

  if (snapshot.cash?.protectedTotal != null) {
    items.push({
      icon: '🔒',
      label: 'Protected cash',
      value: displayAmount(snapshot.cash.protectedTotal),
      chip: { text: 'Committed', tone: 'yellow' },
    });
  }

  if (snapshot.netWorth?.connected != null) {
    items.push({
      icon: '📈',
      label: 'Connected net worth',
      value: displayAmount(snapshot.netWorth.connected),
      chip: { text: 'Household', tone: 'purple' },
    });
  }

  return items;
}

/** Derives Financial Check-In presentation data from the latest saved snapshot. */
export function enrichCheckIn(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null;

  const stale = isStale(snapshot.refreshedAt);
  const refreshedLabel = formatRefreshedAt(snapshot.refreshedAt);

  return {
    raw: snapshot,
    stale,
    refreshedLabel,
    statusLabel: snapshot.status?.trim() || null,
    kpis: buildKpis(snapshot),
    cash: snapshot.cash
      ? {
          ...snapshot.cash,
          connectedTotalLabel: displayAmount(snapshot.cash.connectedTotal),
          availableTotalLabel: displayAmount(snapshot.cash.availableTotal),
          protectedTotalLabel: displayAmount(snapshot.cash.protectedTotal),
          accounts: classifyAccounts(snapshot.cash.accounts),
          availableAccounts: classifyAccounts(
            (snapshot.cash.accounts ?? []).filter((a) => a.classification === 'available'),
          ),
          protectedAccounts: classifyAccounts(
            (snapshot.cash.accounts ?? []).filter((a) => a.classification === 'protected'),
          ),
          composition: enrichCashVisuals(snapshot.cash),
        }
      : null,
    bills: enrichBills(snapshot.bills),
    kidsSavings: enrichKidsSavings(snapshot.kidsSavings),
    emergencyFund: enrichEmergencyFund(snapshot.emergencyFund),
    debt: enrichDebt(snapshot.debt),
    retirement: snapshot.retirement
      ? {
          ...snapshot.retirement,
          totalLabel: displayAmount(snapshot.retirement.total),
          protectionLabel: 'Protected long-term',
        }
      : null,
    netWorth: snapshot.netWorth
      ? {
          ...snapshot.netWorth,
          connectedLabel: displayAmount(snapshot.netWorth.connected),
          composition: enrichNetWorthVisuals(snapshot.netWorth, snapshot.debt),
        }
      : null,
    recentActivity: enrichRecentActivity(snapshot.recentActivity),
  };
}

export function buildCheckInPrompt(question, enriched) {
  const trimmed = question.trim();
  const lines = [
    trimmed || '(Add your question here)',
    '',
    'Review our latest financial situation using current Finances data. Do not rely only on the saved Family Ledger snapshot. Re-check connected balances, recent spending, upcoming obligations, protected Bills funding, emergency savings, protected kids\' money, and debt before answering.',
  ];

  if (enriched?.refreshedLabel) {
    lines.push('', `Latest saved check-in refreshed: ${enriched.refreshedLabel}${enriched.stale ? ' (may be stale)' : ''}.`);
  }

  if (enriched?.cash?.availableTotalLabel) {
    lines.push(`Available household cash in saved snapshot: ${enriched.cash.availableTotalLabel}.`);
  }
  if (enriched?.cash?.protectedTotalLabel) {
    lines.push(`Protected / committed cash in saved snapshot: ${enriched.cash.protectedTotalLabel}.`);
  }
  if (enriched?.bills?.fundingStatus) {
    lines.push(`Bills funding status in saved snapshot: ${enriched.bills.fundingStatus}.`);
  }
  if (enriched?.debt?.totalLabel) {
    lines.push(`Total connected debt in saved snapshot: ${enriched.debt.totalLabel}.`);
  }

  return lines.join('\n');
}
