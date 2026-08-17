import React, { useMemo, useState } from 'react';
import { TrendingGraph } from '../notebook';

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
    .filter((debt) => debt.balance > 0 && Number.isFinite(debt.apr))
    .map((debt) => ({ ...debt, remaining: debt.balance, paidOffMonth: null, interestPaid: 0 }));

  if (!active.length || !Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
    return null;
  }

  const requiredMinimum = active.reduce((sum, debt) => sum + Math.max(0, debt.minimum || 0), 0);
  if (monthlyBudget + 0.01 < requiredMinimum) {
    return { error: `Monthly debt amount is below the ${money(requiredMinimum)} of entered minimum payments.` };
  }

  const points = [{ label: 'Now', value: active.reduce((sum, debt) => sum + debt.remaining, 0) }];
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
      const payment = Math.min(debt.remaining, remainingBudget);
      debt.remaining -= payment;
      remainingBudget -= payment;
      if (debt.remaining <= 0.005 && debt.paidOffMonth == null) debt.paidOffMonth = month;
    }

    const totalRemaining = active.reduce((sum, debt) => sum + Math.max(0, debt.remaining), 0);
    if (month % 6 === 0 || totalRemaining <= 0.005) {
      points.push({ label: monthLabel(startDate, month), value: totalRemaining });
    }
  }

  return {
    months: month,
    totalInterest,
    points,
    debts: active.map((debt) => ({
      ...debt,
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
    const suppliedApr = Object.prototype.hasOwnProperty.call(aprOverrides, debt.id)
      ? validApr(aprOverrides[debt.id])
      : sourceApr;
    return {
      ...debt,
      balance: Number(debt.balance) || 0,
      apr: suppliedApr,
      minimum: Number(debt.minimum) || 0,
      priority: Number.isFinite(Number(debt.priority)) ? Number(debt.priority) : index + 1,
    };
  }), [debts, aprOverrides]);

  const missingAprs = modeledDebts.filter((debt) => debt.balance > 0 && !Number.isFinite(debt.apr));
  const knownRateDebts = modeledDebts.filter((debt) => debt.balance > 0 && Number.isFinite(debt.apr));
  const projection = useMemo(
    () => simulateDebtPayoff(knownRateDebts, Number(monthlyBudget), planningSnapshot?.asOf),
    [knownRateDebts, monthlyBudget, planningSnapshot?.asOf],
  );

  if (!debts.length) return null;

  return (
    <div className="future-payoff-calculator">
      <div className="future-payoff-calculator-heading">
        <div>
          <h3>Debt payoff projection</h3>
          <p>
            Starts from the current connected balances in the planning snapshot and assumes no new charges or borrowing.
            Interest compounds monthly using the APRs below.
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
        {modeledDebts.filter((debt) => debt.balance > 0).map((debt) => (
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
                  placeholder="Enter rate"
                  value={Object.prototype.hasOwnProperty.call(aprOverrides, debt.id)
                    ? aprOverrides[debt.id]
                    : (validApr(debt.apr) ?? '')}
                  onChange={(event) => setAprOverrides((current) => ({ ...current, [debt.id]: event.target.value }))}
                />
                <span>%</span>
              </div>
            </label>
            {debt.minimum > 0 && <small>Modeled minimum / regular payment: {money(debt.minimum)}</small>}
          </div>
        ))}
      </div>

      {missingAprs.length > 0 && (
        <p className="future-payoff-warning">
          Enter the APR for {missingAprs.map((debt) => debt.name).join(', ')} to include {missingAprs.length === 1 ? 'it' : 'them'} in the full payoff estimate.
          Until then, the timeline below covers only debts with verified rates.
        </p>
      )}

      {projection?.error && <p className="future-payoff-warning">{projection.error}</p>}

      {projection && !projection.error && (
        <>
          <div className="future-payoff-projection-kpis">
            <div><span>{missingAprs.length ? 'Known-rate debt free in' : 'Debt free in'}</span><strong>{payoffDuration(projection.months)}</strong></div>
            <div><span>Estimated payoff date</span><strong>{monthLabel(planningSnapshot?.asOf, projection.months)}</strong></div>
            <div><span>Estimated interest</span><strong>{money(projection.totalInterest)}</strong></div>
          </div>

          {projection.points.length > 1 && (
            <TrendingGraph
              title={missingAprs.length ? 'Known-rate debt projection' : 'Projected total debt balance'}
              points={projection.points.map((point) => ({
                ...point,
                valueLabel: money(point.value),
              }))}
              valueFormatter={money}
              tone="coral"
              className="future-debt-trend"
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
                  <small>{payoffDuration(debt.paidOffMonth)} · ~{money(debt.interestPaid)} interest</small>
                </div>
              ))}
          </div>
        </>
      )}

      <p className="future-payoff-disclaimer">
        Planning estimate only. Actual payoff dates change with new purchases, variable rates, statement timing, fees, and payment timing.
      </p>
    </div>
  );
}
