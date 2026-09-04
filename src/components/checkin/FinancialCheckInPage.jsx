import React, { useCallback, useEffect, useMemo, useState } from 'react';
import REFRESH_CHECK_IN_PROMPT from '../../../docs/FINANCIAL_CHECK_IN_REFRESH.md?raw';
import { LedgerLoader } from '../../context/BootGate.jsx';
import { useFinancialCheckIn } from '../../hooks/useFinancialCheckIn';
import {
  MetricKpiRow,
  SectionPageHeader,
  WarningBanner,
} from '../content/NotebookPrimitives';
import { CardColumns } from '../notebook';
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

function copyTextFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
}

function formatJournalTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  return `${datePart} · ${timePart}`;
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JournalMeta({ timestamp, refreshedAt, onRefreshCheckIn, refreshState }) {
  if (!timestamp) return null;

  const refreshLabel = refreshState === 'copied'
    ? 'Refresh prompt copied'
    : 'Refresh Check-In';

  return (
    <div className="check-in-journal-meta">
      <time className="check-in-journal-date" dateTime={refreshedAt}>
        {timestamp}
      </time>
      <button
        type="button"
        className={`check-in-refresh-button${refreshState === 'copied' ? ' is-copied' : ''}`}
        onClick={onRefreshCheckIn}
        aria-label={refreshLabel}
        title={refreshLabel}
      >
        <RefreshIcon />
      </button>
      {refreshState === 'failed' && (
        <span className="check-in-refresh-feedback check-in-refresh-feedback--error" role="alert">
          Couldn&apos;t copy automatically. Try again.
        </span>
      )}
    </div>
  );
}

export function FinancialCheckInPage() {
  const { enriched, loading, error, hasCheckIn } = useFinancialCheckIn();
  const [refreshState, setRefreshState] = useState('idle');
  const [waitingForReturn, setWaitingForReturn] = useState(false);

  const journalTimestamp = useMemo(
    () => formatJournalTimestamp(enriched?.raw?.refreshedAt),
    [enriched?.raw?.refreshedAt],
  );
  const issues = useMemo(
    () => (Array.isArray(enriched?.raw?.issues) ? enriched.raw.issues.filter(Boolean) : []),
    [enriched?.raw?.issues],
  );

  useEffect(() => {
    if (!waitingForReturn) return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      setWaitingForReturn(false);
      window.setTimeout(() => setRefreshState('idle'), 4000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [waitingForReturn]);

  const refreshWithChatGPT = useCallback(() => {
    setRefreshState('idle');

    let copiedSynchronously = false;
    try {
      copiedSynchronously = copyTextFallback(REFRESH_CHECK_IN_PROMPT);
    } catch {
      copiedSynchronously = false;
    }

    let clipboardPromise = null;
    if (!copiedSynchronously && navigator.clipboard?.writeText) {
      try {
        clipboardPromise = navigator.clipboard.writeText(REFRESH_CHECK_IN_PROMPT);
      } catch {
        clipboardPromise = null;
      }
    }

    const chatWindow = window.open(CHATGPT_URL, '_blank', 'noopener,noreferrer');
    setWaitingForReturn(Boolean(chatWindow));

    if (copiedSynchronously) {
      setRefreshState('copied');
      return;
    }

    if (clipboardPromise) {
      clipboardPromise
        .then(() => setRefreshState('copied'))
        .catch(() => setRefreshState('failed'));
      return;
    }

    setRefreshState('failed');
  }, []);

  if (loading) {
    return <LedgerLoader inline aria-label="Loading financial check-in" />;
  }

  return (
    <div className="snapshot-page check-in-page">
      <JournalMeta
        timestamp={journalTimestamp}
        refreshedAt={enriched?.raw?.refreshedAt}
        onRefreshCheckIn={refreshWithChatGPT}
        refreshState={refreshState}
      />

      <SectionPageHeader
        eyebrow="Current household position · not tied to a month"
        title="Financial Check-In"
        subtitle="Where we are today before we decide what to do next."
      />

      {error && (
        <WarningBanner role="alert">{error}</WarningBanner>
      )}

      {issues.length > 0 && (
        <WarningBanner>
          {issues.length === 1 ? issues[0] : (
            <ul className="check-in-issue-list">
              {issues.map((issue, index) => <li key={`${issue}-${index}`}>{issue}</li>)}
            </ul>
          )}
        </WarningBanner>
      )}

      {!hasCheckIn && !error && <CheckInEmptyState />}

      {hasCheckIn && enriched && (
        <>
          {enriched.kpis.length > 0 && (
            <MetricKpiRow items={enriched.kpis} />
          )}

          <CardColumns className="check-in-card-columns">
            <div>
              <CashPositionCard cash={enriched.cash} />
              <BillsFundingCard bills={enriched.bills} />
              <ProtectedCashCard
                kidsSavings={enriched.kidsSavings}
                emergencyFund={enriched.emergencyFund}
              />
            </div>
            <div>
              <DebtPositionCard debt={enriched.debt} />
              <RetirementNetWorthCard
                retirement={enriched.retirement}
                netWorth={enriched.netWorth}
              />
              <RecentActivityCard recentActivity={enriched.recentActivity} />
            </div>
          </CardColumns>
          <div className="check-in-advisor-row">
            <AskChatGPTCard enriched={enriched} />
          </div>
        </>
      )}

      {!hasCheckIn && (
        <div className="check-in-ask-only">
          <AskChatGPTCard enriched={enriched} />
        </div>
      )}
    </div>
  );
}
