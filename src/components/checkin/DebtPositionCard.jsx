import React from 'react';
import { DashedList, PanelCard } from '../content/NotebookPrimitives';
import { PieChart } from '../notebook';
import { UtilizationBar } from './CheckInVisuals';

export function DebtPositionCard({ debt }) {
  if (!debt) return null;

  const hasLoans = (debt.loans ?? []).length > 0;
  const hasCards = (debt.creditCards ?? []).length > 0;
  const hasTotal = debt.totalLabel;
  const cardsWithUtilization = (debt.creditCards ?? []).filter(
    (card) => card.utilizationPercent != null,
  );
  const pieItems = (debt.composition?.segments ?? []).map((segment) => ({
    label: segment.label,
    value: segment.value,
    valueLabel: segment.valueLabel,
    tone: segment.tone,
  }));

  if (!hasLoans && !hasCards && !hasTotal) return null;

  return (
    <PanelCard
      title="Debt"
      total={debt.totalLabel || undefined}
      scrollLabel="Connected debt"
      className="check-in-card check-in-debt-card"
    >
      <p className="check-in-card-lead">Current connected debt — factual balances only, no recommendations.</p>

      {pieItems.length > 0 && (
        <PieChart
          items={pieItems}
          centerLabel="Total debt"
          centerValue={debt.totalLabel}
          className="check-in-debt-composition"
        />
      )}

      <div className="check-in-debt-totals">
        {debt.creditCardsTotalLabel && (
          <p><span>Credit card debt</span><strong>{debt.creditCardsTotalLabel}</strong></p>
        )}
        {debt.loansTotalLabel && (
          <p><span>Loan debt</span><strong>{debt.loansTotalLabel}</strong></p>
        )}
        {debt.totalLabel && (
          <p><span>Total connected debt</span><strong>{debt.totalLabel}</strong></p>
        )}
      </div>

      {cardsWithUtilization.length > 0 && (
        <section className="check-in-utilization-group">
          <h3 className="check-in-subheading">Credit card utilization</h3>
          {cardsWithUtilization.map((card) => (
            <UtilizationBar key={card.name} card={card} />
          ))}
        </section>
      )}

      {hasLoans && (
        <section className="check-in-debt-list-section">
          <h3 className="check-in-subheading">Loans</h3>
          <DashedList items={debt.loans} />
        </section>
      )}

      {hasCards && (
        <section className="check-in-debt-list-section">
          <h3 className="check-in-subheading">Credit cards</h3>
          <DashedList items={debt.creditCards.map((card) => ({
            name: card.name,
            amount: card.amount,
          }))} />
        </section>
      )}
    </PanelCard>
  );
}
