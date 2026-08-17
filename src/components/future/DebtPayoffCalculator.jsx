import React, { useMemo, useState } from 'react';
import { DebtSnowballTimeline } from '../notebook';

function money(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function monthLabel(startDate, months) {
  const baseDate = startDate ? new Date(`${startDate}T12:00:00`) : new Date();
  const date = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate;
  date.setMonth(date.getMonth() + months);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

function payoffDuration(months) {
  if (!Number.isFinite(months)) return '—';
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years}y ${rest}m` : `${years} year${years === 1 ? '' : 's'}`;
}

function validApr(value) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function simulateDebtPayoff(debts, monthlyBudget, startDate) {
  const active = debts
    .filter((debt) => debt.balance > 0)
    .map((debt) => ({
      ...debt,
      remaining: debt.balance,
      paidOffMonth: null,
      snowballStartMonth: null,
      interestPaid: 0,
    }));

  if (!active.length || !Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
    return null;
  }

  const requiredMinimum = active.reduce((sum, debt) => sum + Math.max(0, debt.minimum || 0), 0);
  if (monthlyBudget + 0.01 < requiredMinimum) {
    return { error: `Monthly debt amount is below the ${money(requiredMinimum)} of entered minimum payments.` };
  }

  let totalInterest = 0;
  let month = 0;

  while (active.some((debt) => debt.remaining > 0.005) && month < 600) {
    month += 1;

    active.forEach((debt) => {
      if (debt.remaining <= 0) return;
      const interest = debt.remaining * ((debt.apr / 100) / 12);
      debt.remaining += interest;
      debt.interestPaid += interest;
      totalInterest += interest;
    });

    let remainingBudget = monthlyBudget;

    active.forEach((debt) => {
      if (debt.remaining <= 0 || remainingBudget <= 0) return;
      const payment = Math.min(debt.remaining, Math.max(0, debt.minimum || 0), remainingBudget);
      debt.remaining -= payment;
      remainingBudget -= payment;
      if (debt.remaining <= 0.005 && debt.paidOffMonth == null) debt.paidOffMonth = month;
    });

    const targets = active
      .filter((debt) => debt.remaining > 0.005)
      .sort((a, b) => {
        const aPriority = Number.isFinite(a.priority) ? a.priority : 999;
        const bPriority = Number.isFinite(b.priority) ? b.priority : 999;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return b.apr - a.apr;
      });

    for (const debt of targets) {
      if (remainingBudget <= 0) break;
      if (debt.snowballStartMonth == null) debt.snowballStartMonth = Math.max(0, month - 1);
      const payment = Math.min(debt.remaining, remainingBudget);
      debt.remaining -= payment;
      remainingBudget -= payment;
      if (debt.remaining <= 0.005 && debt.paidOffMonth == null) debt.paidOffMonth = month;
    }
  }

  return {
    months: month,
    totalInterest,
    debts: active.map((debt) => ({
      ...debt,
      snowballStartMonth: debt.snowballStartMonth ?? Math.max(0, (debt.paidOffMonth ?? month) - 1),
      payoffLabel: debt.paidOffMonth ? monthLabel(startDate, debt.paidOffMonth) : 'Beyond 50 years',
    })),
  };
}

export function DebtPayoffCalculator({ planningSnapshot }) {
  const debts = planningSnapshot?.debts ?? [];
  const baselineBudget = Number(planningSnapshot?.baselineMonthlyBudget) || 0;
  const [monthlyBudget, setMonthlyBudget] = useState(baselineBudget);
  const [aprOverrides, setAprOverrides] = useState({});

  const modeledDebts = useMemo(() => debts.map((debt, index) => {
    const sourceApr = validApr(debt.apr);
    const hasOverride = Object.prototype.hasOwnProperty.call(aprOverrides, debt.id);
    const overrideApr = hasOverride ? validApr(aprOverrides[debt.id]) : null;
    const aprMissing = sourceApr == null && overrideApr == null;
    const apr = overrideApr ?? sourceApr ?? 0;

    return {
      ...debt,
      balance: Number(debt.balance) || 0,
      apr,
      aprMissing,
      minimum: Number(debt.minimum) || 0,
      priority: Number.isFinite(Number(debt.priority)) ? Number(debt.priority) : index + 1,
    };
  }), [debts, aprOverrides]);

  const missingAprs = modeledDebts.filter((debt) => debt.balance > 0 && debt.aprMissing);
  const activeDebts = modeledDebts.filter((debt) => debt.balance > 0);
  const projection = useMemo(
    () => simulateDebtPayoff(activeDebts, Number(monthlyBudget), planningSnapshot?.asOf),
    [activeDebts, monthlyBudget, planningSnapshot?.asOf],
  );

  const snowballRows = useMemo(() => {
    if (!projection || projection.error) return [];
    return projection.debts
      .filter((debt) => Number.isFinite(debt.paidOffMonth))
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((debt) => ({
        id: debt.id,
        name: debt.name,
        balanceLabel: money(debt.balance),
        aprLabel: debt.aprMissing ? null : `${debt.apr.toFixed(2)}% APR`,
        aprAssumed: debt.aprMissing,
        payoffMonth: debt.paidOffMonth,
        targetStartMonth: debt.snowballStartMonth,
        payoffLabel: debt.payoffLabel,
      }));
  }, [projection]);

  if (!debts.length) return null;

  return (
    <div className="future-payoff-calculator">
      <div className="future-payoff-calculator-heading">
        <div>
          <h3>Debt payoff projection</h3>
          <p>
            Starts from the current connected balances in the planning snapshot and assumes no new charges or borrowing.
            The chart shows when each debt is just receiving its regular payment and when the growing snowball becomes focused on it.
          </p>
        </div>
        {planningSnapshot?.asOf && <span>Planning balances as of {planningSnapshot.asOf}</span>}
      </div>

      <label className="future-payoff-budget-input">
        <span>How much do we want to put toward debt each month?</span>
        <div>
          <span aria-hidden="true">$</span>
          <input
            type="number"
            min="0"
            step="50"
            value={monthlyBudget}
            onChange={(event) => setMonthlyBudget(event.target.value)}
          />
        </div>
        {baselineBudget > 0 && (
          <small>
            Default: {money(baselineBudget)}. {planningSnapshot?.baselineLabel || 'Based on the month’s recorded payoff pace.'}
          </small>
        )}
      </label>

      <div className="future-payoff-rate-grid">
        {activeDebts.map((debt) => (
          <div className="future-payoff-rate-row" key={debt.id ?? debt.name}>
            <div>
              <strong>{debt.name}</strong>
              <span>{money(debt.balance)} balance</span>
            </div>
            <label>
              <span>APR</span>
              <div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={Object.prototype.hasOwnProperty.call(aprOverrides, debt.id)
                    ? aprOverrides[debt.id]
                    : (validApr(debt.apr) ?? '')}
                  onChange={(event) => setAprOverrides((current) => ({ ...current, [debt.id]: event.target.value }))}
                />
                <span>%</span>
              </div>
            </label>
            {debt.aprMissing && <small>APR missing · projection assumes 0%</small>}
            {!debt.aprMissing && debt.minimum > 0 && <small>Modeled minimum / regular payment: {money(debt.minimum)}</small>}
          </div>
        ))}
      </div>

      {missingAprs.length > 0 && (
        <p className="future-payoff-warning">
          APR data is missing for {missingAprs.map((debt) => debt.name).join(', ')}. The projection includes them at 0% APR, so estimated interest is understated until those rates are replaced.
        </p>
      )}

      {projection?.error && <p className="future-payoff-warning">{projection.error}</p>}

      {projection && !projection.error && (
        <>
          <div className="future-payoff-projection-kpis">
            <div><span>Debt free in</span><strong>{payoffDuration(projection.months)}</strong></div>
            <div><span>Estimated payoff date</span><strong>{monthLabel(planningSnapshot?.asOf, projection.months)}</strong></div>
            <div><span>Estimated interest</span><strong>{money(projection.totalInterest)}</strong></div>
          </div>

          {snowballRows.length > 0 && (
            <DebtSnowballTimeline
              title="Projected debt snowball"
              rows={snowballRows}
              totalMonths={projection.months}
              startDate={planningSnapshot?.asOf}
              className="future-debt-snowball"
            />
          )}

          <div className="future-payoff-results">
            {projection.debts
              .slice()
              .sort((a, b) => (a.paidOffMonth ?? 9999) - (b.paidOffMonth ?? 9999))
              .map((debt) => (
                <div key={debt.id ?? debt.name}>
                  <span>{debt.name}</span>
                  <strong>{debt.payoffLabel}</strong>
                  <small>{payoffDuration(debt.paidOffMonth)} · ~{money(debt.interestPaid)} interest{debt.aprMissing ? ' · 0% APR assumed' : ''}</small>
                </div>
              ))}
          </div>
        </>
      )}

      <p className="future-payoff-disclaimer">
        Planning estimate only. Actual payoff dates change with new purchases, variable rates, statement timing, fees, and payment timing. Missing APRs are modeled at 0% until replaced.
      </p>
    </div>
  );
}
