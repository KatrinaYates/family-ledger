import { formatCurrencyDetailed, parseAmount } from './spendingAnalysis.js';

/** @param {string | undefined} value */
function hasValue(value) {
  return Boolean(value && value !== '—');
}

/** @param {object} sourceData */
export function resolveDebtPayments(sourceData) {
  const debt = sourceData.snapshot?.debt ?? {};
  if (hasValue(debt.monthPayments)) return debt.monthPayments;

  const items = sourceData.story?.debtPayments?.items ?? [];
  const total = items.reduce((sum, item) => {
    const amount = parseAmount(item.amount);
    return amount != null ? sum + amount : sum;
  }, 0);
  return total > 0 ? formatCurrencyDetailed(total, true) : null;
}

/**
 * Monthly future-directed contributions — shared by Snapshot and Future.
 * Counts contributions and debt payments; never ending balances or interest.
 * @param {object} sourceData
 */
export function buildFutureProgress(sourceData) {
  const snapshot = sourceData.snapshot ?? {};
  const story = sourceData.story ?? {};
  const future = sourceData.future ?? {};
  /** @type {Array<{ label: string, value: string, amountNum: number }>} */
  const components = [];

  const retirementCandidates = [
    story.investments?.monthContributions,
    snapshot.retirement?.monthContributions,
    future.retirement?.monthContributions,
  ].filter(hasValue);

  const retirementValue = retirementCandidates[0] ?? null;
  const retirementNum = parseAmount(retirementValue);
  if (retirementNum != null && retirementNum > 0) {
    components.push({ label: 'Retirement', value: retirementValue, amountNum: retirementNum });
  }

  const kidsContributions = future.kidsSavings?.monthContributions;
  const kidsNum = parseAmount(kidsContributions);
  if (kidsNum != null && kidsNum > 0) {
    components.push({ label: 'Kids savings', value: kidsContributions, amountNum: kidsNum });
  }

  const emergencyContributions = snapshot.emergencyFund?.monthContributions;
  const emergencyNum = parseAmount(emergencyContributions);
  if (emergencyNum != null && emergencyNum > 0) {
    components.push({ label: 'Emergency fund', value: emergencyContributions, amountNum: emergencyNum });
  }

  const otherSavings = story.savings?.monthTotal;
  const otherNum = parseAmount(otherSavings);
  if (otherNum != null && otherNum > 0) {
    const duplicatesExisting = components.some((component) => component.amountNum === otherNum);
    if (!duplicatesExisting) {
      components.push({ label: 'Other savings', value: otherSavings, amountNum: otherNum });
    }
  }

  const debtPayments = resolveDebtPayments(sourceData);
  const debtNum = parseAmount(debtPayments);
  if (debtNum != null && debtNum > 0) {
    components.push({ label: 'Debt payments', value: debtPayments, amountNum: debtNum });
  }

  if (!components.length) return null;

  const totalNum = components.reduce((sum, component) => sum + component.amountNum, 0);
  if (totalNum <= 0) return null;

  const hasCents = components.some((component) => {
    const parsed = parseAmount(component.value);
    return parsed != null && !Number.isInteger(parsed);
  });

  return {
    total: formatCurrencyDetailed(totalNum, hasCents),
    components: components.map(({ label, value }) => ({ label, value })),
  };
}
