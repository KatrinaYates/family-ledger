# Page migration backlog

Kit cleanup is complete. Do not migrate pages until the **90% test** passes on `#/notebook-kit`.

## Completed migrations

| Item | Notes |
|---|---|
| `FutureProgressKpi.jsx` | Removed — Month Snapshot uses `ComposedMoneyGrid` in its own section |
| `FutureAtAGlance.jsx` emoji maps | Uses `NOTEBOOK_SYMBOLS` via tone on `ComposedMoneyGrid` |
| Month Snapshot (`MonthOverviewPage`) | Redesigned — at-a-glance KPIs + StatPills; future progress separate section |

## Deferred live-page fixes

| Item | Target migration |
|---|---|
| `FutureGoals.jsx` | Uses `BarChart variant="solo"` (updated during kit cleanup) |
| `CfoPage` local `PriorityCard` | CFO page — recipe: `PanelSurface` + `CardGrid mainSidebar` + `SummaryPanel` |

## Page-named CSS to remove at migration

| CSS prefix | Replace with |
|---|---|
| `.spending-block` | `SectionBlock` / `.section-block` |
| `.spending-panel-surface` | `PanelSurface` / `.panel-surface` |
| `.spending-watch-module` | `PanelModule` / `.panel-module` |
| `.spending-split-row` | `CardGrid columns={2}` |
| `.story-split-grid` | `CardGrid columns={2}` |
| `.snapshot-grid-main` | `CardGrid layout="mainSidebar"` |
| `.check-in-grid` | `CardGrid columns={2}` |
| `.month-snapshot-*` | Mostly migrated on Month Snapshot; audit remaining aliases |
| `.cfo-tier-*` | CFO tier recipe |
| `.handoff-*`, `.close-readiness-*` | Close page recipes |

## Optional kit primitives

- **RankedTable** — optional; use when ranked tabular data fits
- **ChangeTable** — optional; spending change views at migration

## Deprecated meeting exports (still work, rename at migration)

- `EditableChecklist` → `PersistedEditableChecklist`
- `EditableBulletList` → `PersistedEditableBulletList`
- `EditableDecisionList` → `PersistedEditableDecisionList`
