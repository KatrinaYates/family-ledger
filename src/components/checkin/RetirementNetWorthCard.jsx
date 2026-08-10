import React from 'react';
import { DashedList, PanelCard } from '../content/NotebookPrimitives';

export function RetirementNetWorthCard({ retirement, netWorth }) {
  if (!retirement && !netWorth) return null;

  const hasRetirement = retirement?.totalLabel;
  const hasNetWorth = netWorth?.connectedLabel;

  if (!hasRetirement && !hasNetWorth) return null;

  return (
    <PanelCard
      title="Retirement & net worth"
      total={netWorth?.connectedLabel || retirement?.totalLabel || undefined}
      className="check-in-card check-in-retirement-card"
    >
      {hasRetirement && (
        <section className="check-in-retirement-section">
          <div className="check-in-protected-heading">
            <h3>Retirement</h3>
            <strong className="panel-total">{retirement.totalLabel}</strong>
          </div>
          <span className="snapshot-chip purple">{retirement.protectionLabel}</span>
          <p className="check-in-card-lead">Long-term money — never counted as available household cash.</p>
        </section>
      )}

      {hasNetWorth && (
        <section className="check-in-networth-section">
          <div className="check-in-protected-heading">
            <h3>Connected net worth</h3>
            <strong className="panel-total">{netWorth.connectedLabel}</strong>
          </div>
        </section>
      )}

      {retirement?.accounts?.length > 0 && (
        <DashedList items={retirement.accounts.map((account) => ({
          name: account.name,
          amount: account.balanceLabel ?? account.balance ?? account.amount,
        }))} />
      )}
    </PanelCard>
  );
}
