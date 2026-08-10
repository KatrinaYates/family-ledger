import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';
import { MiniBalanceBar, ProgressBar } from './CheckInVisuals';

function KidsAccountVisual({ account }) {
  const barLabel = account.barMode === 'target'
    ? `${account.name} toward target`
    : `${account.name} share of kids' savings`;

  return (
    <div className="check-in-kids-account">
      <MiniBalanceBar
        label={account.name}
        valueLabel={account.balanceLabel}
        percent={account.progressPercent}
        tone={account.barTone}
        ariaLabel={`${barLabel}: ${account.balanceLabel}${account.targetLabel ? ` of ${account.targetLabel}` : ''}`}
      />
      {account.targetLabel && (
        <p className="check-in-kids-target-note">
          Target: <strong>{account.targetLabel}</strong>
        </p>
      )}
    </div>
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
          <div className="check-in-kids-list">
            {(kidsSavings.accounts ?? []).map((account) => (
              <KidsAccountVisual key={account.name} account={account} />
            ))}
          </div>
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
