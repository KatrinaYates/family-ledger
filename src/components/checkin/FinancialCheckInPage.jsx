import React from 'react';
import { LedgerLoader } from '../../context/BootGate.jsx';
import { useFinancialCheckIn } from '../../hooks/useFinancialCheckIn';
import {
  MetricKpiRow,
  SectionPageHeader,
  StatusBadge,
  WarningBanner,
} from '../content/NotebookPrimitives';
import { AskChatGPTCard } from './AskChatGPTCard';
import { BillsFundingCard } from './BillsFundingCard';
import { CashPositionCard } from './CashPositionCard';
import { CheckInEmptyState } from './CheckInEmptyState';
import { DebtPositionCard } from './DebtPositionCard';
import { ProtectedCashCard } from './ProtectedCashCard';
import { RecentActivityCard } from './RecentActivityCard';
import { RetirementNetWorthCard } from './RetirementNetWorthCard';

function CheckInMeta({ enriched }) {
  if (!enriched) return null;

  return (
    <div className="check-in-meta">
      {enriched.refreshedLabel && (
        <p className="check-in-refreshed">
          Last refreshed: <time>{enriched.refreshedLabel}</time>
        </p>
      )}
      {enriched.statusLabel && (
        <p className="check-in-source-status">Source status: {enriched.statusLabel}</p>
      )}
    </div>
  );
}

export function FinancialCheckInPage() {
  const { enriched, loading, error, hasCheckIn } = useFinancialCheckIn();

  if (loading) {
    return <LedgerLoader inline aria-label="Loading financial check-in" />;
  }

  const badge = enriched?.stale
    ? 'Stale snapshot'
    : hasCheckIn
      ? 'Saved snapshot'
      : null;
  const badgeVariant = enriched?.stale ? 'draft' : 'final';

  return (
    <div className="snapshot-page check-in-page">
      <SectionPageHeader
        eyebrow="Current household position · not tied to a month"
        title="Financial Check-In"
        subtitle={
          enriched?.stale
            ? 'Saved financial picture — review before treating as current.'
            : hasCheckIn
              ? 'Where we are today before we decide what to do next.'
              : 'Where we are today before we decide what to do next.'
        }
        badge={badge}
        badgeVariant={badgeVariant}
      />

      <CheckInMeta enriched={enriched} />

      {error && (
        <WarningBanner role="alert">{error}</WarningBanner>
      )}

      {!hasCheckIn && !error && <CheckInEmptyState />}

      {hasCheckIn && enriched && (
        <>
          {enriched.stale && (
            <WarningBanner>
              This snapshot may be outdated. Do not treat these values as today&apos;s balances until refreshed.
            </WarningBanner>
          )}

          {enriched.kpis.length > 0 && (
            <MetricKpiRow items={enriched.kpis} />
          )}

          <div className="check-in-grid">
            <CashPositionCard cash={enriched.cash} />
            <BillsFundingCard bills={enriched.bills} />
            <ProtectedCashCard
              kidsSavings={enriched.kidsSavings}
              emergencyFund={enriched.emergencyFund}
            />
            <DebtPositionCard debt={enriched.debt} />
            <RetirementNetWorthCard
              retirement={enriched.retirement}
              netWorth={enriched.netWorth}
            />
            <RecentActivityCard recentActivity={enriched.recentActivity} />
            <AskChatGPTCard enriched={enriched} />
          </div>
        </>
      )}

      {!hasCheckIn && (
        <div className="check-in-grid check-in-grid-ask-only">
          <AskChatGPTCard enriched={enriched} />
        </div>
      )}
    </div>
  );
}
