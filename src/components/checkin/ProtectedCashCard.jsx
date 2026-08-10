import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';

function AccountList({ accounts }) {
  if (!accounts?.length) return null;
  return (
    <ul className="check-in-account-list">
      {accounts.map((account) => (
        <li key={account.name}>
          <span>{account.name}</span>
          <strong>{account.balanceLabel}</strong>
        </li>
      ))}
    </ul>
  );
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
          <AccountList accounts={kidsSavings.accounts} />
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
            <div
              className="check-in-progress"
              role="progressbar"
              aria-valuenow={emergencyFund.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Emergency fund progress toward target"
            >
              <div
                className="check-in-progress-fill"
                style={{ width: `${emergencyFund.progressPercent}%` }}
              />
              <span className="check-in-progress-label">{emergencyFund.progressPercent}% of target</span>
            </div>
          )}
        </section>
      )}
    </PanelCard>
  );
}
