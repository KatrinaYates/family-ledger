import React, { useCallback, useState } from 'react';
import { LedgerLoader } from '../../context/BootGate.jsx';
import { useFinancialCheckIn } from '../../hooks/useFinancialCheckIn';
import {
  MetricKpiRow,
  SectionPageHeader,
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
import './checkin-refresh.css';

const CHATGPT_URL = 'https://chatgpt.com/';
const REFRESH_CHECK_IN_PROMPT = `Refresh my Family Ledger Financial Check-In.

Use my connected financial data to get the most current household financial position available right now. Then update the Financial Check-In data in my Family Ledger Supabase project so the app shows the current information.

Requirements:
- Use current data only. I do not want a comparison with the previous check-in or a list of what changed.
- Refresh the current cash position, bills/funding, debts, retirement/investments, net worth, recent activity, and any other fields already used by the existing Financial Check-In schema.
- Preserve household-specific context that cannot be derived from the financial accounts, including protected cash, kids savings intent, annotations, goals, or other manually maintained context unless newer information clearly replaces it.
- Replace/update the current Financial Check-In snapshot rather than creating a historical comparison report.
- Update the refreshed timestamp/source status appropriately.
- Use the existing Family Ledger schema and data shape already stored in Supabase. Do not redesign the schema unless something is actually broken.
- When finished, tell me that the Financial Check-In has been updated in Supabase.`;

function copyTextFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
}

function CheckInMeta({ enriched, onRefreshCheckIn, refreshState }) {
  return (
    <div className="check-in-meta">
      <div>
        {enriched?.refreshedLabel && (
          <p className="check-in-refreshed">
            Last refreshed: <time>{enriched.refreshedLabel}</time>
          </p>
        )}
        {enriched?.statusLabel && (
          <p className="check-in-source-status">Source status: {enriched.statusLabel}</p>
        )}
      </div>
      <button
        type="button"
        className="check-in-refresh-button"
        onClick={onRefreshCheckIn}
      >
        {refreshState === 'copied' ? 'Prompt copied ✓' : '↻ Refresh Check-In'}
      </button>
    </div>
  );
}

export function FinancialCheckInPage() {
  const { enriched, loading, error, hasCheckIn } = useFinancialCheckIn();
  const [refreshState, setRefreshState] = useState('idle');

  const refreshWithChatGPT = useCallback(async () => {
    // Open synchronously from the click so browsers do not treat it as a popup.
    window.open(CHATGPT_URL, '_blank', 'noopener,noreferrer');

    let copied = false;
    try {
      await navigator.clipboard.writeText(REFRESH_CHECK_IN_PROMPT);
      copied = true;
    } catch {
      try {
        copied = copyTextFallback(REFRESH_CHECK_IN_PROMPT);
      } catch {
        copied = false;
      }
    }

    setRefreshState(copied ? 'copied' : 'idle');
    if (copied) {
      window.setTimeout(() => setRefreshState('idle'), 2500);
    }
  }, []);

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
        subtitle="Where we are today before we decide what to do next."
        badge={badge}
        badgeVariant={badgeVariant}
      />

      <CheckInMeta
        enriched={enriched}
        onRefreshCheckIn={refreshWithChatGPT}
        refreshState={refreshState}
      />

      {error && (
        <WarningBanner role="alert">{error}</WarningBanner>
      )}

      {!hasCheckIn && !error && <CheckInEmptyState />}

      {hasCheckIn && enriched && (
        <>
          {enriched.stale && (
            <WarningBanner>
              This snapshot may be outdated. Use Refresh Check-In to update it with ChatGPT.
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
