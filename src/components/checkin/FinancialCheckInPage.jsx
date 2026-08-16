import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
const REFRESH_CHECK_IN_PROMPT = `Refresh my Family Ledger Financial Check-In with the most current information available.

Use @Finances as the source of truth for current connected account balances and recent posted activity, and use @Supabase to read and replace the saved Financial Check-In. This is a refresh of the current picture, not a comparison or a historical report.

First, read the existing Family Ledger check-in from the Family Ledger Prod Supabase project:
- table: public.ledger_entries
- entry_key: fl-financial-check-in-latest

Treat the existing JSON as the source of truth for household-specific CONFIGURATION only: display names, account purposes/classifications, reserve rules, Bills bucket names/order/targets, savings targets, and other manually maintained context. Do NOT preserve old balances, totals, debt amounts, recent activity, or timestamps when newer Finances data is available.

Then use @Finances:
1. Call get_linked_accounts first. Use the latest available balances from all currently linked accounts. Respect saved Finances memories/rules, including account renames.
2. Get current liabilities as needed for credit-card details such as limits. Use linked-account balances as the source of truth for the actual current balance owed.
3. Get current investment/retirement information. For the check-in total, use the current balances of linked investment/401(k) accounts so the same account is not double-counted through individual holdings.
4. Query posted transactions for the most recent 7 calendar days through today for Recent Activity. Exclude pending transactions, transfers between our own accounts, credit-card payments, and the Partners personal-loan payment/transfer from household spending. Include real merchant and household bill spending, including the mortgage. Do not include income in spend.

Build ONE replacement snapshot in exactly this shape:

{
  householdId,
  refreshedAt,
  issues: [],
  cash: {
    accounts: [{ name, balance, purpose, classification }],
    reserveRules: [{ account, protectedAmount, purpose, rule }],
    connectedTotal,
    availableTotal,
    protectedTotal
  },
  bills: {
    balance,
    buckets: [{ name, target, current, funded }],
    requiredTotal,
    fundingGap,
    fundedCount,
    requiredCount
  },
  kidsSavings: {
    total,
    accounts: [{ name, balance, target? }]
  },
  emergencyFund: {
    balance,
    target,
    gap
  },
  debt: {
    creditCards: [{ name, balance, limit? }],
    creditCardsTotal,
    loans: [{ name, balance }],
    loansTotal,
    total
  },
  retirement: {
    total,
    accounts: [{ name, balance }]
  },
  netWorth: {
    connected
  },
  recentActivity: {
    sevenDaySpend,
    dailySpend: [{ date, amount }],
    items: [{ date, label, amount }],
    summary
  }
}

IMPORTANT ISSUE / WARNING RULES:
- issues MUST be [] when the check-in was refreshed successfully and every section has reliable current data.
- Only add an issue when something actually prevented a section from being refreshed correctly: a relevant account is disconnected/failed/unavailable, a required data source did not return usable current data, a section could not be recalculated, or values cannot be reconciled safely.
- Do NOT create issues for routine source-freshness differences, normal provider timing, the Partners reserve rule, or other informational notes.
- Each issue must be a short, plain-English sentence that names the affected account or section and says what could not be updated.
- If only one section cannot be refreshed, preserve the previous saved values for that affected section rather than inventing values, refresh every other section normally, and record exactly what was preserved in issues.
- refreshedAt is the time this check-in was generated. It does not mean an unavailable section magically became current.

Calculation rules:
- CASH means connected depository/payment-app cash only. Do not include credit cards, loans, or retirement/investment accounts in cash.
- Preserve the existing cash classification rules. Available accounts remain available; Bills, kids savings, emergency savings, other protected savings, and protected reserves remain protected; PayPal/other neutral accounts remain neutral if that is how the saved snapshot classifies them.
- Preserve the Partners Checking reserve rule from the existing snapshot. Split its CURRENT balance into available and protected pieces using the saved protectedAmount/rule. Never double-count the split pieces in connectedTotal. connectedTotal is the sum of the actual underlying cash account balances once each.
- availableTotal is the sum of current account/split balances classified as available.
- protectedTotal is the sum of current account/split balances classified as protected.
- Kids savings should use the current balances of the existing kid-designated accounts. Preserve any existing kid targets. total is the sum of those current balances.
- Emergency fund should use the current balance of the account already designated as the emergency fund. Preserve the existing target. gap = max(target - balance, 0).
- Bills.balance is the CURRENT Bills account balance. Preserve the existing Bills bucket names, order, and targets. The Finances connection does not expose Ally sub-bucket balances, so DO NOT invent new per-bucket current amounts. Preserve existing bucket.current values unless there is a reliable direct source for them. Recalculate requiredTotal from bucket targets and fundingGap = max(requiredTotal - Bills.balance, 0). Keep funded/fundedCount consistent with the bucket.current values actually stored. This expected limitation is NOT an issue by itself because those bucket values are intentionally maintained configuration/context.
- Credit-card debt should include every currently linked credit card, including zero balances. Preserve friendly display names from the prior snapshot when matching the same account. Use current balance owed and current credit limit when available so utilization can render correctly.
- Loan debt should include currently linked loan accounts such as personal and auto loans. Preserve friendly display names from the prior snapshot. Use positive amounts owed.
- debt.creditCardsTotal = sum of current credit-card balances. debt.loansTotal = sum of current linked loan balances. debt.total = both totals combined.
- Retirement total = sum of CURRENT linked investment/401(k) account balances. Also populate retirement.accounts with one row per linked retirement/investment account.
- Connected net worth for this page is intentionally: connected cash + retirement - connected debt. Do not add unlinked home values, vehicle market values, or other estimated assets.
- Recent Activity covers the most recent 7 calendar days through today using POSTED eligible outflows only. sevenDaySpend is the total eligible spend. dailySpend must contain one row for each of the 7 dates, using 0 for dates with no eligible spend so the chart is complete. items should be the 5 largest eligible posted outflows in that same 7-day window, with human-friendly labels and currency-formatted amounts. summary should briefly state the date range and that transfers/debt-payment movements were excluded. I do not want a comparison to the previous check-in.
- refreshedAt must be the current ISO timestamp when you finish the refresh.

Before writing, validate that all totals reconcile mathematically and that no account is double-counted. Do not change the Supabase schema and do not create a new historical check-in row.

Finally, UPDATE the existing public.ledger_entries row with entry_key = 'fl-financial-check-in-latest', replacing its value JSON with the refreshed snapshot and setting updated_at to now(). Preserve the existing household_id and row identity. Then read the row back once to verify the saved JSON and timestamp.

When finished, reply only with a short confirmation that the Financial Check-In was refreshed in Supabase. If issues is non-empty, include those same issue sentences. Do not give me a change log.`;

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

function CheckInMeta({ onRefreshCheckIn, refreshState }) {
  return (
    <div className="check-in-meta">
      <div className="check-in-refresh-action">
        <button
          type="button"
          className="check-in-refresh-button"
          onClick={onRefreshCheckIn}
        >
          {refreshState === 'copied' ? 'Prompt copied ✓' : '↻ Refresh Check-In'}
        </button>
        {refreshState === 'failed' && (
          <span className="check-in-refresh-feedback check-in-refresh-feedback--error" role="alert">
            Couldn&apos;t copy automatically. Try again.
          </span>
        )}
      </div>
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
      {journalTimestamp && (
        <time className="check-in-journal-date" dateTime={enriched.raw.refreshedAt}>
          {journalTimestamp}
        </time>
      )}

      <SectionPageHeader
        eyebrow="Current household position · not tied to a month"
        title="Financial Check-In"
        subtitle="Where we are today before we decide what to do next."
      />

      <CheckInMeta
        onRefreshCheckIn={refreshWithChatGPT}
        refreshState={refreshState}
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
