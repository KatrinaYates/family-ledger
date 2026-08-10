import { CHECK_IN_STALE_MS } from '../constants/financialCheckIn.js';

function parseAmount(value) {
  if (value == null || value === '') return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
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

function enrichBills(bills) {
  if (!bills) return null;
  const gap = parseAmount(bills.fundingGap);
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
    fundingStatus,
    isFullyFunded: gap != null && gap <= 0,
    buckets: (bills.buckets ?? []).map((bucket) => ({
      ...bucket,
      currentLabel: displayAmount(bucket.current),
      targetLabel: displayAmount(bucket.target),
    })),
    fundedSummary:
      bills.fundedCount != null && bills.requiredCount != null
        ? `${bills.fundedCount} of ${bills.requiredCount} required buckets funded`
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
  return {
    ...kidsSavings,
    totalLabel: displayAmount(kidsSavings.total),
    accounts: (kidsSavings.accounts ?? []).map((account) => ({
      ...account,
      balanceLabel: displayAmount(account.balance),
    })),
  };
}

function normalizeDebtItems(items = []) {
  return items.map((item) => ({
    name: item.name,
    amount: displayAmount(item.amount ?? item.balance) ?? '—',
  }));
}

function enrichDebt(debt) {
  if (!debt) return null;
  return {
    ...debt,
    creditCards: normalizeDebtItems(debt.creditCards),
    loans: normalizeDebtItems(debt.loans),
    totalLabel: displayAmount(debt.total),
    creditCardsTotalLabel: displayAmount(debt.creditCardsTotal),
    loansTotalLabel: displayAmount(debt.loansTotal),
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
        }
      : null,
    recentActivity: snapshot.recentActivity
      ? {
          ...snapshot.recentActivity,
          sevenDaySpendLabel: displayAmount(snapshot.recentActivity.sevenDaySpend),
          items: snapshot.recentActivity.items ?? [],
        }
      : null,
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
