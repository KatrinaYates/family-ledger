import React from 'react';
import { ContentShell, WashiTape, WASHI_TAPE_COLORS, Illustration, ILLUSTRATION_NAMES } from '../LedgerComponents';
import {
  MetricKpiRow,
  MetricKpi,
  StickyCard,
  AmountList,
  DashedList,
  StatPills,
  DetailRows,
  InsightList,
  SymbolRows,
  QuestionList,
  WarningBanner,
  RankedTable,
  ChangeTable,
  ToneChip,
  PanelCard,
  ContributionBlock,
  SectionPageHeader,
  NOTEBOOK_SYMBOLS,
  NOTEBOOK_TONE_REGISTRY,
  STICKY_CARD_TONES,
  STATUS_BADGE_VARIANTS,
  MonthLockPanel,
  NotebookButton,
  AllocationTable,
  DebtGroups,
  TopicBand,
  PanelHeading,
  ScrollBody,
  ActionTable,
  SummaryPanel,
  StatusBadge,
  PageContinuedHint,
  PanelOkLine,
  ExpandableContextNote,
  PromptField,
  PromptActionPanel,
} from '../content/NotebookPrimitives';
import {
  KitSection,
  KitSample,
  KitVariant,
  KitSymbolCatalog,
  SectionBlock,
  PanelSurface,
  PanelModule,
  MoneyBlockGrid,
  ComposedMoneyGrid,
  BarChart,
  SegmentBar,
  DecorativeStickyNote,
  CardGrid,
} from './KitComponents';
import {
  KitChecklistSample,
  KitBulletListSample,
  KitQuestionListSample,
  KitActionTableSample,
  KitPromptFieldSample,
  KitExpandableContextSample,
  KitPromptActionSample,
  KitMonthLockSample,
  KitLockStatusPreview,
} from './KitInteractiveSamples';

function LayoutDemoCard({ label }) {
  return (
    <PanelSurface label={label}>
      <p className="panel-note">Equal-width column.</p>
    </PanelSurface>
  );
}

const KIT_NAV = [
  { id: 'tokens', label: 'Design tokens' },
  { id: 'shell', label: 'Page shell' },
  { id: 'layout', label: 'Layout grids' },
  { id: 'surfaces', label: 'Panels' },
  { id: 'metrics', label: 'Metrics & charts' },
  { id: 'content', label: 'Content blocks' },
  { id: 'tables', label: 'Tables' },
  { id: 'forms', label: 'Forms & workflow' },
  { id: 'states', label: 'States' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'accent', label: 'Accent & decorative' },
];

const BAR_SAMPLE = [
  { name: 'Housing', amount: '$2,410', percent: 34, barWidth: 88 },
  { name: 'Groceries', amount: '$892', percent: 13, barWidth: 34 },
  { name: 'Kids activities', amount: '$640', percent: 9, barWidth: 24 },
];

const FUNDING_BAR_SAMPLE = [
  { name: 'Cherokee', currentLabel: '$4,041.25', targetLabel: '$4,400.00', percent: 92, status: 'Short' },
  { name: 'House', currentLabel: '$1,200.00', targetLabel: '$1,200.00', percent: 100, status: 'Funded' },
];

const SEGMENT_SAMPLE = [
  { key: 'debt', label: 'Connected debt', valueLabel: '$60,028.10', percent: 72, tone: 'coral', solid: true },
  { key: 'equity', label: 'Net equity', valueLabel: '$22,987.51', percent: 28, tone: 'teal' },
];

const KPI_SAMPLE = [
  { icon: NOTEBOOK_SYMBOLS.cash, label: 'Cash on hand', value: '$8,420', chip: { text: 'On track', tone: 'good' } },
  { icon: NOTEBOOK_SYMBOLS.growth, label: 'Net worth', value: '$142,800', chip: { text: '↑ 2.1%', tone: 'green' } },
  { icon: NOTEBOOK_SYMBOLS.target, label: 'Starter fund', value: '$413.93 / $1,000', chip: { text: 'Watch', tone: 'watch' } },
];

const SYMBOL_ROW_SAMPLE = [
  { icon: NOTEBOOK_SYMBOLS.target, title: 'Why this matters', text: 'Paying down highest-rate debt frees cash flow sooner.' },
  { icon: NOTEBOOK_SYMBOLS.win, title: 'Potential benefit', text: 'Save ~$340/yr in interest at current APR.' },
  { icon: NOTEBOOK_SYMBOLS.focus, title: 'Difficulty', text: 'Medium — requires pausing one discretionary category.' },
];

export function NotebookKitPage() {
  return (
    <ContentShell className="notebook-kit-page">
      <SectionPageHeader
        eyebrow="Design reference"
        title="Notebook Kit"
        subtitle="Reusable building blocks organized by use case. Compose any page from variants — no page-specific components. Blocks default to half content width (50cqw); use layout grids for side-by-side or full-width exceptions."
      />
      <nav className="notebook-kit-nav" aria-label="Kit sections">
        {KIT_NAV.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="notebook-kit-nav-link">
            {item.label}
          </a>
        ))}
      </nav>

      <KitSection
        id="tokens"
        title="Design tokens"
        description="Colors, typography, spacing, surfaces, widths, and tone registry — shared across all components."
      >
        <KitSample name="Colors · surfaces · spacing" usage="CSS custom properties in :root. paper-surface bg stays rgba(255,255,255,0.55).">
          <PanelSurface>
            <div className="notebook-kit-token-swatches">
              <span className="notebook-kit-swatch" style={{ background: 'var(--teal)' }}>--teal</span>
              <span className="notebook-kit-swatch" style={{ background: 'var(--deep)' }}>--deep</span>
              <span className="notebook-kit-swatch" style={{ background: 'var(--coral)' }}>--coral</span>
              <span className="notebook-kit-swatch" style={{ background: 'var(--paper)' }}>--paper</span>
            </div>
            <p className="panel-note">Spacing: --grid-gap {14}px · --panel-padding · --module-gap · Content width: 50cqw default, content-block-full-width for exceptions.</p>
          </PanelSurface>
        </KitSample>
        <KitSample name="NOTEBOOK_TONE_REGISTRY" usage="Maps tone names to StickyCard, ToneChip, ContributionBlock, and bar tones. Use NOTEBOOK_SYMBOLS for icons — not emoji.">
          <PanelSurface>
            <ul className="notebook-kit-tone-list">
              {NOTEBOOK_TONE_REGISTRY.map(({ key, label, chip, symbol }) => (
                <li key={key}>
                  <ToneChip tone={chip}>{key}</ToneChip>
                  <span className="notebook-symbol" aria-hidden="true">{NOTEBOOK_SYMBOLS[symbol]}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </PanelSurface>
        </KitSample>
        <KitSample name="Typography" usage="--font-heading, --font-data, --font-script (Caveat for checkmarks). Min sizes: --text-data-min 16px, --text-support-min 14px.">
          <PanelSurface>
            <p className="panel-note" style={{ fontFamily: 'var(--font-heading)', fontSize: '22px' }}>Heading sample — DM Sans</p>
            <p className="panel-note" style={{ fontFamily: 'var(--font-data)' }}>Data / body sample — 16px minimum for ledger values.</p>
          </PanelSurface>
        </KitSample>
      </KitSection>

      <KitSection
        id="shell"
        title="Page shell"
        description="Top-of-page chrome and section structure — every meeting section starts here."
      >
        <KitSample
          name="SectionPageHeader"
          usage="One per page. eyebrow · title · subtitle. Optional badge via StatusBadge."
        >
          <KitVariant label="Default">
            <SectionPageHeader
              eyebrow="July 2026 · Section 01"
              title="Monthly Snapshot"
              subtitle="What changed in July, plus where we finished the month."
            />
          </KitVariant>
          <KitVariant label="With badge">
            <SectionPageHeader
              eyebrow="Financial Check-In"
              title="Current snapshot"
              subtitle="Connected balances as of today."
              badge="Saved snapshot"
              badgeVariant="final"
            />
          </KitVariant>
        </KitSample>
        <KitSample name="SectionBlock" usage="Uppercase section h2 + content — wrap every in-page block.">
          <SectionBlock label="Section title">
            <p className="panel-note">Content sits below the heading.</p>
          </SectionBlock>
        </KitSample>
        <KitSample name="StatusBadge · PageContinuedHint" usage="Header badge variants including talk (Decisions page).">
          <div className="notebook-kit-chip-row">
            {STATUS_BADGE_VARIANTS.map((variant) => (
              <StatusBadge key={variant} variant={variant}>{variant}</StatusBadge>
            ))}
          </div>
          <PageContinuedHint>Continued on next page →</PageContinuedHint>
        </KitSample>
      </KitSection>

      <KitSection
        id="layout"
        title="Layout grids"
        description="CSS composition classes — not page-specific. Use CardGrid or notebook-card-grid--N for equal columns."
      >
        <KitSample
          name="Layout grids"
          usage="snapshot-grid-main (main + sidebar) · CardGrid columns={2|3|4} · spending-split-row (2 SectionBlocks) · story-split-grid (2 PanelCards) · content-block-full-width."
        >
          <KitVariant label="CardGrid layout=mainSidebar">
            <CardGrid layout="mainSidebar">
              <PanelSurface label="Main"><p className="panel-note">Primary column (1.65fr).</p></PanelSurface>
              <aside className="snapshot-side">
                <DecorativeStickyNote tone="lav" title="Sidebar">Sidebar column (0.8fr).</DecorativeStickyNote>
              </aside>
            </CardGrid>
          </KitVariant>
          <KitVariant label="snapshot-grid-main — alias">
            <div className="snapshot-grid-main notebook-kit-layout-demo">
              <PanelSurface label="Main"><p className="panel-note">Primary content column (~65%).</p></PanelSurface>
              <aside className="snapshot-side">
                <DecorativeStickyNote tone="lav" title="Sidebar">Notes and prompts (~35%).</DecorativeStickyNote>
              </aside>
            </div>
          </KitVariant>
          <KitVariant label="CardGrid · 2 across">
            <CardGrid columns={2}>
              <LayoutDemoCard label="Card 1" />
              <LayoutDemoCard label="Card 2" />
            </CardGrid>
          </KitVariant>
          <KitVariant label="CardGrid · 3 across">
            <CardGrid columns={3}>
              <StickyCard variant="priority" label="Win" tone="win">Paid extra toward highest-rate card.</StickyCard>
              <StickyCard variant="priority" label="Focus" tone="focus">Dining ran over soft cap.</StickyCard>
              <StickyCard variant="priority" label="Context" tone="context">Summer camp deposits clustered.</StickyCard>
            </CardGrid>
          </KitVariant>
          <KitVariant label="CardGrid · 4 across">
            <CardGrid columns={4}>
              <LayoutDemoCard label="KPI 1" />
              <LayoutDemoCard label="KPI 2" />
              <LayoutDemoCard label="KPI 3" />
              <LayoutDemoCard label="KPI 4" />
            </CardGrid>
          </KitVariant>
          <KitVariant label="spending-split-row — 2 SectionBlocks">
            <div className="spending-split-row notebook-kit-layout-demo">
              <SectionBlock label="Left"><PanelSurface><p className="panel-note">Half width with section heading.</p></PanelSurface></SectionBlock>
              <SectionBlock label="Right"><PanelSurface><p className="panel-note">Half width with section heading.</p></PanelSurface></SectionBlock>
            </div>
          </KitVariant>
          <KitVariant label="story-split-grid — 2 PanelCards">
            <div className="story-split-grid notebook-kit-layout-demo">
              <PanelCard title="Left panel"><p className="panel-note">Paired titled cards.</p></PanelCard>
              <PanelCard title="Right panel"><p className="panel-note">Paired titled cards.</p></PanelCard>
            </div>
          </KitVariant>
          <KitVariant label="content-block-full-width">
            <div className="content-block-full-width notebook-kit-layout-demo">
              <PanelSurface><p className="panel-note">Full-width exception — ActionTable, MonthLockPanel.</p></PanelSurface>
            </div>
          </KitVariant>
        </KitSample>
      </KitSection>

      <KitSection
        id="surfaces"
        title="Panels"
        description="Card chrome and grouped modules — PanelSurface for flat panels, PanelCard when you need a title/total header."
      >
        <KitSample name="PanelSurface" usage="Paper-surface card. Omit label when SectionBlock already titles the section; add label prop for module title.">
          <KitVariant label="Unlabeled">
            <PanelSurface><p className="panel-note">Tables, stacks, or PanelModules inside.</p></PanelSurface>
          </KitVariant>
          <KitVariant label="Labeled">
            <PanelSurface label="Module label"><p className="panel-note">Single-topic labeled panel.</p></PanelSurface>
          </KitVariant>
        </KitSample>
        <KitSample
          name="PanelModule"
          usage="Labeled row inside a shared PanelSurface. Pair with PanelOkLine, InsightList, or ExpandableContextNote."
        >
          <PanelSurface>
            <PanelModule label="Patterns worth noticing">
              <PanelOkLine>No unusual patterns this month</PanelOkLine>
            </PanelModule>
            <PanelModule label="Patterns with detail">
              <InsightList items={[{
                id: 'target',
                title: 'Target ran higher than usual',
                detail: '4 transactions totaling $312.18 vs $186.40 in June.',
                support: 'Back-to-school supply runs drove most of the increase.',
              }]}
              />
            </PanelModule>
            <PanelModule label="Review row + context">
              <span className="spending-watch-review-name">Target · $312.18</span>
              <KitExpandableContextSample />
            </PanelModule>
          </PanelSurface>
        </KitSample>
        <KitSample name="PanelCard · SummaryPanel" usage="PanelCard: title + optional total + body. SummaryPanel: PanelCard-style shell with SymbolRows + optional footer.">
          <KitVariant label="PanelCard + DashedList">
            <PanelCard title="Cash accounts" total="$8,420">
              <DashedList items={[
                { name: 'Checking', amount: '$2,100' },
                { name: 'Savings', amount: '$6,320' },
              ]}
              />
            </PanelCard>
          </KitVariant>
          <KitVariant label="SummaryPanel">
            <SummaryPanel title="Recommendation detail" rows={SYMBOL_ROW_SAMPLE}>
              <WarningBanner compact label={null}>Assumes minimum payments only.</WarningBanner>
            </SummaryPanel>
          </KitVariant>
        </KitSample>
      </KitSection>

      <KitSection
        id="metrics"
        title="Metrics & charts"
        description="Headline numbers, status chips, and progress bars."
      >
        <KitSample name="MetricKpi · ContributionBlock" usage="KPI row for glance metrics; ContributionBlock for month-over-month parts (solo or items row).">
          <MetricKpiRow items={KPI_SAMPLE} className="notebook-kit-kpi-row" />
          <ContributionBlock items={[
            { icon: NOTEBOOK_SYMBOLS.win, label: 'Retirement', value: '+$1,421.82', tone: 'win' },
            { icon: NOTEBOOK_SYMBOLS.emergency, label: 'Emergency fund', value: '+$77.00', tone: 'safety' },
            { icon: NOTEBOOK_SYMBOLS.family, label: 'Kids savings', value: '+$32.00', tone: 'family' },
          ]}
          />
        </KitSample>
        <KitSample name="MoneyBlockGrid · ComposedMoneyGrid · StatPills" usage="MoneyBlockGrid: prior → current → change. ComposedMoneyGrid: parts + … + total (Future progress). StatPills: ending-position capsules.">
          <MoneyBlockGrid
            prior={{ label: 'Last month', value: '$6,700' }}
            current={{ label: 'This month', value: '$7,120' }}
            change={{ label: 'Change', value: '+$420', subtitle: '+6.3%', tone: 'tone-spending-up' }}
          />
          <ComposedMoneyGrid
            parts={[
              { label: 'Retirement', value: '+$1,421.82', tone: 'win' },
              { label: 'Kids savings', value: '+$77.00', tone: 'family' },
              { label: 'Emergency fund', value: '+$10.86', tone: 'safety' },
              { label: 'Debt payments', value: '$1,579.39', tone: 'focus' },
            ]}
            total={{ value: '$3,089.07', caption: 'moved toward our future this month' }}
          />
          <StatPills
            label="End of July"
            items={[
              { label: 'Cash', value: '$8,420', tone: 'safety' },
              { label: 'Debt', value: '$59,281', tone: 'focus' },
            ]}
          />
        </KitSample>
        <KitSample name="ToneChip" usage="Inline status — KPI chips, account tags, lock panel Protected chip.">
          <div className="notebook-kit-chip-row">
            {['good', 'watch', 'assigned', 'protected', 'available'].map((tone) => (
              <ToneChip key={tone} tone={tone}>{tone}</ToneChip>
            ))}
          </div>
        </KitSample>
        <KitSample name="BarChart · SegmentBar" usage="BarChart variant group (spending, funding) or solo (target progress). SegmentBar for stacked composition.">
          <BarChart variant="group" items={BAR_SAMPLE} />
          <BarChart variant="group" items={FUNDING_BAR_SAMPLE} showPercent />
          <BarChart variant="solo" percent={42} label="Emergency fund" fillTone="tone-teal" />
          <PanelSurface>
            <SegmentBar segments={SEGMENT_SAMPLE} ariaLabel="Composition sample" />
          </PanelSurface>
        </KitSample>
      </KitSection>

      <KitSection
        id="content"
        title="Content blocks"
        description="Prose and list patterns — pick by density: one-line (DetailRows), paragraph (SymbolRows), narrative (InsightList)."
      >
        <KitSample
          name="DetailRows · SymbolRows · InsightList"
          usage="DetailRows: label + one value (layout=stack default, layout=inline for side-by-side stats). SymbolRows: icon + title + paragraph. InsightList: title + detail + support with accent."
        >
          <PanelSurface>
            <DetailRows rows={[
              { label: 'Biggest win', value: 'Starter fund crossed $400' },
              { label: 'Debt reduced', value: '$1,579 paid' },
            ]}
            />
          </PanelSurface>
          <SymbolRows rows={SYMBOL_ROW_SAMPLE} />
          <InsightList items={[{
            id: 'starbucks',
            title: 'Starbucks rebounded from June',
            detail: '3 transactions totaling $201.40 in July.',
            support: 'July looks more like a return to normal.',
          }]}
          />
        </KitSample>
        <KitSample name="DashedList · AmountList · DebtGroups" usage="DashedList: name/amount rows. AmountList: ledger math. DebtGroups: two DashedLists (loans | cards) — composition, not a new primitive.">
          <PanelSurface>
            <DashedList items={[
              { name: 'Chase checking', amount: '$2,100.00' },
              { name: 'Ally savings', amount: '$6,320.00' },
            ]}
            />
            <AmountList
              heading="$2,077.82 moved toward future"
              items={[
                { label: 'Retirement', value: '$1,421.82' },
                { label: 'Kids savings', value: '$77.00' },
              ]}
              total="$2,077.82"
            />
            <DebtGroups
              loans={[{ name: 'Cherokee auto', amount: '$4,041.25' }]}
              creditCards={[{ name: 'Chase Sapphire', amount: '$2,410.00' }]}
            />
          </PanelSurface>
        </KitSample>
        <KitSample name="QuestionList" usage="Talk-together prompts. editable + storageKey for Q&A; read-only for display.">
          <KitVariant label="Read-only">
            <PanelSurface>
              <QuestionList items={[
                'Do we still want to stop the emergency fund at $1,000?',
                'Should we raise the kids\' monthly transfer?',
              ]}
              />
            </PanelSurface>
          </KitVariant>
          <KitVariant label="Editable">
            <PanelSurface><KitQuestionListSample /></PanelSurface>
          </KitVariant>
        </KitSample>
        <KitSample name="Notebook lists" usage="EditableChecklist · EditableBulletList — presentation components with local state in kit.">
          <KitVariant label="Checklist">
            <PanelSurface><KitChecklistSample /></PanelSurface>
          </KitVariant>
          <KitVariant label="Bullet list">
            <PanelSurface><KitBulletListSample /></PanelSurface>
          </KitVariant>
        </KitSample>
        <KitSample name="TopicBand" usage="Symbol header + checklist for any topic. tone or icon prop; checks for read-only; children for editable list.">
          <KitVariant label="Read-only · tone target">
            <TopicBand
              tone="target"
              label="Before we lock"
              title="Readiness checklist"
              description="Confirm these are true before locking the month."
              checks={['Action items reviewed', 'Missing data resolved', 'Decisions captured']}
            />
          </KitVariant>
          <KitVariant label="Editable · tone talk">
            <TopicBand
              tone="talk"
              label="Open items"
              title="Parking lot"
              description="Capture anything to revisit next month."
            >
              <KitChecklistSample />
            </TopicBand>
          </KitVariant>
        </KitSample>
        <KitSample name="ExpandableContextNote" usage="Inline add/edit note on any row — pair with PersistedEditableChecklist when persisting.">
          <ExpandableContextNote value="" onChange={() => {}} addLabel="Add context" />
          <KitExpandableContextSample />
        </KitSample>
      </KitSection>

      <KitSection
        id="tables"
        title="Tables"
        description="Tabular data — all wrap in PanelSurface except ActionTable (full width)."
      >
        <KitSample name="RankedTable · ChangeTable (optional) · AllocationTable" usage="RankedTable and ChangeTable are optional primitives — use when tabular data fits. AllocationTable is used live in Check-In.">
          <PanelSurface>
            <RankedTable
              columns={['#', 'Category', 'Amount']}
              rows={[
                { key: '1', cells: ['1', 'Housing', '$2,410'] },
                { key: '2', cells: ['2', 'Groceries', '$892'] },
              ]}
            />
            <ChangeTable
              priorLabel="June"
              currentLabel="July"
              rows={[
                { category: 'Dining', prior: '$420', current: '$610', change: '+$190' },
              ]}
            />
            <AllocationTable
              rows={[
                { name: 'Chase checking', amount: '$2,100.00', tag: 'available', tagLabel: 'Available' },
                { name: 'Rainy day fund', amount: '$413.93', tag: 'assigned', tagLabel: 'Assigned · emergency' },
              ]}
            />
          </PanelSurface>
        </KitSample>
        <KitSample
          name="ActionTable"
          usage="Owner/status dropdowns + due date. Full width: content-block-full-width > PanelSurface > PanelHeading + ScrollBody (capped) + table."
        >
          <div className="content-block-full-width">
            <PanelSurface className="panel-stack actions-table-panel">
              <PanelHeading title="Action plan" />
              <ScrollBody label="Action items" capped>
                <ActionTable
                  readOnly
                  showRemove={false}
                  rows={[
                    { id: '1', action: 'Cancel unused streaming trial', owner: 'Person A', dueDate: '2026-08-15', status: 'not_started' },
                    { id: '2', action: 'Move $50 to kids savings', owner: 'Both', dueDate: '2026-08-01', status: 'done' },
                  ]}
                />
              </ScrollBody>
            </PanelSurface>
          </div>
          <KitActionTableSample />
        </KitSample>
      </KitSection>

      <KitSection
        id="forms"
        title="Forms & workflow"
        description="Inputs, actions, and month lock — reusable on any page that needs capture or workflow control."
      >
        <KitSample name="PromptField · NotebookButton" usage="Labeled textarea; primary/secondary pill buttons.">
          <PanelSurface><KitPromptFieldSample /></PanelSurface>
          <div className="prompt-action-buttons">
            <NotebookButton variant="primary">Primary action →</NotebookButton>
            <NotebookButton variant="secondary">Secondary</NotebookButton>
            <NotebookButton variant="secondary" disabled>Disabled</NotebookButton>
          </div>
        </KitSample>
        <KitSample name="PromptActionPanel" usage="PromptField + dual actions — advisor ask, copy-prompt flows.">
          <KitPromptActionSample />
        </KitSample>
        <KitSample name="MonthLockPanel · MonthLockStatus" usage="Lock panel: two-step confirm. Status badge: toolbar shortcut — same symbols.">
          <KitMonthLockSample />
          <KitLockStatusPreview />
        </KitSample>
        <KitSample name="WarningBanner" usage="Data caveats only — not interpretation (use StickyCard). compact prop for nested footers.">
          <WarningBanner>Principal change unavailable — June 30 baseline was not captured.</WarningBanner>
          <WarningBanner compact label={null}>Assumes minimum payments only.</WarningBanner>
        </KitSample>
      </KitSection>

      <KitSection
        id="states"
        title="States"
        description="Empty, loading, error, locked, missing-data, and warning patterns."
      >
        <KitSample name="Empty · missing data" usage="When enrichment returns null — use panel-note or StickyCard tone missing.">
          <PanelSurface>
            <p className="panel-note">No notable one-time purchases this month.</p>
          </PanelSurface>
          <StickyCard label="Not captured" tone="missing" variant="priority">Principal change unavailable for June.</StickyCard>
        </KitSample>
        <KitSample name="Loading · error" usage="ActionPlan and persisted lists show field-save-error on failure.">
          <p className="action-plan-loading">Loading action items…</p>
          <p className="field-save-error" role="alert">Could not save — try again.</p>
        </KitSample>
        <KitSample name="Locked · read-only" usage="EditableChecklist with readOnly — checkboxes disabled, no add/remove.">
          <PanelSurface>
            <KitChecklistSample />
          </PanelSurface>
          <p className="panel-note">In production, PersistedEditableChecklist sets readOnly when month is locked.</p>
        </KitSample>
        <KitSample name="Warning" usage="WarningBanner for data caveats; StickyCard for interpretation.">
          <WarningBanner>Principal change unavailable — June 30 baseline was not captured.</WarningBanner>
        </KitSample>
      </KitSection>

      <KitSection
        id="recipes"
        title="Composition recipes"
        description="Documentation-only combinations — not separate React components. Compose pages from these patterns."
      >
        <KitSample name="Goal card" usage="PanelCard / StickyCard + NOTEBOOK_SYMBOLS + MetricKpi + BarChart variant=solo + optional DetailRows.">
          <StickyCard label="Emergency fund" tone="safety" fill>
            <strong className="future-goal-metric">$413.93</strong>
            <span className="future-goal-metric-sub"> / $1,000</span>
            <BarChart variant="solo" percent={41} fillTone="tone-teal" embedded />
          </StickyCard>
        </KitSample>
        <KitSample name="Future progress (month snapshot)" usage="Single MetricKpi in at-a-glance row — full breakdown lives on the Future page (ComposedMoneyGrid).">
          <MetricKpi icon={NOTEBOOK_SYMBOLS.win} label="Future progress" value="$3,089.07" chip={{ text: 'This month', tone: 'protected' }} />
        </KitSample>
        <KitSample name="Spending watch dashboard" usage="SectionBlock + PanelSurface + multiple PanelModule + PanelOkLine / InsightList / ExpandableContextNote.">
          <SectionBlock label="Spending watch">
            <PanelSurface>
              <PanelModule label="Patterns worth noticing">
                <PanelOkLine>No unusual patterns this month</PanelOkLine>
              </PanelModule>
              <PanelModule label="Fees">
                <InsightList items={[{ id: 'atm', title: 'ATM fees', detail: '$12.00 across 2 withdrawals.' }]} />
              </PanelModule>
            </PanelSurface>
          </SectionBlock>
        </KitSample>
        <KitSample name="CFO priority tier" usage="PanelSurface + CardGrid mainSidebar + SummaryPanel + PanelCard + PersistedEditableDecisionList.">
          <PanelSurface>
            <CardGrid layout="mainSidebar">
              <SummaryPanel title="Recommendation detail" rows={SYMBOL_ROW_SAMPLE} />
              <PanelCard title="Decisions to make">
                <p className="panel-note">EditableDecisionList with persistence in meeting layer.</p>
              </PanelCard>
            </CardGrid>
          </PanelSurface>
        </KitSample>
        <KitSample name="Check-in position card" usage="PanelCard + DetailRows layout=inline + BarChart variant=solo size=compact embedded.">
          <PanelCard title="Cash position">
            <DetailRows
              layout="inline"
              rows={[{ label: 'Available', value: '$2,100' }, { label: 'Assigned', value: '$6,320' }]}
            />
            <BarChart variant="solo" percent={72} label="Bills funded" fillTone="tone-teal" embedded size="compact" />
          </PanelCard>
        </KitSample>
      </KitSection>

      <KitSection
        id="accent"
        title="Accent & decorative"
        description="Tinted cards, sticky notes, symbols, and illustrations — max one decorative accent per section."
      >
        <KitSample name="StickyCard" usage="variant default (compact label) or priority (heading label). tone prop for wash color.">
          <KitVariant label="default">
            <div className="notebook-kit-sticky-grid">
              {STICKY_CARD_TONES.map((tone) => (
                <StickyCard key={tone} label={tone} tone={tone} prose><p>Sample {tone} interpretation.</p></StickyCard>
              ))}
            </div>
          </KitVariant>
          <KitVariant label="priority">
            <div className="month-snapshot-priority-grid">
              <StickyCard variant="priority" label="Biggest win" tone="win">Paid an extra $200 toward the highest-rate card.</StickyCard>
              <StickyCard variant="priority" label="Needs attention" tone="focus">Dining out ran $180 over cap.</StickyCard>
            </div>
          </KitVariant>
        </KitSample>
        <KitSample name="DecorativeStickyNote" usage="Sidebar/footer accents — washi tape auto-matches tone.">
          <div className="notebook-kit-sticky-note-row">
            <DecorativeStickyNote tone="green">Progress over perfection.</DecorativeStickyNote>
            <DecorativeStickyNote tone="pink">A joyful place for our monthly money meetings. ♡</DecorativeStickyNote>
            <DecorativeStickyNote tone="yellow" title="Quick notes">Travel in May · Laptop fund</DecorativeStickyNote>
          </div>
        </KitSample>
        <KitSample name="NOTEBOOK_SYMBOLS · WashiTape · Illustrations" usage="Symbol catalog for KPIs and bands; washi for sticky notes; illustrations max one per section.">
          <PanelSurface label="Symbols">
            <KitSymbolCatalog />
          </PanelSurface>
          <PanelSurface label="Washi tape">
            <div className="notebook-kit-washi-row">
              {Object.keys(WASHI_TAPE_COLORS).map((color) => (
                <div key={color} className="notebook-kit-washi-swatch">
                  <WashiTape color={color} />
                  <span className="notebook-kit-washi-label">{color}</span>
                </div>
              ))}
            </div>
          </PanelSurface>
          <PanelSurface label="Illustrations">
            <div className="notebook-kit-illustration-grid">
              {ILLUSTRATION_NAMES.map((name) => (
                <figure key={name} className="notebook-kit-illustration-item">
                  <Illustration name={name} className="notebook-kit-illustration" />
                  <figcaption className="notebook-kit-illustration-label">{name}</figcaption>
                </figure>
              ))}
            </div>
          </PanelSurface>
        </KitSample>
      </KitSection>
    </ContentShell>
  );
}
