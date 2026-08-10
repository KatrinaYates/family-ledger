import { getComparisonMonthLabels } from '../utils/monthLabels.js';

/** @param {string | number | null | undefined} value */
export function parseAmount(value) {
  if (value == null || value === '—' || value === '') return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** @param {number | null} amount */
export function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** @param {number | null} amount @param {boolean} [withCents] */
export function formatCurrencyDetailed(amount, withCents = false) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** @param {number | null} amount */
export function formatSignedChange(amount) {
  if (amount == null) return '—';
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(amount))}`;
}

/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

/** @param {string | undefined} value */
function parseChangePercent(value) {
  if (!value || value === '—') return null;
  return parseAmount(String(value).replace('%', ''));
}

/** @param {number | null} value */
function formatChangePercent(value) {
  if (value == null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * @param {number | null} changePercent
 * @param {number | null} changeAmount
 * @param {number | null} priorTotal
 * @param {number | null} currentTotal
 */
function changeDirection(changePercent, changeAmount, priorTotal, currentTotal) {
  if (changePercent != null) {
    if (changePercent < -0.5) return 'down';
    if (changePercent > 0.5) return 'up';
    return 'stable';
  }
  if (changeAmount != null) {
    if (changeAmount < -0.5) return 'down';
    if (changeAmount > 0.5) return 'up';
    return 'stable';
  }
  if (priorTotal != null && currentTotal != null && priorTotal > 0) {
    const pct = ((currentTotal - priorTotal) / priorTotal) * 100;
    if (pct < -1) return 'down';
    if (pct > 1) return 'up';
    return 'stable';
  }
  return 'unknown';
}

/** @param {number | null | undefined} totalSpend */
function meaningfulChangeThreshold(totalSpend) {
  if (totalSpend && totalSpend > 0) return Math.max(50, totalSpend * 0.03);
  return 50;
}

/** @param {number | null} changeAmount @param {number | null} priorTotal */
function isTotalChangeMaterial(changeAmount, priorTotal) {
  if (changeAmount == null) return false;
  const threshold = meaningfulChangeThreshold(priorTotal ?? Math.abs(changeAmount));
  return Math.abs(changeAmount) >= threshold;
}

/** @param {string} text */
function isPlaceholderReason(text) {
  const lower = text.toLowerCase();
  return lower.includes('lorem') || lower.includes('placeholder') || lower.includes('sample');
}

/** @param {Array<{ name?: string, amount?: string }>} topCategories @param {number | null} totalSpend */
function buildCategoryBars(topCategories, totalSpend) {
  const parsed = (topCategories ?? [])
    .map((cat) => ({
      name: cat.name ?? 'Category',
      amount: cat.amount ?? '—',
      amountNum: parseAmount(cat.amount) ?? 0,
    }))
    .filter((cat) => cat.name && cat.amountNum > 0)
    .sort((a, b) => b.amountNum - a.amountNum);

  const categorySum = parsed.reduce((sum, cat) => sum + cat.amountNum, 0);
  const denominator = totalSpend && totalSpend > 0 ? totalSpend : categorySum;
  const canPercent = denominator > 0;

  const top = parsed.slice(0, 5);
  const rest = parsed.slice(5);
  const otherAmount = rest.reduce((sum, cat) => sum + cat.amountNum, 0);

  const items = top.map((cat) => ({
    ...cat,
    percent: canPercent ? Math.round((cat.amountNum / denominator) * 100) : null,
    barWidth: canPercent ? Math.max(4, Math.round((cat.amountNum / denominator) * 100)) : null,
  }));

  if (otherAmount > 0) {
    items.push({
      name: 'Other',
      amount: formatCurrency(otherAmount),
      amountNum: otherAmount,
      percent: canPercent ? Math.round((otherAmount / denominator) * 100) : null,
      barWidth: canPercent ? Math.max(4, Math.round((otherAmount / denominator) * 100)) : null,
    });
  }

  return {
    items,
    canPercent,
    hasItems: items.length > 0,
    emptyMessage: 'Category breakdown is not available for this month yet.',
  };
}

/** @param {object} row */
function parseCategoryChange(row) {
  const fromField = parseAmount(row.change);
  if (fromField != null) return fromField;
  const prior = parseAmount(row.prior);
  const current = parseAmount(row.current);
  if (prior != null && current != null) return current - prior;
  return null;
}

/**
 * @param {Array<object>} changes
 * @param {number | null} totalSpend
 * @param {number | null} priorSpend
 * @param {number | null} totalChangeAmount
 * @param {string} priorLabel
 */
function buildWhatChanged(changes, totalSpend, priorSpend, totalChangeAmount, priorLabel) {
  const threshold = meaningfulChangeThreshold(priorSpend ?? totalSpend);
  const totalMaterial = isTotalChangeMaterial(totalChangeAmount, priorSpend);

  const rows = (changes ?? [])
    .map((row) => {
      const delta = parseCategoryChange(row);
      const reason = row.reason?.trim() || '';
      return {
        category: row.category ?? 'Category',
        change: delta,
        changeLabel: row.change ?? (delta != null ? formatSignedChange(delta) : '—'),
        reason: isPlaceholderReason(reason) ? '' : reason,
        prior: row.prior,
        current: row.current,
      };
    })
    .filter((row) => {
      if (row.change == null) return false;
      if (Math.abs(row.change) >= threshold) return true;
      if (row.reason && !totalMaterial) return true;
      return false;
    })
    .sort((a, b) => Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0));

  const increased = rows.filter((row) => (row.change ?? 0) > 0).slice(0, 4);
  const decreased = rows.filter((row) => (row.change ?? 0) < 0).slice(0, 4);

  let emptyMessage = 'Spending by category was broadly consistent with last month.';
  if (totalMaterial && !increased.length && !decreased.length) {
    emptyMessage = 'Total spending changed materially, but category-level detail is limited for this month.';
  } else if (totalMaterial && (increased.length || decreased.length)) {
    emptyMessage = '';
  }

  return {
    priorLabel,
    title: priorLabel ? `What Changed From ${priorLabel}` : 'What Changed',
    increased,
    decreased,
    hasChanges: increased.length > 0 || decreased.length > 0,
    emptyMessage,
    totalMaterial,
  };
}

/** @param {number | null} changePercent @param {string} direction */
function intensityPhrase(changePercent, direction) {
  if (direction === 'stable') return 'was broadly stable';
  const abs = changePercent != null ? Math.abs(changePercent) : null;
  if (abs == null) return direction === 'up' ? 'was higher' : 'was lower';
  if (abs >= 25) return direction === 'up' ? 'was significantly higher' : 'was significantly lower';
  if (abs >= 10) return direction === 'up' ? 'was notably higher' : 'was notably lower';
  if (abs >= 5) return direction === 'up' ? 'was moderately higher' : 'was moderately lower';
  return direction === 'up' ? 'was slightly higher' : 'was slightly lower';
}

/**
 * @param {object} spending
 * @param {object} whatChanged
 * @param {string} direction
 * @param {string} priorLabel
 * @param {string} currentLabel
 * @param {number | null} changePercent
 */
function buildOverviewInterpretation(spending, whatChanged, direction, priorLabel, currentLabel, changePercent) {
  if (spending.pulseInsight?.trim()) return spending.pulseInsight.trim();

  const drivers = [...whatChanged.increased, ...whatChanged.decreased]
    .sort((a, b) => Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0))
    .slice(0, 4)
    .map((row) => row.category.toLowerCase());

  const label = currentLabel || monthLabel(undefined);
  const prior = priorLabel || 'the prior month';
  const intensity = intensityPhrase(changePercent, direction);

  if (direction === 'stable' && !drivers.length) {
    return `${label} spending ${intensity} compared with ${prior}.`;
  }

  if (drivers.length && direction === 'up') {
    return `${label} spending ${intensity} than ${prior}, driven mainly by ${drivers.slice(0, 3).join(', ')}${drivers.length > 3 ? ', and others' : ''}.`;
  }

  if (drivers.length && direction === 'down') {
    return `${label} spending ${intensity} than ${prior}, with ${drivers.slice(0, 3).join(', ')} contributing most of the decrease.`;
  }

  if (whatChanged.totalMaterial && !drivers.length) {
    return `${label} spending ${intensity} than ${prior}, but category-level drivers are not fully available.`;
  }

  if (direction === 'up') {
    return `${label} spending ${intensity} than ${prior}.`;
  }
  if (direction === 'down') {
    return `${label} spending ${intensity} than ${prior}.`;
  }

  return `${label} spending ${intensity} compared with ${prior}.`;
}

/** @param {object} spending @param {Array<object>} changes */
function buildPatternItems(spending) {
  /** @type {Array<{ id: string, title?: string, detail?: string, support?: string, fallbackLine?: string }>} */
  const items = [];
  const seen = new Set();

  const addItem = (item) => {
    const key = item.title?.trim() || item.fallbackLine?.trim() || '';
    if (!key || seen.has(key.toLowerCase())) return;
    seen.add(key.toLowerCase());
    items.push(item);
  };

  for (const [index, pattern] of (spending.patterns ?? []).entries()) {
    if (pattern?.title?.trim()) {
      addItem({
        id: pattern.id ?? `pattern-${index}`,
        title: pattern.title.trim(),
        detail: pattern.detail?.trim() || '',
        support: pattern.support?.trim() || '',
      });
      continue;
    }
    if (pattern?.support?.trim()) {
      addItem({ id: pattern.id ?? `pattern-${index}`, fallbackLine: pattern.support.trim() });
    } else if (pattern?.detail?.trim()) {
      addItem({ id: pattern.id ?? `pattern-${index}`, fallbackLine: pattern.detail.trim() });
    }
  }

  for (const [index, merchant] of (spending.merchants ?? []).entries()) {
    const title = merchant.title?.trim() || merchant.name?.trim();
    if (!title) continue;

    const detail = merchant.detail?.trim() || '';
    const support = merchant.support?.trim() || '';
    const note = merchant.note?.trim() || '';

    if (!detail && !support && !note) continue;

    addItem({
      id: merchant.id ?? `merchant-${index}`,
      title,
      detail: detail || (support && note ? support : ''),
      support: support && note ? note : (note && !detail ? note : support),
    });
  }

  if (items.length < 2) {
    const history = spending.categoryHistory ?? {};
    for (const [category, amounts] of Object.entries(history)) {
      if (!Array.isArray(amounts) || amounts.length < 3 || items.length >= 3) continue;
      const nums = amounts.map(parseAmount).filter((n) => n != null);
      if (nums.length < 3) continue;
      const lastThree = nums.slice(-3);
      if (lastThree[0] < lastThree[1] && lastThree[1] < lastThree[2]) {
        addItem({
          id: `history-${category}`,
          title: `${category} frequency kept climbing`,
          detail: `${formatCurrency(lastThree[2])} this month`,
          support: `${formatCurrency(lastThree[1])} prior month · ${formatCurrency(lastThree[0])} two months ago`,
        });
      }
    }
  }

  if (items.length < 2) {
    const history = spending.categoryHistory ?? {};
    for (const [category, amounts] of Object.entries(history)) {
      if (!Array.isArray(amounts) || amounts.length < 2 || items.length >= 3) continue;
      const nums = amounts.map(parseAmount).filter((n) => n != null);
      if (nums.length < 2) continue;
      const current = nums[nums.length - 1];
      const priorMonths = nums.slice(0, -1);
      const average = priorMonths.reduce((sum, n) => sum + n, 0) / priorMonths.length;
      if (average <= 0) continue;
      const diff = current - average;
      const threshold = meaningfulChangeThreshold(current);
      if (diff >= threshold && diff / average >= 0.15) {
        addItem({
          id: `norm-${category}`,
          title: `${category} ran above recent norm`,
          detail: `${formatCurrency(current)} this month`,
          support: `Recent average ${formatCurrency(average)}`,
        });
      }
    }
  }

  return items.slice(0, 3);
}

/** @param {object} spending */
function collectRecurringMerchantNames(spending) {
  const names = new Set();
  const raw = spending.recurring;
  if (!raw || typeof raw !== 'object') return names;

  const lists = [
    raw.newCharges,
    raw.priceChanges,
    raw.reviewGroups,
    raw.canceled,
    raw.allCharges,
    raw.charges,
  ];

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const name = entry?.name ?? entry?.merchant ?? entry?.label;
      if (name) names.add(String(name).toLowerCase());
    }
  }

  return names;
}

/** @param {object} entry */
function deriveWatchReason(entry) {
  if (entry.reason?.trim()) return entry.reason.trim();

  if (entry.isNew || entry.firstSeen) {
    return 'First time seeing this merchant recently.';
  }
  if (entry.isDuplicate) {
    return 'Duplicate-looking charge this month.';
  }
  if (entry.priceIncrease) {
    return 'Price increased compared with recent charges.';
  }
  if (entry.vsRecentNorm?.trim()) {
    return entry.vsRecentNorm.trim();
  }
  if (entry.category && entry.isUnusuallyLarge) {
    return `Unusually large ${entry.category} purchase compared with recent months.`;
  }
  if (entry.isUnusuallyLarge) {
    return 'Unusually large purchase compared with recent months.';
  }
  if (entry.note?.trim()) {
    return entry.note.trim();
  }

  return '';
}

/** @param {object} spending */
function buildReviewItems(spending) {
  /** @type {Array<{ id: string, name: string, amount: string | null, reason: string, isOneTime?: boolean, category?: string }>} */
  const items = [];

  if (Array.isArray(spending.watchList)) {
    for (const [index, entry] of spending.watchList.entries()) {
      const reason = deriveWatchReason(entry);
      if (!reason) continue;
      items.push({
        id: entry.id ?? `watch-${index}`,
        name: entry.name ?? entry.merchant ?? 'Item',
        amount: entry.amount ?? null,
        reason,
        isOneTime: Boolean(entry.isOneTime),
        category: entry.category ?? null,
      });
    }
  }

  return items.slice(0, 8);
}

/** @param {object} spending */
function buildRecurringWatch(spending) {
  const raw = spending.recurring;
  if (!raw || typeof raw !== 'object') return null;

  const hasContent =
    raw.monthlyTotal
    || raw.chargeCount
    || (raw.newCharges?.length ?? 0) > 0
    || (raw.priceChanges?.length ?? 0) > 0
    || (raw.reviewGroups?.length ?? 0) > 0
    || (raw.canceled?.length ?? 0) > 0
    || (raw.allCharges?.length ?? 0) > 0
    || (raw.charges?.length ?? 0) > 0;

  if (!hasContent) return null;

  const changes = [];
  for (const charge of raw.newCharges ?? []) {
    if (charge?.name) changes.push({ label: `${charge.name} (new)`, amount: charge.amount ?? null });
  }
  for (const charge of raw.priceChanges ?? []) {
    if (charge?.name) {
      changes.push({
        label: charge.name,
        amount: charge.prior && charge.current ? `${charge.prior} → ${charge.current}` : charge.current ?? null,
      });
    }
  }
  for (const charge of raw.canceled ?? []) {
    if (charge?.name) changes.push({ label: `${charge.name} (canceled)`, amount: charge.amount ?? null });
  }

  const allCharges = raw.allCharges ?? raw.charges ?? [];
  const viewAllCount = raw.chargeCount ?? (Array.isArray(allCharges) ? allCharges.length : null);

  const hasChanges = changes.length > 0 || (raw.reviewGroups?.length ?? 0) > 0;

  const summaryParts = [];
  if (raw.monthlyTotal) summaryParts.push(raw.monthlyTotal);
  if (viewAllCount) summaryParts.push(`${viewAllCount} recurring charge${viewAllCount === 1 ? '' : 's'}`);

  return {
    summary: summaryParts.join(' · ') || null,
    changes,
    reviewGroups: raw.reviewGroups ?? [],
    allCharges,
    viewAllCount,
    stable: !hasChanges,
    stableMessage: 'Recurring charges were stable this month.',
  };
}

/** @param {object} spending */
function buildFeesWatch(spending) {
  const raw = spending.fees;
  if (!raw) return null;

  const items = (raw.items ?? []).filter((item) => item?.name && parseAmount(item.amount));
  const totalNum = parseAmount(raw.total) ?? items.reduce((sum, item) => sum + (parseAmount(item.amount) ?? 0), 0);

  if (!items.length && (!totalNum || totalNum <= 0)) {
    return { status: 'ok', total: null, items: [], okMessage: 'No avoidable fees detected.' };
  }

  return {
    status: 'found',
    total: raw.total ?? formatCurrency(totalNum),
    items,
    okMessage: null,
  };
}

/**
 * @param {object} spending
 * @param {Array<object>} changes
 */
function buildSpendingWatch(spending, changes) {
  const patternItems = buildPatternItems(spending);
  const recurring = buildRecurringWatch(spending);
  const fees = buildFeesWatch(spending);
  const review = buildReviewItems(spending);

  return {
    patterns: {
      status: patternItems.length ? 'alert' : 'ok',
      items: patternItems,
      okMessage: 'No unusual spending patterns detected.',
    },
    recurring,
    fees,
    review: {
      items: review,
      hasItems: review.length > 0,
    },
  };
}

const OBLIGATION_CATEGORIES = new Set([
  'mortgage',
  'housing',
  'rent',
  'utilities',
  'utility',
  'insurance',
  'loan payment',
  'debt payment',
  'subscription',
  'subscriptions',
]);

/** @param {object} purchase @param {Set<string>} recurringMerchants */
function isRecurringObligation(purchase, recurringMerchants) {
  if (purchase.excludeFromNotable === true) return true;
  if (purchase.isRecurring === true) return true;

  const type = String(purchase.type ?? purchase.transactionType ?? '').toLowerCase();
  if (type === 'recurring' || type === 'subscription' || type === 'bill') return true;

  const category = String(purchase.category ?? '').toLowerCase();
  if (category && OBLIGATION_CATEGORIES.has(category)) return true;
  for (const obligation of OBLIGATION_CATEGORIES) {
    if (category.includes(obligation)) return true;
  }

  const name = String(purchase.name ?? purchase.merchant ?? purchase.title ?? '').toLowerCase();
  if (recurringMerchants.has(name)) return true;

  if (!purchase.isOneTime && !purchase.category && !purchase.type) {
    if (/\bmortgage\b/.test(name) || /\bpennymac\b/.test(name) || /\brent\b/.test(name)) {
      return true;
    }
  }

  return false;
}

/** @param {string} name @param {string | null | undefined} amount */
function itemKey(name, amount) {
  return `${String(name).toLowerCase()}|${parseAmount(amount) ?? ''}`;
}

/** @param {object} purchase */
function buildNotableMetadata(purchase) {
  /** @type {string[]} */
  const parts = [];
  if (purchase.firstSeen || purchase.isNew) parts.push('First seen this quarter');
  if (purchase.chargeCount) {
    parts.push(`${purchase.chargeCount} ${purchase.chargeCount === 1 ? 'charge' : 'charges'}`);
  }
  if (purchase.frequencyNote?.trim()) parts.push(purchase.frequencyNote.trim());
  return parts.length ? parts.join(' · ') : null;
}

/** @param {object} spending @param {number | null} totalSpend @param {Set<string>} recurringMerchants */
function buildNotableSpending(spending, totalSpend, recurringMerchants) {
  const raw = spending.notableSpending ?? spending.notablePurchases ?? spending.bigPurchases ?? [];
  const threshold = totalSpend ? Math.max(200, totalSpend * 0.05) : 200;

  const items = raw
    .map((purchase, index) => {
      const name = purchase.name ?? purchase.merchant ?? purchase.title ?? 'Purchase';
      const amount = purchase.amount ?? purchase.total;
      const amountNum = parseAmount(amount);
      return {
        id: purchase.id ?? `notable-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${index}`,
        name,
        amount: amount ?? (amountNum != null ? formatCurrencyDetailed(amountNum, true) : '—'),
        amountNum,
        category: purchase.category ?? null,
        context: purchase.note?.trim() || purchase.context?.trim() || purchase.reason?.trim() || '',
        metadata: buildNotableMetadata(purchase),
        isOneTime: Boolean(purchase.isOneTime),
        isKnownOneTime: Boolean(purchase.isOneTime || purchase.category),
      };
    })
    .filter((purchase) => !isRecurringObligation(purchase, recurringMerchants))
    .filter((purchase) => purchase.amountNum == null || purchase.amountNum >= threshold * 0.5)
    .slice(0, 8);

  return {
    items,
    hasItems: items.length > 0,
    emptyMessage: 'No notable one-time spending stood out this month.',
  };
}

/**
 * @param {Array<object>} reviewItems
 * @param {Array<object>} notableItems
 */
function dedupeReviewAndNotable(reviewItems, notableItems) {
  const notableKeys = new Set(notableItems.map((item) => itemKey(item.name, item.amount)));
  const reviewKeys = new Set();

  const filteredReview = reviewItems.filter((item) => {
    const key = itemKey(item.name, item.amount);
    if (notableKeys.has(key)) return false;
    if (item.isOneTime) return false;
    reviewKeys.add(key);
    return true;
  });

  const filteredNotable = notableItems.filter((item) => {
    const key = itemKey(item.name, item.amount);
    if (reviewKeys.has(key) && !item.isKnownOneTime) return false;
    return true;
  });

  return { review: filteredReview, notable: filteredNotable };
}

/**
 * @param {object} spending
 * @param {object | undefined} meta
 * @param {string} currentLabel
 * @param {string} priorLabel
 */
function buildOverview(spending, meta, currentLabel, priorLabel) {
  const totalSpend = parseAmount(spending.total);
  const priorSpend = parseAmount(spending.priorMonth);
  let changeAmountNum = parseAmount(spending.change);
  if (changeAmountNum == null && totalSpend != null && priorSpend != null) {
    changeAmountNum = totalSpend - priorSpend;
  }
  let changePercentNum = parseChangePercent(spending.changePercent);
  if (changePercentNum == null && changeAmountNum != null && priorSpend && priorSpend > 0) {
    changePercentNum = (changeAmountNum / priorSpend) * 100;
  }

  const direction = changeDirection(changePercentNum, changeAmountNum, priorSpend, totalSpend);

  const changes = spending.changes ?? spending.momChanges ?? [];
  const whatChanged = buildWhatChanged(changes, totalSpend, priorSpend, changeAmountNum, priorLabel);

  const useCents = (totalSpend != null && totalSpend < 10000) || (priorSpend != null && priorSpend < 10000);
  const formatTotal = (n) => (n != null ? formatCurrencyDetailed(n, useCents) : spending.total ?? '—');

  return {
    overview: {
      currentLabel: `${currentLabel} Spending`,
      currentTotal: totalSpend != null ? formatTotal(totalSpend) : (spending.total ?? '—'),
      priorLabel: `${priorLabel} Spending`,
      priorTotal: priorSpend != null ? formatTotal(priorSpend) : (spending.priorMonth ?? '—'),
      changeAmount: changeAmountNum != null ? formatSignedChange(changeAmountNum) : (spending.change ?? '—'),
      changePercent: changePercentNum != null ? formatChangePercent(changePercentNum) : (spending.changePercent ?? '—'),
      direction,
      footnote: 'Excluding transfers',
      interpretation: buildOverviewInterpretation(
        spending,
        whatChanged,
        direction,
        priorLabel,
        currentLabel,
        changePercentNum,
      ),
    },
    whatChanged,
  };
}

/** @param {object} spending @param {object | undefined} meta */
export function analyzeSpending(spending, meta) {
  const { currentLabel, priorLabel } = getComparisonMonthLabels(meta?.monthId, monthLabel(meta));
  const totalSpend = parseAmount(spending.total);

  const { overview, whatChanged } = buildOverview(spending, meta, currentLabel, priorLabel);
  const categories = buildCategoryBars(spending.topCategories, totalSpend);
  const recurringMerchants = collectRecurringMerchantNames(spending);

  let notableSpending = buildNotableSpending(spending, totalSpend, recurringMerchants);
  let spendingWatch = buildSpendingWatch(spending, spending.changes ?? spending.momChanges ?? []);

  const deduped = dedupeReviewAndNotable(spendingWatch.review.items, notableSpending.items);
  spendingWatch = {
    ...spendingWatch,
    review: {
      items: deduped.review.slice(0, 6),
      hasItems: deduped.review.length > 0,
    },
  };
  notableSpending = {
    ...notableSpending,
    items: deduped.notable,
    hasItems: deduped.notable.length > 0,
  };

  return {
    overview,
    categories,
    whatChanged,
    spendingWatch,
    notableSpending,
  };
}
