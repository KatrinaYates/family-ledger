# Page migration backlog

Kit cleanup is complete. Do not migrate pages until the **90% test** passes on `#/notebook-kit`.

## Completed migrations

| Item | Notes |
|---|---|
| `FutureProgressKpi.jsx` | Removed — Month Snapshot uses `ComposedMoneyGrid` in its own section |
| `FutureAtAGlance.jsx` emoji maps | Uses `NOTEBOOK_SYMBOLS` via tone on `ComposedMoneyGrid` |
| Month Snapshot (`MonthOverviewPage`) | Redesigned — at-a-glance KPIs + StatPills; future progress separate section |
| Dead code cleanup (2026-03) | Removed `enrichMeeting.js`, unused `PersistedEditableDecisionList` / `MeetingTopicBand`, deprecated `EditableBulletList` wrapper; migrated `FutureGoals` to `SectionBlock`, check-in to `CardGrid` |
| Layout alias CSS removed | `.spending-block`, `.spending-panel-surface`, `.spending-watch-module`, `.spending-split-row`, `.snapshot-grid-main`, `.story-split-grid`, `.check-in-grid`, `.cfo-tier-*`, `.actions-page*`, `.handoff-page-*`, `.decisions-*`, `.celebrate-page` — kit demos scoped under `.notebook-kit-layout-demo` where needed |
| July sample trim | Dropped stale `meeting.prompts`, `meeting.sections`, `meeting.insight`, and unused `handoff.decisionsMade` / `handoff.openActionItems` |

## Deferred live-page fixes

| Item | Target migration |
|---|---|
| `FutureGoals.jsx` | Uses `BarChart variant="solo"` (updated during kit cleanup) |

## Page-named CSS to remove at migration

| CSS prefix | Replace with |
|---|---|
| `.month-snapshot-*` | Mostly migrated on Month Snapshot; audit remaining aliases |
| `.handoff-lock-control` | Could rename to `close-lock-control` when renaming `handoff` source key (optional) |

## Optional kit primitives

- **RankedTable** — optional; use when ranked tabular data fits
- **ChangeTable** — optional; spending change views at migration

## Deprecated meeting exports (still work, rename at migration)

- `EditableChecklist` → `PersistedEditableChecklist`
