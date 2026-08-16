import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';
import { PieChart } from '../notebook';
import { ProgressBar } from './CheckInVisuals';

function chartAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value == null || value === '') return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildKidsPieItems(accounts = []) {
  const tones = ['lavender', 'blue', 'teal', 'gold'];
  return accounts
    .map((account, index) => ({
      label: account.name,
      value: chartAmount(account.balance),
      valueLabel: account.balanceLabel,
      tone: tones[index % tones.length],
    }))
    .filter((item) => item.value != null && item.value > 0);
}

export function ProtectedCashCard({ kidsSavings, emergencyFund }) {
  if (!kidsSavings && !emergencyFund) return null;

  const hasKids =
    kidsSavings?.totalLabel || (kidsSavings?.accounts ?? []).length > 0;
  const hasEmergency =
    emergencyFund?.balanceLabel
    || emergencyFund?.targetLabel
    || emergencyFund?.gapLabel;

  if (!hasKids && !hasEmergency) return null;

  const kidAccounts = kidsSavings?.accounts ?? [];
  const kidPieItems = buildKidsPieItems(kidAccounts);
  const kidTargets = kidAccounts.filter((account) => account.targetLabel);

  return (
    <PanelCard
      title="Protected savings"
      scrollLabel="Kids savings and emergency fund"
      className="check-in-card check-in-protected-card"
    >
      {hasKids && (
        <section className="check-in-protected-section">
          <div className="check-in-protected-heading">
            <h3>Kids&apos; savings</h3>
            {kidsSavings.totalLabel && (
              <strong className="panel-total">{kidsSavings.totalLabel}</strong>
            )}
          </div>
          <p className="check-in-card-lead">Protected kids&apos; money — not part of available household cash.</p>

          {kidPieItems.length > 0 && (
            <PieChart
              items={kidPieItems}
              centerLabel="Kids savings"
              centerValue={kidsSavings.totalLabel}
              className="check-in-kids-pie"
            />
          )}

          {kidTargets.length > 0 && (
            <div className="check-in-kids-list">
              {kidTargets.map((account) => (
                <p key={account.name} className="check-in-kids-target-note">
                  {account.name} target: <strong>{account.targetLabel}</strong>
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {hasEmergency && (
        <section className="check-in-protected-section">
          <div className="check-in-protected-heading">
            <h3>Emergency fund</h3>
            {emergencyFund.balanceLabel && (
              <strong className="panel-total">{emergencyFund.balanceLabel}</strong>
            )}
          </div>
          <p className="check-in-card-lead">Protected emergency savings — excluded from available cash.</p>
          <div className="check-in-emergency-stats">
            {emergencyFund.targetLabel && (
              <p><span>Target</span><strong>{emergencyFund.targetLabel}</strong></p>
            )}
            {emergencyFund.gapLabel && (
              <p><span>Gap to target</span><strong>{emergencyFund.gapLabel}</strong></p>
            )}
          </div>
          {emergencyFund.progressPercent != null && (
            <ProgressBar
              percent={emergencyFund.progressPercent}
              label={`${emergencyFund.progressPercent}% of target`}
              tone="teal"
              ariaLabel={`Emergency fund ${emergencyFund.balanceLabel} of ${emergencyFund.targetLabel} target, ${emergencyFund.progressPercent}%`}
            />
          )}
        </section>
      )}
    </PanelCard>
  );
}
