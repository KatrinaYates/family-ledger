import React from 'react';
import { DashedList, PanelCard } from '../content/NotebookPrimitives';
import { StackedValueBar, UtilizationBar } from './CheckInVisuals';

export function DebtPositionCard({ debt }) {
  if (!debt) return null;

  const hasLoans = (debt.loans ?? []).length > 0;
  const hasCards = (debt.creditCards ?? []).length > 0;
  const hasTotal = debt.totalLabel;
  const cardsWithUtilization = (debt.creditCards ?? []).filter(
    (card) => card.utilizationPercent != null,
  );

  if (!hasLoans && !hasCards && !hasTotal) return null;

  return (
    <PanelCard
      title="Debt"
      total={debt.totalLabel || undefined}
      scrollLabel="Connected debt"
      className="check-in-card check-in-debt-card"
    >
      <p className="check-in-card-lead">Current connected debt — factual balances only, no recommendations.</p>

      {debt.composition && (
        <StackedValueBar
          composition={debt.composition}
          ariaLabel={`Debt composition: credit cards ${debt.creditCardsTotalLabel || 'unknown'}, loans ${debt.loansTotalLabel || 'unknown'}`}
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
