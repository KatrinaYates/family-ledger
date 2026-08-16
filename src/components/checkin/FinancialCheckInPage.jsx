import React, { useCallback, useEffect, useState } from 'react';
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
1. Call get_linked_accounts first. Use the latest available balances from all currently linked accounts. Respect any saved Finances memories/rules, including account renames. If a relevant account is disconnected, failed, or unavailable, do not invent a value; note that briefly in status.
2. Get current liabilities as needed for credit-card details such as limits. Use linked-account balances as the source of truth for the actual current balance owed.
3. Get current investment/retirement information. For the check-in total, use the current balances of linked investment/401(k) accounts so the same account is not double-counted through individual holdings.
4. Query posted transactions for the most recent 7 calendar days through today for Recent Activity. Exclude pending transactions, transfers between our own accounts, credit-card payments, and the Partners personal-loan payment/transfer from household spending. Include real merchant and household bill spending, including the mortgage. Do not include income in spend.

Build ONE replacement snapshot in exactly the shape the Family Ledger UI expects:

{
  householdId,
  refreshedAt,
  status,
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

Calculation rules:
- CASH means connected depository/payment-app cash only. Do not include credit cards, loans, or retirement/investment accounts in cash.
- Preserve the existing cash classification rules. Available accounts remain available; Bills, kids savings, emergency savings, other protected savings, and protected reserves remain protected; PayPal/other neutral accounts remain neutral if that is how the saved snapshot classifies them.
- Preserve the Partners Checking reserve rule from the existing snapshot. Split its CURRENT balance into available and protected pieces using the saved protectedAmount/rule. Never double-count the split pieces in connectedTotal. connectedTotal is the sum of the actual underlying cash account balances once each.
- availableTotal is the sum of current account/split balances classified as available.
- protectedTotal is the sum of current account/split balances classified as protected.
- Kids savings should use the current balances of the existing kid-designated accounts. Preserve any existing kid targets. total is the sum of those current balances.
- Emergency fund should use the current balance of the account already designated as the emergency fund. Preserve the existing target. gap = max(target - balance, 0).
- Bills.balance is the CURRENT Bills account balance. Preserve the existing Bills bucket names, order, and targets. The Finances connection does not expose Ally sub-bucket balances, so DO NOT invent new per-bucket current amounts. Preserve existing bucket.current values unless there is a reliable direct source for them. Recalculate requiredTotal from bucket targets and fundingGap = max(requiredTotal - Bills.balance, 0). Keep funded/fundedCount consistent with the bucket.current values that are actually stored.
- Credit-card debt should include every currently linked credit card, including zero balances. Preserve friendly display names from the prior snapshot when matching the same account. Use current balance owed and current credit limit when available so utilization can render correctly.
- Loan debt should include currently linked loan accounts such as personal and auto loans. Preserve friendly display names from the prior snapshot. Use positive amounts owed.
- debt.creditCardsTotal = sum of current credit-card balances. debt.loansTotal = sum of current linked loan balances. debt.total = both totals combined.
- Retirement total = sum of CURRENT linked investment/401(k) account balances. Also populate retirement.accounts with one row per linked retirement/investment account.
- Connected net worth for this page is intentionally: connected cash + retirement - connected debt. Do not add unlinked home values, vehicle market values, or other estimated assets.
- Recent Activity covers the most recent 7 calendar days through today using POSTED eligible outflows only. sevenDaySpend is the total eligible spend. dailySpend must contain one row for each of the 7 dates, using 0 for dates with no eligible spend so the chart is complete. items should be the 5 largest eligible posted outflows in that same 7-day window, with human-friendly labels and currency-formatted amounts. summary should briefly state the date range and that transfers/debt-payment movements were excluded. I do not want a comparison to the previous check-in.
- refreshedAt must be the current ISO timestamp when you finish the refresh.
- status should be one short factual freshness note. No advice, recommendations, or change summary.

Before writing, validate that all totals reconcile mathematically and that no account is double-counted. Do not change the Supabase schema and do not create a new historical check-in row.

Finally, UPDATE the existing public.ledger_entries row with entry_key = 'fl-financial-check-in-latest', replacing its value JSON with the refreshed snapshot and setting updated_at to now(). Preserve the existing household_id and row identity. Then read the row back once to verify the saved JSON and timestamp.

When finished, reply only with a short confirmation that the Financial Check-In was refreshed in Supabase, plus any genuinely missing/unavailable account data that prevented a field from being current. Do not give me a change log.`;

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
      <div className="check-in-refresh-action">
        <button
          type="button"
          className="check-in-refresh-button"
          onClick={onRefreshCheckIn}
        >
          {refreshState === 'copied' ? 'Prompt copied ✓' : '↻ Refresh Check-In'}
        </button>
        {refreshState === 'copied' && (
          <span className="check-in-refresh-feedback" role="status">
            Paste the prompt into ChatGPT.
          </span>
        )}
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

    // Clipboard access must happen while this page still owns the click gesture.
    // Do the synchronous fallback first; if needed, start Clipboard API access
    // before opening ChatGPT so the browser does not revoke clipboard permission
    // when focus moves to the new tab.
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
