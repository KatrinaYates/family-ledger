import React, { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { useMeetingJson } from '../../hooks/useMeetingField';
import {
  ACTION_STATUSES,
  DEFAULT_ACTION_OWNER_OPTIONS,
  actionStatusFromLabel,
  actionStatusLabel,
} from '../../utils/actionUtils';

const TONE_CHIP_TONES = [
  'green', 'blue', 'yellow', 'purple', 'good', 'watch',
  'assigned', 'protected', 'available', 'review', 'neutral',
];

/** Curated text symbols for KPIs, contribution blocks, and accents — not emoji. */
export const NOTEBOOK_SYMBOL_CATALOG = [
  { key: 'cash', symbol: '◎', label: 'Cash', usage: 'Cash on hand, liquid balances' },
  { key: 'growth', symbol: '↑', label: 'Growth', usage: 'Net worth, upward trends' },
  { key: 'target', symbol: '✦', label: 'Target', usage: 'Goals, fund targets, milestones' },
  { key: 'win', symbol: '✿', label: 'Win', usage: 'Retirement, progress, celebrate tone' },
  { key: 'emergency', symbol: '☆', label: 'Emergency', usage: 'Starter / rainy-day fund' },
  { key: 'safety', symbol: '⛉', label: 'Safety', usage: 'Protected cash, safety tone' },
  { key: 'family', symbol: '♡', label: 'Family', usage: 'Kids savings, family tone' },
  { key: 'focus', symbol: '↘', label: 'Focus', usage: 'Debt, needs attention' },
  { key: 'ready', symbol: '✓', label: 'Ready', usage: 'Complete, on track, other savings' },
  { key: 'talk', symbol: '…', label: 'Talk', usage: 'Open questions, missing data' },
  { key: 'neutral', symbol: '✧', label: 'Neutral', usage: 'Generic fallback' },
  { key: 'warn', symbol: '⚠', label: 'Warn', usage: 'Warning banners, data caveats' },
  { key: 'edit', symbol: '✎', label: 'Edit', usage: 'Draft month, editable notes' },
  { key: 'lock', symbol: '🔒', label: 'Lock', usage: 'Locked month, protected notes' },
];

export const NOTEBOOK_SYMBOLS = Object.fromEntries(
  NOTEBOOK_SYMBOL_CATALOG.map(({ key, symbol }) => [key, symbol]),
);

/**
 * Tone registry — maps semantic tone names to component props and symbol suggestions.
 * Use in kit docs and when assigning tone props across StickyCard, ToneChip, ContributionBlock, bars.
 */
export const NOTEBOOK_TONE_REGISTRY = [
  { key: 'win', sticky: true, chip: 'good', contribution: true, bar: 'tone-green', symbol: 'win', label: 'Win / progress' },
  { key: 'focus', sticky: true, chip: 'watch', contribution: true, bar: 'tone-coral', symbol: 'focus', label: 'Focus / attention' },
  { key: 'ready', sticky: true, chip: 'good', contribution: true, bar: 'tone-teal', symbol: 'ready', label: 'Ready / on track' },
  { key: 'missing', sticky: true, chip: 'review', contribution: true, bar: 'tone-yellow', symbol: 'talk', label: 'Missing / talk' },
  { key: 'context', sticky: true, chip: 'neutral', contribution: false, bar: 'tone-slate', symbol: 'neutral', label: 'Context / notes' },
  { key: 'no-score', sticky: true, chip: 'neutral', contribution: false, bar: 'tone-slate', symbol: 'neutral', label: 'No score yet' },
  { key: 'safety', sticky: true, chip: 'protected', contribution: true, bar: 'tone-blue', symbol: 'safety', label: 'Safety / protected' },
  { key: 'family', sticky: true, chip: 'assigned', contribution: true, bar: 'tone-purple', symbol: 'family', label: 'Family' },
  { key: 'good', sticky: false, chip: 'good', contribution: false, bar: 'tone-green', symbol: 'ready', label: 'Good status' },
  { key: 'watch', sticky: false, chip: 'watch', contribution: false, bar: 'tone-yellow', symbol: 'warn', label: 'Watch status' },
  { key: 'protected', sticky: false, chip: 'protected', contribution: false, bar: 'tone-blue', symbol: 'safety', label: 'Protected' },
  { key: 'assigned', sticky: false, chip: 'assigned', contribution: false, bar: 'tone-blue', symbol: 'focus', label: 'Assigned' },
  { key: 'available', sticky: false, chip: 'available', contribution: false, bar: 'tone-teal', symbol: 'cash', label: 'Available' },
  { key: 'review', sticky: false, chip: 'review', contribution: false, bar: 'tone-yellow', symbol: 'talk', label: 'Review needed' },
  { key: 'neutral', sticky: false, chip: 'neutral', contribution: false, bar: 'tone-slate', symbol: 'neutral', label: 'Neutral' },
];

/** StickyCard + DecorativeStickyNote tone keys supported in CSS. */
export const STICKY_CARD_TONES = ['win', 'focus', 'ready', 'missing', 'context', 'no-score', 'safety', 'family'];

/** DecorativeStickyNote-only tones (also use sticky-note CSS classes). */
export const DECORATIVE_STICKY_TONES = ['yellow', 'pink', 'blue', 'green', 'lav', 'coral'];

/** StatusBadge variant keys supported in CSS. */
export const STATUS_BADGE_VARIANTS = ['default', 'draft', 'final', 'continued', 'talk'];

export function ContentEyebrow({ children }) {
  return <p className="content-eyebrow">{children}</p>;
}

export function ContentSubtitle({ children }) {
  return <p className="content-subtitle">{children}</p>;
}

export function StatusBadge({ children, variant = 'default' }) {
  return <span className={`status-badge status-badge-${variant}`}>{children}</span>;
}

const KPI_GOAL_SPLIT = /\s+\/\s+/;

function renderKpiValue(value) {
  if (value == null || value === '—') return value;

  const text = String(value).trim();
  const parts = text.split(KPI_GOAL_SPLIT);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return text;

  return (
    <>
      <span className="snapshot-kpi-value-primary">{parts[0]}</span>
      <span className="snapshot-kpi-value-secondary">
        {' / '}
        {parts[1]}
      </span>
    </>
  );
}

function kpiValueClassName(value) {
  if (value == null || value === '—') return 'snapshot-kpi-value';
  return KPI_GOAL_SPLIT.test(String(value).trim())
    ? 'snapshot-kpi-value is-with-goal'
    : 'snapshot-kpi-value';
}

export function ToneChip({ tone = 'green', children, className = '' }) {
  const resolvedTone = TONE_CHIP_TONES.includes(tone) ? tone : 'green';
  return (
    <span className={`tone-chip tone-${resolvedTone} ${className}`.trim()}>
      {children}
    </span>
  );
}

export function MetricKpi({ icon, label, value, chip, note, indicator }) {
  const chipTone = chip?.tone ?? 'green';
  return (
    <article className="paper-surface snapshot-kpi">
      <div className="snapshot-kpi-top">
        <span><span className="notebook-symbol" aria-hidden="true">{icon}</span> {label}</span>
        {indicator != null && indicator !== '' && (
          <span aria-hidden="true">{indicator}</span>
        )}
      </div>
      <strong className={kpiValueClassName(value)}>{renderKpiValue(value)}</strong>
      {chip && <ToneChip tone={chipTone} className="tone-chip-in-kpi">{chip.text}</ToneChip>}
    </article>
  );
}

export function MetricKpiRow({ items = [], className = '' }) {
  return (
    <section className={`snapshot-kpi-row ${className}`.trim()} aria-label="Key metrics">
      {items.map((item) => (
        <MetricKpi key={item.label} {...item} />
      ))}
    </section>
  );
}

export function SectionPageHeader({ eyebrow, title, subtitle, badge, badgeVariant = 'default' }) {
  return (
    <header className="snapshot-page-header">
      <div>
        {eyebrow && <ContentEyebrow>{eyebrow}</ContentEyebrow>}
        <h1 className="notebook-page-title" tabIndex="-1">{title}</h1>
        {subtitle && <ContentSubtitle>{subtitle}</ContentSubtitle>}
      </div>
      {badge && (
        <div className="snapshot-header-actions">
          <StatusBadge variant={badgeVariant}>{badge}</StatusBadge>
        </div>
      )}
    </header>
  );
}

export function PageContinuedHint({ children }) {
  if (!children) return null;
  return <p className="page-continued-hint">{children}</p>;
}

export function ScrollBody({ children, label, className = '', capped = false }) {
  return (
    <div
      className={`scroll-body${capped ? ' scroll-body-capped' : ''} ${className}`.trim()}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}

export function PanelFooter({ children }) {
  return <div className="panel-footer">{children}</div>;
}

export function PanelCard({ title, total, children, footer, className = '', scrollLabel }) {
  const body = scrollLabel ? (
    <ScrollBody label={scrollLabel}>{children}</ScrollBody>
  ) : (
    <div className="panel-body">{children}</div>
  );

  return (
    <section className={`paper-surface panel-card snapshot-large-panel panel-stack ${className}`.trim()}>
      {(title || total) && (
        <div className="panel-heading">
          {title && <h2>{title}</h2>}
          {total && <strong className="panel-total">{total}</strong>}
        </div>
      )}
      {body}
      {footer && <PanelFooter>{footer}</PanelFooter>}
    </section>
  );
}

export function SummaryPanel({ title, rows, children, scrollLabel }) {
  const list = <SymbolRows rows={rows} />;

  return (
    <section className="paper-surface snapshot-panel panel-stack">
      <h2>{title}</h2>
      {scrollLabel ? <ScrollBody label={scrollLabel}>{list}</ScrollBody> : list}
      {children && <PanelFooter>{children}</PanelFooter>}
    </section>
  );
}

/** Parse currency display into sign + amount for ledger rows. */
function parseAmountParts(value, explicitSign) {
  const text = String(value ?? '').trim();
  if (!text || text === '—') return { sign: '', amount: text, tone: 'neutral' };

  if (explicitSign === 'subtract' || explicitSign === '−' || explicitSign === '-') {
    const amount = text.replace(/^[+\-−]/, '').trim();
    return { sign: '−', amount, tone: 'subtract' };
  }

  if (text.startsWith('+')) {
    return { sign: '+', amount: text.slice(1).trim(), tone: 'add' };
  }

  if (text.startsWith('-') || text.startsWith('−')) {
    return { sign: '−', amount: text.slice(1).trim(), tone: 'subtract' };
  }

  return { sign: '+', amount: text, tone: 'add' };
}

/**
 * Additive breakdown under a total — ledger column with signs and tabular amounts.
 * Not a generic list; use DashedList for account rows without math context.
 */
export function AmountList({ items = [], total, heading, className = '', nested = false }) {
  if (!items.length) return null;

  const ledger = (
    <div
      className={[
        'amount-breakdown',
        nested ? 'is-nested' : '',
        className,
      ].filter(Boolean).join(' ')}
      role="list"
      aria-label="Amount breakdown"
    >
      {items.map((item) => {
        const key = item.label ?? item.name;
        const { sign, amount, tone } = parseAmountParts(item.value ?? item.amount, item.sign);
        return (
          <div key={key} className="amount-breakdown-row" role="listitem">
            <span className={`amount-breakdown-sign tone-${tone}`} aria-hidden="true">{sign}</span>
            <span className="amount-breakdown-label">{key}</span>
            <strong className="amount-breakdown-value">{amount}</strong>
          </div>
        );
      })}
      {total && (
        <div className="amount-breakdown-row amount-breakdown-total" role="listitem">
          <span className="amount-breakdown-sign" aria-hidden="true">=</span>
          <span className="amount-breakdown-label">Total</span>
          <strong className="amount-breakdown-value">{total}</strong>
        </div>
      )}
    </div>
  );

  if (heading) {
    return (
      <div className={['amount-breakdown-stack', nested ? 'is-nested' : ''].filter(Boolean).join(' ')}>
        <p className="amount-breakdown-heading">{heading}</p>
        {ledger}
      </div>
    );
  }

  return ledger;
}

export function ListRemoveButton({
  onClick,
  label = 'Remove item',
  className = '',
  variant = 'icon',
}) {
  return (
    <button
      type="button"
      className={`list-row-remove meeting-remove-btn${variant === 'text' ? ' is-text' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-label={label}
    >
      {variant === 'text' ? 'Remove' : '×'}
    </button>
  );
}

export function ListAddButton({ onClick, children = '+ Add item', className = '' }) {
  return (
    <button
      type="button"
      className={`list-add-btn meeting-add-btn ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function newQuestionId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedQuestionItems(seeds) {
  return seeds.map((entry, index) => {
    if (typeof entry === 'string') {
      return { id: `seed-${index}`, question: entry, answer: '' };
    }
    return {
      id: entry.id ?? `seed-${index}`,
      question: entry.question ?? '',
      answer: entry.answer ?? '',
    };
  });
}

function resizeTextareaElement(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function AutoResizeTextarea({ value, onChange, className, ...props }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    resizeTextareaElement(ref.current);
  }, [value]);

  const handleChange = useCallback((e) => {
    onChange(e);
    resizeTextareaElement(e.target);
  }, [onChange]);

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}

function ListSaveError({ message }) {
  if (!message) return null;
  return (
    <p className="field-save-error" role="alert">
      {message}
    </p>
  );
}

function QuestionListReadOnly({ items, script, className }) {
  if (!items.length) return null;

  return (
    <ul
      className={[
        'notebook-list',
        'notebook-list--bullet',
        script ? 'notebook-list--script' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {items.map((item) => {
        const text = typeof item === 'string' ? item : item.question;
        return (
          <li key={text} className="notebook-list-row">{text}</li>
        );
      })}
    </ul>
  );
}

function QuestionListEditableBody({
  items,
  onItemsChange,
  isLocked = false,
  saveError,
  script = false,
  className = '',
}) {
  const updateAnswer = (id, answer) => {
    onItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, answer } : item)));
  };

  const updateQuestion = (id, question) => {
    onItemsChange((prev) => prev.map((item) => (item.id === id ? { ...item, question } : item)));
  };

  const addQuestion = () => {
    onItemsChange((prev) => [...prev, { id: newQuestionId(), question: '', answer: '' }]);
  };

  const removeQuestion = (id) => {
    onItemsChange((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className={[
        'question-list-editable',
        'notebook-list-editable-group',
        script ? 'notebook-list--script' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => (
        <div className="notebook-list-editable-block" key={item.id}>
          <label className="notebook-list-editable-label">
            <span className="notebook-list-label">Question {index + 1}</span>
            <AutoResizeTextarea
              className="notebook-list-input editable-inline-input editable-question-prompt"
              value={item.question}
              onChange={(e) => updateQuestion(item.id, e.target.value)}
              placeholder="What do we need to discuss?"
              rows={script ? 3 : 2}
              readOnly={isLocked}
            />
          </label>
          <div className="notebook-list-editable-answer-row">
            <textarea
              className="inline-notes-area"
              value={item.answer}
              onChange={(e) => updateAnswer(item.id, e.target.value)}
              placeholder="Your answer or notes..."
              rows={2}
              readOnly={isLocked}
            />
            {!isLocked && (
              <ListRemoveButton
                label="Remove question"
                onClick={(e) => {
                  e.stopPropagation();
                  removeQuestion(item.id);
                }}
              />
            )}
          </div>
        </div>
      ))}
      {!isLocked && (
        <ListAddButton onClick={addQuestion}>+ Add question</ListAddButton>
      )}
      <ListSaveError message={saveError} />
    </div>
  );
}

function QuestionListEditablePersisted({ storageKey, items: seeds, script, className }) {
  const { value: items, setValue: setItems, isLocked, saveError } = useMeetingJson(
    storageKey,
    () => seedQuestionItems(seeds),
  );

  return (
    <QuestionListEditableBody
      items={items}
      onItemsChange={setItems}
      isLocked={isLocked}
      saveError={saveError}
      script={script}
      className={className}
    />
  );
}

/**
 * Talk-together prompts — read-only bullets by default.
 * Pass editable with storageKey (persisted) or onItemsChange (controlled) for Q&A editing.
 */
export function QuestionList({
  items = [],
  script = false,
  className = '',
  editable = false,
  storageKey,
  onItemsChange,
  readOnly = false,
}) {
  if (editable) {
    if (storageKey) {
      return (
        <QuestionListEditablePersisted
          storageKey={storageKey}
          items={items}
          script={script}
          className={className}
        />
      );
    }
    if (onItemsChange) {
      return (
        <QuestionListEditableBody
          items={items}
          onItemsChange={onItemsChange}
          isLocked={readOnly}
          script={script}
          className={className}
        />
      );
    }
    return null;
  }

  return (
    <QuestionListReadOnly
      items={items}
      script={script}
      className={className}
    />
  );
}

/**
 * Tinted in-page card — goals, pulse, priorities, talk together.
 * variant="default" uses compact label; variant="priority" uses section heading style.
 */
export function StickyCard({
  label,
  children,
  tone = 'default',
  variant = 'default',
  fill = false,
  prose = false,
  className = '',
}) {
  if (variant === 'priority') {
    if (children == null || children === false) return null;
    if (typeof children === 'string' && !children.trim()) return null;
  }

  const LabelTag = variant === 'priority' ? 'h3' : 'span';
  const labelClass = variant === 'priority' ? 'sticky-card-heading' : 'sticky-card-label';
  const body = variant === 'priority' && typeof children === 'string'
    ? <p className="sticky-card-body">{children}</p>
    : children;

  return (
    <section
      className={[
        'paper-surface',
        'sticky-card',
        tone,
        variant === 'priority' ? 'is-priority' : '',
        fill ? 'is-fill' : '',
        prose ? 'is-prose' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <LabelTag className={labelClass}>{label}</LabelTag>
      {body}
    </section>
  );
}


export function DashedList({ items = [], large = false, className = '' }) {
  return (
    <ul
      className={[
        'notebook-list',
        'notebook-list--dashed',
        large ? 'notebook-list--dashed-large' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {items.map((item) => (
        <li className="notebook-list-row" key={`${item.name}-${item.amount}`}>
          <span className="notebook-list-label">{item.name}</span>
          <strong className="notebook-list-value">{item.amount}</strong>
        </li>
      ))}
    </ul>
  );
}

export function RankedTable({ columns, rows }) {
  return (
    <div className="ranked-table">
      <div className="ranked-row head">
        {columns.map((col) => <span key={col}>{col}</span>)}
      </div>
      {rows.map((row) => (
        <div className="ranked-row" key={row.key || row.name}>
          {row.cells.map((cell, i) => (
            <span key={columns[i]}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChangeTable({ rows = [], priorLabel = 'Prior', currentLabel = 'Current' }) {
  return (
    <div className="change-table">
      <div className="change-row head">
        <span>Category</span>
        <span>{priorLabel}</span>
        <span>{currentLabel}</span>
        <span>Change</span>
      </div>
      {rows.map((row) => (
        <div className="change-row" key={row.category}>
          <span>
            {row.category}
            {row.reason && <small> — {row.reason}</small>}
          </span>
          <span>{row.prior}</span>
          <span>{row.current}</span>
          <span className="change-up">{row.change}</span>
        </div>
      ))}
    </div>
  );
}

export function StatPills({ items = [], label, className = '' }) {
  if (!items.length) return null;

  return (
    <div className={`stat-pills ${className}`.trim()} aria-label={label}>
      {label && <span className="stat-pills-label">{label}</span>}
      <div className="stat-pills-row">
        {items.map((item) => (
          <article
            key={item.label}
            className={`stat-pill${item.tone ? ` tone-${item.tone}` : ''}`.trim()}
          >
            <span className="stat-pill-label">{item.label}</span>
            <strong className="stat-pill-value">{item.value}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

export function WarningBanner({
  children,
  label = 'Heads up',
  compact = false,
  className = '',
  ...props
}) {
  const body = typeof children === 'string' ? <p>{children}</p> : children;

  return (
    <div
      className={`paper-surface warning-banner${compact ? ' is-compact' : ''} ${className}`.trim()}
      {...props}
    >
      <span className="warning-banner-icon notebook-symbol" aria-hidden="true">{NOTEBOOK_SYMBOLS.warn}</span>
      <div className="warning-banner-content">
        {label && !compact && (
          <span className="warning-banner-label">{label}</span>
        )}
        {body}
      </div>
    </div>
  );
}

/* Snapshot-specific — kept here for reuse */
export function AllocationTable({ rows }) {
  return (
    <div className="allocation-table">
      <div className="allocation-row head">
        <span>Account or purpose</span>
        <span>Balance</span>
        <span>Meaning</span>
      </div>
      {rows.map((row) => (
        <div className="allocation-row" key={`${row.name}-${row.amount}`}>
          <span>{row.name}</span>
          <strong>{row.amount}</strong>
          <ToneChip tone={row.tag}>{row.tagLabel}</ToneChip>
        </div>
      ))}
    </div>
  );
}

const CONTRIBUTION_TONE_ICONS = {
  win: NOTEBOOK_SYMBOLS.win,
  ready: NOTEBOOK_SYMBOLS.ready,
  safety: NOTEBOOK_SYMBOLS.safety,
  focus: NOTEBOOK_SYMBOLS.focus,
  family: NOTEBOOK_SYMBOLS.family,
  missing: NOTEBOOK_SYMBOLS.talk,
};

export function ContributionBlockCard({ icon, label, value, note, tone = 'win', className = '' }) {
  const displayIcon = icon ?? CONTRIBUTION_TONE_ICONS[tone] ?? NOTEBOOK_SYMBOLS.neutral;

  return (
    <article className={`paper-surface contribution-block ${tone} ${className}`.trim()}>
      <span className="contribution-block-icon notebook-symbol" aria-hidden="true">{displayIcon}</span>
      <span className="contribution-block-label">{label}</span>
      <strong className="contribution-block-value">{value}</strong>
      {note && <p className="contribution-block-note">{note}</p>}
    </article>
  );
}

/** Solo KPI card or group row — pass items for a group, or icon/label/value for solo. */
export function ContributionBlock({ items, className = '', ...soloProps }) {
  if (items?.length) {
    return (
      <div className={`contribution-block-row ${className}`.trim()}>
        {items.map((item) => (
          <ContributionBlockCard key={item.label} {...item} />
        ))}
      </div>
    );
  }

  return <ContributionBlockCard {...soloProps} className={className} />;
}

const TOPIC_BAND_TONE_ICONS = {
  emergency: NOTEBOOK_SYMBOLS.emergency,
  safety: NOTEBOOK_SYMBOLS.safety,
  target: NOTEBOOK_SYMBOLS.target,
  talk: NOTEBOOK_SYMBOLS.talk,
  ready: NOTEBOOK_SYMBOLS.ready,
  win: NOTEBOOK_SYMBOLS.win,
  focus: NOTEBOOK_SYMBOLS.focus,
  family: NOTEBOOK_SYMBOLS.family,
  neutral: NOTEBOOK_SYMBOLS.neutral,
};

/**
 * Topic band — symbol header + checklist. Any page topic (fund rules, decisions, readiness).
 * Pass icon or tone for symbol; checks for read-only; children for editable checklist.
 */
export function TopicBand({
  label,
  title,
  description,
  icon,
  tone = 'neutral',
  checks,
  children,
  className = '',
}) {
  const displayIcon = icon ?? TOPIC_BAND_TONE_ICONS[tone] ?? NOTEBOOK_SYMBOLS.neutral;

  return (
    <section className={`paper-surface topic-band ${className}`.trim()}>
      <header className="topic-band-header">
        <span className="topic-band-symbol notebook-symbol" aria-hidden="true">{displayIcon}</span>
        <div className="topic-band-intro">
          <span className="sticky-card-label">{label}</span>
          <h2 className="topic-band-title">{title}</h2>
          {description && <p className="topic-band-desc">{description}</p>}
        </div>
      </header>
      {children ?? (checks?.length > 0 && (
        <ul className="notebook-list notebook-list--check topic-band-checks">
          {checks.map((item) => (
            <li key={item} className="notebook-list-row">
              <label className="notebook-list-check">
                <input type="checkbox" readOnly tabIndex={-1} aria-label={item} />
                <span className="notebook-list-check-text">{item}</span>
              </label>
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}

export function DebtGroups({ loans, creditCards, large = false }) {
  return (
    <div className={`debt-groups ${large ? 'debt-groups-large' : ''}`.trim()}>
      <div className="debt-group">
        <h3>Loans</h3>
        <DashedList items={loans} large={large} />
      </div>
      <div className="debt-group">
        <h3>Credit cards</h3>
        <DashedList items={creditCards} large={large} />
      </div>
    </div>
  );
}

export function PanelHeading({ title, total }) {
  return (
    <div className="panel-heading">
      <h2>{title}</h2>
      {total && <strong className="panel-total">{total}</strong>}
    </div>
  );
}

export function ActionTable({
  rows = [],
  readOnly = false,
  isRowReadOnly,
  onUpdateRow,
  onRemoveRow,
  ownerOptions = DEFAULT_ACTION_OWNER_OPTIONS,
  statusOptions = ACTION_STATUSES,
  showRemove = true,
  className = '',
}) {
  const getActionText = (row) => row.title ?? row.action ?? '';
  const getRowId = (row, index) => row.id ?? getActionText(row) ?? `row-${index}`;

  const normalizeStatus = (status) => {
    if (statusOptions.includes(status)) return status;
    return actionStatusFromLabel(status);
  };

  const toDateInputValue = (dueDate) => {
    if (!dueDate || dueDate === 'TBD') return '';
    return /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : '';
  };

  const formatOwner = (owner) => owner?.trim() || '—';
  const formatDueDate = (dueDate) => {
    if (!dueDate || dueDate === 'TBD') return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      const [year, month, day] = dueDate.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dueDate;
  };

  const editable = Boolean(onUpdateRow);
  const hasActionsColumn = editable && showRemove && onRemoveRow;

  return (
    <div className={`action-table ${className}`.trim()}>
      <div className={`action-row head${hasActionsColumn ? ' has-actions' : ''}`.trim()}>
        <span>Action</span>
        <span>Owner</span>
        <span>Due</span>
        <span>Status</span>
        {hasActionsColumn && <span className="action-row-actions"> </span>}
      </div>
      {rows.map((row, index) => {
        const rowId = getRowId(row, index);
        const rowReadOnly = readOnly || (isRowReadOnly?.(row) ?? false);
        const statusValue = normalizeStatus(row.status ?? 'not_started');

        if (!editable) {
          return (
            <div className="action-row" key={rowId}>
              <span>{getActionText(row) || '—'}</span>
              <span>{formatOwner(row.owner)}</span>
              <span>{formatDueDate(row.dueDate)}</span>
              <span>{actionStatusLabel(statusValue)}</span>
            </div>
          );
        }

        return (
          <div className={`action-row editable${hasActionsColumn ? ' has-actions' : ''}${rowReadOnly ? ' is-readonly' : ''}`.trim()} key={rowId}>
            <input
              type="text"
              className="editable-cell-input"
              value={getActionText(row)}
              onChange={(e) => onUpdateRow(rowId, 'action', e.target.value)}
              placeholder="What needs to happen?"
              readOnly={rowReadOnly}
            />
            <select
              className="editable-cell-input"
              value={row.owner ?? ''}
              onChange={(e) => onUpdateRow(rowId, 'owner', e.target.value)}
              disabled={rowReadOnly}
              aria-label={`Owner for ${getActionText(row) || 'action item'}`}
            >
              {ownerOptions.map((option) => (
                <option key={option.value || 'unassigned'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="editable-cell-input editable-cell-date"
              value={toDateInputValue(row.dueDate)}
              onChange={(e) => onUpdateRow(rowId, 'dueDate', e.target.value || null)}
              disabled={rowReadOnly}
              aria-label={`Due date for ${getActionText(row) || 'action item'}`}
            />
            <select
              className="editable-cell-input"
              value={statusValue}
              onChange={(e) => onUpdateRow(rowId, 'status', e.target.value)}
              disabled={rowReadOnly}
              aria-label={`Status for ${getActionText(row) || 'action item'}`}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {actionStatusLabel(status)}
                </option>
              ))}
            </select>
            {hasActionsColumn && !rowReadOnly && (
              <ListRemoveButton
                variant="text"
                label="Remove action item"
                onClick={() => onRemoveRow(rowId)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PromptField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  readOnly = false,
  disabled = false,
  saveError = null,
  saving = false,
}) {
  const isReadOnly = readOnly || disabled;

  return (
    <label className={`prompt-field ${className}`.trim()}>
      <span className="prompt-field-label">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={isReadOnly}
        aria-readonly={isReadOnly}
        disabled={saving && !isReadOnly}
        aria-busy={saving || undefined}
      />
      {saveError && (
        <p className="field-save-error" role="alert">{saveError}</p>
      )}
    </label>
  );
}

/** Pill button — primary (teal) or secondary (outlined). */
export function NotebookButton({
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={['notebook-btn', `notebook-btn--${variant}`, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Labeled prompt textarea with primary + secondary actions — advisor ask, copy-prompt flows.
 */
export function PromptActionPanel({
  title,
  lead,
  questionLabel = 'Your question',
  value,
  onChange,
  placeholder,
  rows = 4,
  primaryLabel,
  onPrimaryClick,
  secondaryLabel,
  onSecondaryClick,
  className = '',
  fieldClassName = '',
}) {
  return (
    <PanelCard title={title} className={`prompt-action-panel ${className}`.trim()}>
      {lead && <p className="prompt-action-lead">{lead}</p>}
      <PromptField
        label={questionLabel}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={fieldClassName}
      />
      <div className="prompt-action-buttons">
        {primaryLabel && onPrimaryClick && (
          <NotebookButton variant="primary" onClick={onPrimaryClick}>
            {primaryLabel}
          </NotebookButton>
        )}
        {secondaryLabel && onSecondaryClick && (
          <NotebookButton variant="secondary" onClick={onSecondaryClick}>
            {secondaryLabel}
          </NotebookButton>
        )}
      </div>
    </PanelCard>
  );
}

export function DetailRows({ rows = [], layout = 'stack', className = '' }) {
  const visible = rows.filter((row) => row.value);
  if (!visible.length) return null;

  const layoutClass = layout === 'inline' ? ' detail-highlights--inline' : '';

  return (
    <dl className={`detail-highlights${layoutClass} ${className}`.trim()}>
      {visible.map((row) => (
        <div className="detail-highlight-row" key={row.label}>
          <dt className="detail-highlight-label">{row.label}</dt>
          <dd className="detail-highlight-value">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Icon + title + paragraph rows — CFO detail, recommendation blocks. */
export function SymbolRows({ rows = [], className = '' }) {
  if (!rows.length) return null;

  return (
    <div className={`symbol-rows ${className}`.trim()}>
      {rows.map((row) => (
        <div className="symbol-row" key={row.title}>
          <span className="symbol-row-icon notebook-symbol" aria-hidden="true">{row.icon}</span>
          <div>
            <b>{row.title}</b>
            <p>{row.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** “All clear” line inside a PanelModule — prefix adds ✓ automatically. */
export function PanelOkLine({ children, className = '' }) {
  if (children == null || children === false) return null;
  return <span className={`panel-ok-line ${className}`.trim()}>✓ {children}</span>;
}

/**
 * Inline add/edit context note — review rows, parking-lot elaboration.
 * Controlled value + onChange; pair with useMeetingJson in pages when persisting.
 */
export function ExpandableContextNote({
  value = '',
  onChange,
  readOnly = false,
  placeholder = 'Add context...',
  addLabel = 'Add context',
  editLabel = 'Edit',
  className = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = String(value ?? '').trim();

  if (trimmed && !expanded) {
    return (
      <div className={`inline-context-note ${className}`.trim()}>
        <span>{value}</span>
        {!readOnly && (
          <button type="button" className="notebook-link-btn" onClick={() => setExpanded(true)}>
            {editLabel}
          </button>
        )}
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        className={`notebook-link-btn ${className}`.trim()}
        onClick={() => setExpanded(true)}
        disabled={readOnly}
      >
        {addLabel}
      </button>
    );
  }

  return (
    <textarea
      className={`inline-notes-area inline-context-input ${className}`.trim()}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={() => { if (!trimmed) setExpanded(false); }}
      placeholder={placeholder}
      rows={2}
      readOnly={readOnly}
      aria-readonly={readOnly}
      autoFocus
    />
  );
}

/**
 * Narrative insight blocks — title + detail + support with left accent.
 * Spending Watch “Patterns worth noticing”; not DetailRows (short label/value).
 */
export function InsightList({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <ul className={`insight-list ${className}`.trim()}>
      {items.map((item) => {
        const key = item.id ?? item.title ?? item.fallbackLine;
        if (item.fallbackLine) {
          return (
            <li key={key} className="insight-row insight-row-fallback">
              {item.fallbackLine}
            </li>
          );
        }

        return (
          <li key={key} className="insight-row">
            {item.title && <strong className="insight-row-title">{item.title}</strong>}
            {item.detail && <span className="insight-row-detail">{item.detail}</span>}
            {item.support && <p className="insight-row-support">{item.support}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function formatLockedAt(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

/**
 * Month lock control — close-the-month panel for protecting meeting notes.
 */
export const MonthLockPanel = React.forwardRef(function MonthLockPanel({
  monthLabel = 'This month',
  status = 'unlocked',
  lockedAt = null,
  confirming = false,
  saving = false,
  saveError = null,
  onPrimaryClick,
  onCancelClick,
  className = '',
  id = 'month-lock-control',
}, ref) {
  const panelClassName = [
    'paper-surface',
    'month-lock-panel',
    status === 'locked' ? 'is-locked' : '',
    status === 'loading' ? 'is-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  if (status === 'loading') {
    return (
      <section
        ref={ref}
        id={id}
        tabIndex={-1}
        className={panelClassName}
        aria-live="polite"
        aria-busy="true"
      >
        <p className="month-lock-lead">Loading lock status…</p>
      </section>
    );
  }

  const isLocked = status === 'locked';
  const symbol = isLocked ? NOTEBOOK_SYMBOLS.lock : NOTEBOOK_SYMBOLS.edit;
  const title = isLocked ? `${monthLabel} is locked` : `Lock ${monthLabel}`;
  const lockedAtLabel = formatLockedAt(lockedAt);

  let primaryLabel = isLocked ? `Unlock ${monthLabel}` : `Lock ${monthLabel}`;
  if (saving) {
    primaryLabel = isLocked ? 'Unlocking…' : 'Locking…';
  } else if (confirming) {
    primaryLabel = isLocked ? `Confirm unlock ${monthLabel}` : `Confirm lock ${monthLabel}`;
  }

  const lead = isLocked
    ? 'Meeting notes are read-only. Action items remain editable.'
    : `When you are done with the ${monthLabel} meeting, lock this month to protect your notes.`;

  return (
    <section
      ref={ref}
      id={id}
      tabIndex={-1}
      className={panelClassName}
      aria-labelledby={`${id}-title`}
    >
      <div className="month-lock-header">
        <span className="month-lock-symbol notebook-symbol" aria-hidden="true">{symbol}</span>
        <div className="month-lock-heading">
          <div className="month-lock-title-row">
            <h3 id={`${id}-title`} className="month-lock-title">{title}</h3>
            {isLocked && <ToneChip tone="protected">Locked</ToneChip>}
          </div>
          {isLocked && lockedAtLabel && (
            <p className="month-lock-meta">Locked {lockedAtLabel}</p>
          )}
          <p className="month-lock-lead">{lead}</p>
        </div>
      </div>

      {saveError && <p className="field-save-error month-lock-error" role="alert">{saveError}</p>}

      <div className="month-lock-actions">
        <NotebookButton
          variant={isLocked ? 'secondary' : 'primary'}
          onClick={onPrimaryClick}
          disabled={saving || !onPrimaryClick}
        >
          {primaryLabel}
        </NotebookButton>
        {confirming && !saving && onCancelClick && (
          <NotebookButton variant="secondary" onClick={onCancelClick}>
            Cancel
          </NotebookButton>
        )}
      </div>
    </section>
  );
});
