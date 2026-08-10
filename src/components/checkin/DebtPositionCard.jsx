import React from 'react';
import { DebtGroups, PanelCard } from '../content/NotebookPrimitives';

export function DebtPositionCard({ debt }) {
  if (!debt) return null;

  const hasLoans = (debt.loans ?? []).length > 0;
  const hasCards = (debt.creditCards ?? []).length > 0;
  const hasTotal = debt.totalLabel;

  if (!hasLoans && !hasCards && !hasTotal) return null;

  return (
    <PanelCard
      title="Debt"
      total={debt.totalLabel || undefined}
      scrollLabel="Connected debt"
      className="check-in-card check-in-debt-card"
    >
      <p className="check-in-card-lead">Current connected debt — factual balances only, no recommendations.</p>
      {(hasLoans || hasCards) && (
        <DebtGroups loans={debt.loans ?? []} creditCards={debt.creditCards ?? []} />
      )}
    </PanelCard>
  );
}
