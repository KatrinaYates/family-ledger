import React from 'react';
import { NOTEBOOK_SYMBOL_CATALOG, NOTEBOOK_SYMBOLS } from '../content/NotebookPrimitives';
import { WashiTape, STICKY_TONE_WASHI } from '../LedgerComponents';

/** Equal-width card row — 2, 3, or 4 columns. layout="mainSidebar" for asymmetric main + sidebar. */
export function CardGrid({ columns = 2, layout = 'equal', children, className = '' }) {
  if (layout === 'mainSidebar') {
    return (
      <div className={`notebook-card-grid notebook-card-grid--main-sidebar ${className}`.trim()}>
        {children}
      </div>
    );
  }

  const cols = [2, 3, 4].includes(columns) ? columns : 2;
  return (
    <div className={`notebook-card-grid notebook-card-grid--${cols} ${className}`.trim()}>
      {children}
    </div>
  );
}

/** Independent flex columns for cards with uneven heights. Each direct child is one vertical column. */
export function CardColumns({ children, className = '' }) {
  return (
    <div className={`notebook-card-columns ${className}`.trim()}>
      {children}
    </div>
  );
}

/** @param {{ label?: string, children?: React.ReactNode, className?: string }} props */
export function SectionBlock({ label, children, className = '' }) {
  return (
    <section className={`section-block ${className}`.trim()}>
      {label && <h2 className="section-heading">{label}</h2>}
      {children}
    </section>
  );
}

/** Flat notebook panel — standard cream card surface. Optional label uses module-label typography. */
export function PanelSurface({ label, children, className = '' }) {
  return (
    <div className={`paper-surface panel-surface ${className}`.trim()}>
      {label && <span className="panel-module__label">{label}</span>}
      {children}
    </div>
  );
}

/**
 * Labeled row inside a shared PanelSurface — dashboards, multi-topic panels.
 * Wrap several PanelModules in one PanelSurface.
 */
export function PanelModule({ label, children, className = '' }) {
  return (
    <div className={`panel-module ${className}`.trim()}>
      {label && <span className="panel-module__label">{label}</span>}
      {children}
    </div>
  );
}

/** @param {{ label: string, value: string, subtitle?: string, tone?: string, variant?: string }} props */
function MoneyCompareCell({ label, value, subtitle, tone = '', variant = '' }) {
  return (
    <div className={`money-compare-cell ${variant} ${tone}`.trim()}>
      <span className="money-compare-label">{label}</span>
      <strong className="money-compare-value">{value}</strong>
      {subtitle && (
        <span className="money-compare-subtitle">{subtitle}</span>
      )}
    </div>
  );
}

function MoneyCompareArrow() {
  return (
    <span className="money-compare-arrow" aria-hidden="true">
      →
    </span>
  );
}

/**
 * Prior → current → change in one paper-surface card with flow arrows.
 * @param {{ prior: { label: string, value: string }, current: { label: string, value: string }, change: { label: string, value: string, subtitle?: string, tone?: string }, className?: string }} props
 */
export function MoneyBlockGrid({ prior, current, change, className = '' }) {
  const { tone: changeTone = '', ...changeRest } = change;

  return (
    <div className={`paper-surface money-compare-strip ${className}`.trim()}>
      <MoneyCompareCell {...prior} />
      <MoneyCompareArrow />
      <MoneyCompareCell {...current} variant="money-compare-cell--current" />
      <MoneyCompareArrow />
      <MoneyCompareCell
        {...changeRest}
        tone={changeTone}
        variant="money-compare-cell--change"
      />
    </div>
  );
}

const COMPOSED_PART_ICONS = {
  win: NOTEBOOK_SYMBOLS.win,
  ready: NOTEBOOK_SYMBOLS.ready,
  safety: NOTEBOOK_SYMBOLS.safety,
  focus: NOTEBOOK_SYMBOLS.focus,
  family: NOTEBOOK_SYMBOLS.family,
  missing: NOTEBOOK_SYMBOLS.talk,
};

/** @param {{ label: string, value: string, tone?: string }} props */
function ComposedPartCell({ label, value, tone = 'win' }) {
  const icon = COMPOSED_PART_ICONS[tone] ?? NOTEBOOK_SYMBOLS.neutral;

  return (
    <div className={`money-composed-part tone-${tone}`.trim()}>
      <span className="money-composed-part-icon notebook-symbol" aria-hidden="true">{icon}</span>
      <span className="money-composed-part-label">{label}</span>
      <strong className="money-composed-part-value">{value}</strong>
    </div>
  );
}

function ComposedSeparator({ children, className = '' }) {
  return (
    <span className={`money-composed-separator ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  );
}

/**
 * Parts → total composition strip — variation of MoneyBlockGrid for summed breakdowns.
 * Each part flows into one headline total (Future progress, fund composition, etc.).
 * @param {{ parts: Array<{ label: string, value: string, tone?: string }>, total: { label?: string, value: string, caption?: string }, className?: string }} props
 */
export function ComposedMoneyGrid({ parts = [], total, className = '' }) {
  if (!parts.length || !total?.value) return null;

  const summary = parts
    .map((part) => `${part.label} ${part.value}`)
    .join(', ');

  return (
    <div
      className={`paper-surface money-composed-strip ${className}`.trim()}
      aria-label={`${total.value} total composed of ${summary}`}
    >
      <div className="money-composed-flow">
        {parts.map((part, index) => (
          <React.Fragment key={part.label}>
            {index > 0 && <ComposedSeparator>+</ComposedSeparator>}
            <ComposedPartCell {...part} />
          </React.Fragment>
        ))}
        <ComposedSeparator className="money-composed-separator--equals">=</ComposedSeparator>
        <div className="money-composed-total">
          {total.label && <span className="money-composed-total-label">{total.label}</span>}
          <strong className="money-composed-total-value">{total.value}</strong>
          {total.caption && (
            <span className="money-composed-total-caption">{total.caption}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Pill track with fill label inside the colored portion (bucket / funding bars). */
export function NotebookBarFill({
  percent,
  tone = 'tone-teal',
  label,
  className = '',
  ariaLabel,
  size = 'default',
}) {
  if (percent == null) return null;
  const safePercent = Math.min(100, Math.max(0, percent));
  const showLabel = label && safePercent >= 12;
  const sizeClass = size === 'compact' ? ' notebook-bar-track--compact' : '';

  return (
    <div
      className={`notebook-bar-track${sizeClass} ${className}`.trim()}
      role={ariaLabel ? 'progressbar' : undefined}
      aria-valuenow={ariaLabel ? safePercent : undefined}
      aria-valuemin={ariaLabel ? 0 : undefined}
      aria-valuemax={ariaLabel ? 100 : undefined}
      aria-label={ariaLabel}
    >
      <div
        className={[
          'notebook-bar-fill',
          tone,
          safePercent >= 100 ? 'is-full' : '',
        ].filter(Boolean).join(' ')}
        style={{ width: `${safePercent}%` }}
      >
        {showLabel && <span className="notebook-bar-fill-label">{label}</span>}
      </div>
    </div>
  );
}

/** Pill track with caption in the unfilled area (target progress bars). */
export function NotebookBarCaption({
  percent,
  tone = 'tone-teal',
  caption,
  className = '',
  ariaLabel,
  size = 'default',
}) {
  if (percent == null) return null;
  const safePercent = Math.min(100, Math.max(0, percent));
  const sizeClass = size === 'compact' ? ' notebook-bar-track--compact' : '';

  return (
    <div
      className={`notebook-bar-track notebook-bar-track--caption${sizeClass} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || caption}
    >
      <div
        className={['notebook-bar-fill', tone, safePercent >= 100 ? 'is-full' : ''].filter(Boolean).join(' ')}
        style={{ width: `${safePercent}%` }}
      />
      {caption && <span className="notebook-bar-caption">{caption}</span>}
    </div>
  );
}

/** Stacked capsule bar with dot legend — net worth, cash composition. */
export function SegmentBar({ segments = [], ariaLabel, className = '' }) {
  if (!segments.length) return null;

  const summary = segments
    .map((segment) => `${segment.label} ${segment.valueLabel} (${segment.percent}%)`)
    .join(', ');

  return (
    <div className={`notebook-bar-stack ${className}`.trim()}>
      <div
        className="notebook-bar-segments"
        role="img"
        aria-label={ariaLabel || summary}
      >
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={`notebook-bar-segment tone-${segment.tone}${segment.solid ? ' is-solid' : ''}`}
            style={{ width: `${segment.percent}%` }}
            title={`${segment.label}: ${segment.valueLabel} (${segment.percent}%)`}
          />
        ))}
      </div>
      <ul className="notebook-bar-legend" aria-hidden="true">
        {segments.map((segment) => (
          <li key={segment.key} className={`legend-item tone-${segment.tone}${segment.solid ? ' is-solid' : ''}`}>
            <span className="legend-swatch" />
            <span className="legend-label">{segment.label}</span>
            <strong className="legend-value">{segment.valueLabel}</strong>
            <span className="legend-percent">{segment.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function resolveBarTone({ fillTone, status, statusClass, progressTone }) {
  if (fillTone) return fillTone.startsWith('tone-') ? fillTone : `tone-${fillTone}`;
  if (progressTone) return `tone-${progressTone}`;
  if (status === 'Funded' || statusClass === 'is-funded') return 'tone-green';
  if (status === 'Short' || statusClass === 'is-short') return 'tone-coral';
  return 'tone-sun';
}

/** @param {{ name?: string, amount?: string, label?: string, currentLabel?: string, targetLabel?: string, percent?: number, barWidth?: number, fillTone?: string, status?: string, statusClass?: string, progressTone?: string, caption?: string }} props */
function BarChartRow({
  name,
  amount,
  label,
  currentLabel,
  targetLabel,
  percent,
  barWidth,
  fillTone,
  status,
  statusClass,
  progressTone,
  caption,
  showPercent = true,
  size = 'default',
}) {
  const rowLabel = name ?? label ?? 'Progress';
  const width = barWidth ?? percent;
  const displayPercent = percent ?? barWidth;
  const tone = resolveBarTone({ fillTone, status, statusClass, progressTone });
  const amountText = currentLabel && targetLabel
    ? `${currentLabel} / ${targetLabel}`
    : amount;
  const resolvedStatusClass = statusClass
    ?? (status === 'Funded' ? 'is-funded' : status === 'Short' ? 'is-short' : '');

  if (caption != null || (label && !name && !amountText && !status)) {
    return (
      <li className="notebook-bar-row">
        {rowLabel && rowLabel !== 'Progress' && (
          <div className="notebook-bar-row-meta notebook-bar-row-meta--solo">
            <span className="notebook-bar-name">{rowLabel}</span>
          </div>
        )}
        <NotebookBarCaption
          percent={width}
          tone={tone}
          caption={caption ?? (displayPercent != null ? `${displayPercent}%` : undefined)}
          size={size}
        />
      </li>
    );
  }

  return (
    <li className="notebook-bar-row">
      <div className="notebook-bar-row-meta">
        <span className="notebook-bar-name">{rowLabel}</span>
        {amountText != null && (
          <span className="notebook-bar-amount">{amountText}</span>
        )}
        {status && (
          <span className={`notebook-bar-status ${resolvedStatusClass}`.trim()}>{status}</span>
        )}
        {!status && showPercent && displayPercent != null && width == null && (
          <span className="notebook-bar-percent">{displayPercent}%</span>
        )}
      </div>
      {width != null && (
        <NotebookBarFill
          percent={width}
          tone={tone}
          label={showPercent && displayPercent != null ? `${displayPercent}%` : undefined}
        />
      )}
    </li>
  );
}

/**
 * Horizontal bar chart — group (category breakdown) or solo (single progress).
 * Use embedded on solo bars inside other panels.
 */
export function BarChart({
  variant,
  items,
  showPercent = true,
  percent,
  label = 'Progress',
  fillTone = '',
  embedded = false,
  size = 'default',
  className = '',
}) {
  const isGroup = variant === 'group' || (!variant && items?.length);
  const isSolo = variant === 'solo' || (!variant && percent != null && !items?.length);

  const content = (
    <ul className="notebook-bar-list spending-category-bars">
      {isGroup && items.map((item) => (
        <BarChartRow
          key={item.name ?? item.label}
          {...item}
          showPercent={showPercent}
        />
      ))}
      {isSolo && (
        <BarChartRow
          label={label}
          percent={Math.min(100, Math.max(0, percent))}
          barWidth={Math.min(100, Math.max(0, percent))}
          fillTone={fillTone || 'tone-teal'}
          caption={`${Math.min(100, Math.max(0, percent))}% of target`}
          showPercent={false}
          size={size}
        />
      )}
    </ul>
  );

  if (embedded) {
    return <div className={`bar-chart-solo ${className}`.trim()}>{content}</div>;
  }

  return (
    <div className={`paper-surface panel-surface bar-chart-card ${className}`.trim()}>
      {content}
    </div>
  );
}

/**
 * Decorative sticky note with washi tape accent.
 * Use on cover, sidebars, footers, and accent spots across section pages.
 * @param {{ tone?: string, washi?: boolean, washiColor?: string, title?: string, fill?: boolean, children?: React.ReactNode, className?: string }} props
 */
export function DecorativeStickyNote({
  tone = 'yellow',
  washi = true,
  washiColor,
  title,
  fill = false,
  children,
  className = '',
}) {
  const tapeColor = washiColor ?? STICKY_TONE_WASHI[tone] ?? 'pink';

  return (
    <div className={`decorative-sticky-note${fill ? ' is-fill' : ''} ${className}`.trim()}>
      <aside className={`sticky-note ${tone} is-inline is-decorative`.trim()}>
        {washi && <WashiTape color={tapeColor} />}
        {title && <strong className="decorative-sticky-note-title">{title}</strong>}
        <div className="decorative-sticky-note-body">{children}</div>
      </aside>
    </div>
  );
}

/**
 * Accessible collapsible panel using native disclosure semantics.
 * @param {{ title: string, summary?: string, count?: number, defaultOpen?: boolean, children?: React.ReactNode, className?: string }} props
 */
export function CollapsiblePanel({
  title,
  summary,
  count,
  defaultOpen = false,
  children,
  className = '',
}) {
  const summaryParts = [summary, count != null ? `(${count})` : null].filter(Boolean);

  return (
    <details className={`collapsible-panel paper-surface ${className}`.trim()} open={defaultOpen || undefined}>
      <summary className="collapsible-panel-summary">
        <span className="collapsible-panel-title">{title}</span>
        {summaryParts.length > 0 && (
          <span className="collapsible-panel-meta">{summaryParts.join(' ')}</span>
        )}
      </summary>
      <div className="collapsible-panel-body">{children}</div>
    </details>
  );
}

/** Sub-preview within a KitSample — label optional variant name. */
export function KitVariant({ label, children }) {
  return (
    <div className="kit-variant">
      {label && <p className="kit-variant-label">{label}</p>}
      {children}
    </div>
  );
}

/** Small "New" pill for recently added kit entries. */
export function KitNewBadge() {
  return <span className="kit-new-badge">New</span>;
}

/** Kit catalog section wrapper. */
export function KitSection({ id, title, description, children, isNew = false }) {
  return (
    <section className="kit-section" id={id} aria-labelledby={`${id}-heading`}>
      <header className="kit-section-header">
        <h2 className="kit-section-title" id={`${id}-heading`}>
          {title}
          {isNew && <KitNewBadge />}
        </h2>
        {description && <p className="kit-section-desc">{description}</p>}
      </header>
      <div className="kit-section-body">{children}</div>
    </section>
  );
}

/** Single component sample within the kit. */
export function KitSample({ name, usage, children, isNew = false }) {
  return (
    <article className="kit-sample">
      <header className="kit-sample-header">
        <h3 className="kit-sample-name">
          {name}
          {isNew && <KitNewBadge />}
        </h3>
        {usage && <p className="kit-sample-usage">{usage}</p>}
      </header>
      <div className="kit-sample-preview">{children}</div>
    </article>
  );
}

/** Reference grid — all NOTEBOOK_SYMBOLS with labels and usage. */
export function KitSymbolCatalog() {
  return (
    <div className="notebook-kit-symbol-grid">
      {NOTEBOOK_SYMBOL_CATALOG.map(({ key, symbol, label, usage }) => (
        <figure key={key} className="notebook-kit-symbol-item">
          <span className="notebook-kit-symbol-glyph notebook-symbol" aria-hidden="true">{symbol}</span>
          <figcaption className="notebook-kit-symbol-caption">
            <span className="notebook-kit-symbol-label">{label}</span>
            <span className="notebook-kit-symbol-usage">{usage}</span>
            <code className="notebook-kit-symbol-key">{`NOTEBOOK_SYMBOLS.${key}`}</code>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
