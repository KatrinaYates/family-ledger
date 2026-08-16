import React from 'react';
import { AllocationTable, PanelCard } from '../content/NotebookPrimitives';
import { PieChart } from '../notebook';

export function CashPositionCard({ cash }) {
  if (!cash) return null;

  const hasAccounts = (cash.accounts ?? []).length > 0;
  const hasTotals =
    cash.availableTotalLabel || cash.protectedTotalLabel || cash.connectedTotalLabel;
  const pieItems = (cash.composition?.segments ?? []).map((segment) => ({
    label: segment.label,
    value: segment.value,
    valueLabel: segment.valueLabel,
    tone: segment.tone,
  }));

  if (!hasAccounts && !hasTotals) return null;

  return (
    <PanelCard
      title="Available vs protected cash"
      total={cash.connectedTotalLabel || undefined}
      scrollLabel="Cash accounts by classification"
      className="check-in-card check-in-cash-card"
    >
      {pieItems.length > 0 && (
        <PieChart
          items={pieItems}
          centerLabel="Connected cash"
          centerValue={cash.connectedTotalLabel}
          className="check-in-cash-composition"
        />
      )}

      <div className="check-in-cash-summary">
        {cash.connectedTotalLabel && (
          <div className="check-in-stat-block">
            <span className="check-in-stat-label">Connected cash</span>
            <strong className="check-in-stat-value">{cash.connectedTotalLabel}</strong>
          </div>
        )}
        {cash.availableTotalLabel && (
          <div className="check-in-stat-block is-available">
            <span className="check-in-stat-label">Available household cash</span>
            <strong className="check-in-stat-value">{cash.availableTotalLabel}</strong>
            <p className="check-in-stat-note">Money that may be available for household decisions.</p>
          </div>
        )}
        {cash.protectedTotalLabel && (
          <div className="check-in-stat-block is-protected">
            <span className="check-in-stat-label">Protected / committed cash</span>
            <strong className="check-in-stat-value">{cash.protectedTotalLabel}</strong>
            <p className="check-in-stat-note">Visible but not spendable — bills, kids, savings, and other committed money.</p>
          </div>
        )}
      </div>

      {hasAccounts && (
        <AllocationTable
          rows={(cash.accounts ?? []).map((account) => ({
            name: account.name,
            amount: account.balanceLabel,
            tag: account.classification === 'available' ? 'available' : account.classification === 'protected' ? 'assigned' : 'neutral',
            tagLabel: account.classificationLabel,
          }))}
        />
      )}
    </PanelCard>
  );
}
