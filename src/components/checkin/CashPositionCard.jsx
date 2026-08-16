import React from 'react';
import { AllocationTable, PanelCard } from '../content/NotebookPrimitives';
import { PieChart } from '../notebook';

const CASH_PIE_TONES = {
  available: 'green',
  protected: 'gold',
  neutral: 'blue',
};

export function CashPositionCard({ cash }) {
  if (!cash) return null;

  const hasAccounts = (cash.accounts ?? []).length > 0;
  const hasTotals =
    cash.availableTotalLabel || cash.protectedTotalLabel || cash.connectedTotalLabel;
  const pieItems = (cash.composition?.segments ?? []).map((segment) => ({
    label: segment.label,
    value: segment.value,
    valueLabel: segment.valueLabel,
    tone: CASH_PIE_TONES[segment.key] ?? 'teal',
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
