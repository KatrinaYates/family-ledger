# Financial Check-In Refresh

This is the canonical prompt for refreshing the Family Ledger's current Financial Check-In. It updates one live household snapshot. It does not create a monthly chapter, compare periods, or edit application code.

## Prompt

Refresh my Family Ledger Financial Check-In with the most current reliable information available.

Use the connected GitHub, Finances, and Supabase apps.

## Responsibility boundary

- GitHub is read-only. Use the current `main` branch of `KatrinaYates/family-ledger` to confirm the active Financial Check-In contract and display expectations.
- Finances is the source of truth for current connected balances, liabilities, investments, and recent posted activity.
- Supabase stores the single latest Financial Check-In snapshot.
- Do not edit GitHub, change the Supabase schema, create a monthly ledger chapter, or generate historical check-in rows.

## Read the existing check-in

Read the existing Family Ledger check-in from the `Family Ledger Prod` Supabase project:

- Table: `public.ledger_entries`
- Entry key: `fl-financial-check-in-latest`

Preserve its row identity and `household_id`.

Treat the existing JSON as the source of truth only for household-maintained configuration, including friendly display names, account purposes and classifications, reserve rules, Bills bucket names/order/targets, savings targets, and other manually maintained context.

Do not preserve old balances, totals, debts, recent activity, or timestamps when newer reliable Finances data is available.

## Collect current financial data

1. Call Finances `get_linked_accounts` first. Inspect sync status and coverage for every relevant account. Respect saved account renames and financial memories.
2. Use the latest available balance from every currently linked cash account. Do not silently omit a failed, disconnected, or unavailable account.
3. Retrieve current liabilities for every linked credit card, personal loan, auto loan, and other connected debt. Use linked-account balances as the source of truth for the amount owed. Use liability details for limits when available.
4. Retrieve current investment and retirement balances. Use one current account balance per linked investment or 401(k) account so holdings are not counted again on top of the account balance.
5. Query posted transactions for the most recent seven calendar days through today for Recent Activity. Exclude pending transactions, internal transfers, credit-card payments, and the Partners personal-loan payment/transfer from household spending. Include actual merchant and household-bill spending, including the mortgage. Do not count income as spending.

## Required snapshot contract

Build one replacement snapshot in exactly this shape:

```js
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
```

Use numeric values for balances, totals, targets, limits, gaps, and chart data. Use ISO dates and timestamps. Do not place formatted currency strings in numeric fields.

## Calculation rules

- Cash means connected depository and payment-app cash only. Exclude credit cards, loans, retirement, and investment accounts.
- Preserve existing cash classifications. Available accounts remain available. Bills, kids savings, emergency savings, other protected savings, and protected reserves remain protected. Neutral accounts remain neutral unless the saved configuration says otherwise.
- Preserve the Partners Checking reserve rule. Split its current balance into available and protected portions using the saved rule. Count the underlying account only once in `connectedTotal`.
- `availableTotal` is the current amount classified as available.
- `protectedTotal` is the current amount classified as protected.
- Kids savings uses the current balances of the existing kid-designated accounts. Preserve existing targets. Its total must equal the sum of those balances.
- Emergency fund uses the current balance of the designated emergency account. Preserve its target. `gap = max(target - balance, 0)`.
- Bills uses the current Bills account balance. Preserve existing bucket names, order, and targets. Finances does not expose Ally sub-bucket balances, so preserve existing `bucket.current` values unless a reliable direct source exists. Recalculate `requiredTotal` from targets and `fundingGap = max(requiredTotal - bills.balance, 0)`. Keep funded flags and counts consistent with the stored bucket values.
- Credit-card debt includes every currently linked credit card, including cards with a zero balance. Preserve friendly names when accounts match. Use current balances and limits when available.
- Loan debt includes every currently linked loan. Preserve friendly names and store positive amounts owed.
- `creditCardsTotal` equals the sum of credit-card balances.
- `loansTotal` equals the sum of loan balances.
- `debt.total = creditCardsTotal + loansTotal`.
- Retirement total equals the sum of current linked retirement and investment account balances. Populate one account row per included account.
- Connected net worth is intentionally `connected cash + retirement - connected debt`. Do not add unlinked home values, vehicle estimates, or other estimated assets.
- Recent Activity covers exactly seven calendar dates through today using eligible posted outflows. Include a `dailySpend` row for every date, using `0` when no eligible spending occurred. Include the five largest eligible outflows as `items`. The summary must state the date range and that transfers and debt-payment movements were excluded. Do not compare it with the previous check-in.
- `refreshedAt` is the current ISO timestamp after collection and validation finish.

## Issues and partial refreshes

- `issues` must be empty when every section refreshed successfully with reliable current data.
- Add an issue only when a relevant account or required source is failed, disconnected, unavailable, unusable, or cannot be safely reconciled.
- Do not create issues for ordinary provider timing, routine timestamp differences, the Partners reserve rule, or the intentional Bills sub-bucket limitation.
- Each issue must be one short plain-English sentence naming the affected account or section and explaining what could not be refreshed.
- If one section cannot be refreshed, preserve only that section's previous saved values, refresh every other section, and state exactly what was preserved.
- Never invent a replacement value.
- `refreshedAt` describes this refresh run. It does not make preserved values current.

## Quality gate

Before writing, verify all of the following:

- Every relevant linked account is represented exactly once in the appropriate section or named in `issues`.
- Cash, debt, retirement, Bills, savings, and connected net worth totals reconcile mathematically.
- No account or investment holding is double-counted.
- Protected and available cash reconcile to the underlying cash accounts and reserve rules.
- Debt values are positive amounts owed and include zero-balance cards.
- Recent Activity contains exactly seven dated daily rows and excludes transfers, debt payments, pending transactions, and income.
- Household configuration was preserved without carrying forward stale financial values.
- The candidate matches the current frontend contract from GitHub.

If the snapshot cannot pass validation, do not write a partial or unreconciled replacement. Report the blocker clearly.

## Save and verify

Update the existing `public.ledger_entries` row where `entry_key = 'fl-financial-check-in-latest'`:

- Replace its `value` JSON with the validated snapshot.
- Set `updated_at = now()`.
- Preserve the existing row ID, `household_id`, and `entry_key`.
- Do not create a new row.

Read the row back once. Verify the saved JSON, `updated_at`, totals, issues, and `refreshedAt` match the validated candidate.

## Final response

Reply only with a short confirmation that the Financial Check-In was refreshed in Supabase. If `issues` is not empty, include those exact issue sentences. Do not provide a change log or comparison.
