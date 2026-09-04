# Monthly Ledger Generation Runbook

This file is the canonical prompt for the recurring Family Ledger generation run. It is designed to run on the first day of a month and create the chapter for the calendar month that just ended.

## Scheduled-task instruction

Use the connected GitHub, Supabase, and Finances apps. Read this entire file from the `main` branch of `KatrinaYates/family-ledger`, then follow it exactly. Do not edit the repository during a monthly run.

## Mission

Create one complete monthly Family Ledger chapter from verified financial data. ChatGPT performs the analysis and writes a render-ready source record to Supabase. The React application displays that record and automatically creates the visible month tab.

This is a data-generation run, not a software-development run.

## Dynamic dates

Use `America/New_York` for calendar boundaries.

- `RUN_DATE`: today.
- `TARGET_MONTH`: the most recently completed calendar month.
- `PREVIOUS_MONTH`: the calendar month immediately before `TARGET_MONTH`.
- `PERIOD_START`: first day of `TARGET_MONTH`.
- `PERIOD_END`: last day of `TARGET_MONTH`.
- `TARGET_MONTH_ID`: `YYYY-MM` for `TARGET_MONTH`.

Never hard-code August 2026 or any other month.

## Responsibility boundary

ChatGPT must:

- Query and reconcile the financial data.
- Write the monthly summaries and insights.
- Create quantified CFO recommendations and their supporting calculations.
- Create month-specific retrospective questions.
- Prepare visualization-ready numeric data.
- Prepare suggested action seeds.
- Insert the validated monthly record into Supabase.

The application must only normalize, format, display, and persist household-entered meeting responses and actions. Do not rely on the frontend to invent recommendations, projections, questions, or missing financial values.

## GitHub is read-only

Use the current `main` branch only to inspect:

- The active Supabase record contract and repository mapping.
- Current normalizers and enrichers.
- The monthly section registry.
- Current component expectations.
- Public sample records as shape examples only.

Do not create commits, branches, pull requests, files, or code changes during this run. Public sample data is not financial truth. The most recent locked Supabase month is the structural starting point, adjusted for the current code contract.

If the current code cannot safely render the required record, stop before writing to Supabase and report the exact code issue separately. Do not work around a code bug by distorting financial data.

## Preflight

Before analyzing or writing:

1. Confirm GitHub, Supabase, and Finances are connected and readable.
2. Confirm the Supabase project is active and healthy.
3. Resolve the household from the existing ledger records. Never guess a household ID.
4. Read the `ledger_months` schema and the repository mapping used by the current `main` branch.
5. Read the most recent locked month and preserve its broad `source_data` section structure.
6. Check whether `TARGET_MONTH_ID` already exists.

If the target month already exists:

- Do not overwrite, delete, or duplicate it.
- Report its workflow status and stop.
- A later revision requires explicit household approval and version-safe update handling.

## Financial collection rules

Query the complete target-month date range. Use posted transactions only and include transfers in the raw query so they can be classified rather than silently missed.

Respect the Finances amount convention:

- Negative amount: money flowing into an account.
- Positive amount: money flowing out of an account.

### Income

Start with all posted target-month transactions where `amount < 0`, with transfers included and no category filter. Classify actual income separately from refunds, reimbursements, account transfers, investment activity, and credit-card payment credits.

### Spending

Start with all posted target-month transactions where `amount > 0`. Exclude transfers, debt payments, investment purchases, and other non-spending movements from the spending total, but keep them in their appropriate ledger sections.

### Investments and retirement

Query target-month investment transactions separately. Distinguish contributions from market movement. A month-end retirement balance must be an exact target-month snapshot or the latest verified balance actually dated within the target month, with a clear caveat. Do not place later-month balances in the historical target-month totals.

### Debt and savings

Separate gross debt payments from net debt reduction. Separate contributions to savings from ending savings balances. Do not double-count transfers between household accounts as progress.

### Later information

Information dated after `PERIOD_END` may appear only in an optional read-only `meeting.currentUpdate` / “Since Month-End” block. Clearly label its date. Never blend it into the locked historical totals for `TARGET_MONTH`.

## Reconciliation requirements

Before authoring advice:

- Confirm transaction coverage for the full date range.
- Reconcile income, spending, transfers, debt payments, savings contributions, and investment contributions.
- Compare category and merchant trends with `PREVIOUS_MONTH` when comparable data exists.
- Record stale connections, missing accounts, partial histories, estimate limitations, and balance-date caveats in `data_quality` and the relevant source sections.
- Never fabricate a value to make a section look complete.

## Required database record

Build the complete record in memory and validate it before any write. Insert one new `ledger_months` row using only columns that exist in the live schema, including the current equivalents of:

```text
household_id
month_id
schema_version
version
workflow
generation
data_quality
source_data
```

Use:

- `month_id = TARGET_MONTH_ID`
- `schema_version` matching the current contract
- `version = 1` for a new month
- `workflow.status = "draft"`
- `workflow.sourceAsOf = PERIOD_END` or the exact verified source timestamp expected by the contract
- `workflow.reviewedAt = null`
- `workflow.lockedAt = null`
- `generation.source = "chatgpt"`
- `generation.version = 1`
- `generation.generatedAt =` the actual generation timestamp

Do not populate removed or obsolete columns such as `generated_analysis` or `meeting_data`. Do not lock the month.

## Required `source_data` sections

Preserve the active contract and include these top-level sections when supported by the current code:

```text
meta
snapshot
story
spending
future
cfo
retrospective
meeting
actions
celebrate
handoff
```

Use numeric values for calculations, charts, projections, balances, and recommendation impacts when the current contract supports numbers. Format currency only where the presentation contract explicitly expects formatted strings.

### Snapshot

Provide enough verified data for the approved Snapshot layout:

1. `${TARGET_MONTH_NAME.toUpperCase()} AT A GLANCE`
2. Exactly three top cards when values are available: `Income`, `Spending`, `Future progress`
3. `END OF ${TARGET_MONTH_NAME.toUpperCase()}`
4. Exactly two ending pills when values are available: `Cash`, `Net worth`

Do not use `Cash change`, `Debt change`, or `Net worth change` as top cards. Do not add a Debt ending pill. Keep month-change data in `snapshot.monthChanges` for the “How the month went” analysis, and keep detailed debt values in the debt/future sections.

`Future progress` means verified retirement contributions plus kids savings plus emergency/other savings contributions plus debt payments, without double-counting. It is not the same as net-worth growth or net debt reduction.

### Spending

Supply the structured spending fields expected by the current code, including totals, previous-month comparison, categories, merchant activity, meaningful changes, large or unusual purchases, recurring charges, fees, watch-worthy patterns, and the complete transaction rows used by the spending table.

Transaction rows must follow the current contract and include stable values for:

```text
date
name
category
account
amount
detail (optional)
```

Do not repeat the same observation across multiple cards. Prioritize useful patterns, significant changes, and items worth discussing.

### Future and payoff planning

Include savings, emergency fund, kids savings, retirement, upcoming expenses, debt detail, payoff order, and future direction when verified data supports them.

When any included debt has a balance greater than zero, a working debt payoff projection is required. Provide `future.debtPayoffPlan.planningSnapshot` in the current contract, including:

```text
asOf
baselineMonthlyBudget
baselineLabel
debts[]: id, name, balance, apr, minimum, priority
```

The snapshot must include every active debt intended for the household's payoff plan. Use numeric balances, minimum or regular payments, and payoff priorities. APR may be null when unavailable; the UI will disclose that it is modeled at 0%. Never invent an APR.

`baselineMonthlyBudget` must be a realistic, repeatable monthly debt budget that includes both:

- Every known minimum or regular payment for the included debts.
- The realistic extra amount available for the snowball.

It must be greater than or equal to the sum of `max(0, minimum)` for all included debts. Never use `0` for an unknown minimum unless the source confirms that no payment is required. Use a verified recent minimum or regular payment when available; otherwise use `null` and disclose the limitation.

Do not blindly use all target-month debt payments when they include a windfall, reimbursement, balance transfer, or one-time catch-up payment. Conversely, do not use only loan payments and omit credit-card minimums or the household's planned snowball amount.

For example, if known minimum and regular payments total `$2,031.09` and the household can repeatably add `$468.91`, set `baselineMonthlyBudget` to `2500` and explain that composition in `baselineLabel`.

Set `priority` to the household's intended payoff order and make `future.debtPayoffPlan.strategy` and `currentTarget` agree with it. Before insertion, validate the snapshot with the same rules as the frontend calculator. It is not valid if it produces a “monthly debt amount is below the included minimum payments” error, no projected payoff date, or no projected snowball schedule.

### CFO Advice

Provide no more than three recommendations, ranked by impact and realism. Each recommendation should contain, when supported:

- Stable ID, rank, and type.
- Direct action headline and instructions.
- Specific timeframe.
- Numeric amount freed or redirected.
- Exact debt, savings goal, or financial target.
- Current and projected position.
- Calculation/evidence.
- Assumptions and confidence/data-quality status.
- Optional visualization-ready numeric data.

Advice must be concrete, such as a realistic spending pause, subscription change, or next-month payment target tied to an actual dollar effect. Avoid generic advice like “spend less” or “review subscriptions.” Never invent savings or payoff effects.

### Retrospective

Create a short subtitle and a small set of month-specific `questionsToConsider`. Every question needs a stable ID, question text, optional factual context, and `allowResponse` when the UI should persist an answer. Do not fill in the household’s four main retrospective answers; those are completed during the meeting.

### Actions

Suggested action seeds must use the exact current seed shape:

```text
id
action
owner
dueDate
status
```

Use `action`, not `title`. Use the contract’s valid status value. Do not create busywork; only seed actions that directly support the month’s recommendations.

## Quality gate before insert

Do not write anything until the full candidate record passes all of these checks:

- Target month does not already exist.
- Date boundaries and labels match `TARGET_MONTH`.
- All required top-level sections are present or intentionally empty under the current contract.
- No later-month balances are mixed into historical totals.
- Income and spending signs are interpreted correctly.
- Transfers are not counted as income or spending.
- Future progress has no double-counting.
- Gross debt payments are not labeled as net debt reduction.
- When any included debt has a positive balance, `future.debtPayoffPlan.planningSnapshot` exists and includes every debt intended for the payoff plan.
- The debt projection budget is at least the sum of all included minimum or regular payments and includes a clearly labeled, realistic snowball amount when one is available.
- The debt projection successfully produces payoff summary metrics and a projected snowball schedule; calculator validation errors are fatal.
- Debt priorities, payoff strategy, and current target agree.
- CFO calculations reconcile to their evidence.
- Charts contain all required numeric inputs or are omitted.
- Retrospective questions and action seeds have stable IDs.
- No real financial data is sent to GitHub.

If a fatal coverage, reconciliation, permission, or contract problem exists, leave Supabase unchanged and report the blocker.

## Insert and verify

After the candidate passes validation:

1. Insert the new row as a draft.
2. Read the row back from Supabase.
3. Confirm its household, month ID, workflow, generation metadata, version, and source sections.
4. Confirm important totals and counts match the validated candidate.
5. Confirm the application can discover the month through the same query used by `listNavigableMonthIds` / the current repository equivalent.
6. Confirm the new month tab and all seven sections can render from the record:
   - Snapshot
   - Spending
   - Future
   - CFO Advice
   - Retrospective
   - Celebrate
   - Close the Month

The database row creates the month chapter; the existing React code renders the tab dynamically. If the row is valid but the tab does not appear, report a separate application bug. Do not edit code during this run.

## Final report

Return a concise report containing:

- Created month and Supabase row ID.
- Workflow status.
- Transaction and investment coverage counts.
- Reconciled income, spending, future progress, cash, debt, retirement, and net-worth figures, with caveats.
- CFO recommendation headlines and projected impacts.
- Any missing or stale data.
- Confirmation that the month tab is discoverable.
- Confirmation that the month remains draft and was not locked.
