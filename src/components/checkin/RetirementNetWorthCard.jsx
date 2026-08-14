import React from 'react';
import { DashedList, PanelCard, ToneChip } from '../content/NotebookPrimitives';
import { StackedValueBar } from './CheckInVisuals';

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
          <ToneChip tone="protected">{retirement.protectionLabel}</ToneChip>
          <p className="check-in-card-lead">Long-term money — never counted as available household cash.</p>
        </section>
      )}

      {hasNetWorth && (
        <section className="check-in-networth-section">
          <div className="check-in-protected-heading">
            <h3>Connected net worth</h3>
            <strong className="panel-total">{netWorth.connectedLabel}</strong>
          </div>
          {netWorth.composition && (
            <StackedValueBar
              composition={netWorth.composition}
              ariaLabel={`Net worth composition: debt and net equity totaling connected net worth ${netWorth.connectedLabel}`}
              className="check-in-networth-composition"
            />
          )}
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
