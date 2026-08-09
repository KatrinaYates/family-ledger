import React from 'react';

const CHIP_TONES = ['green', 'blue', 'yellow', 'purple', 'good', 'watch'];

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

export function MetricKpi({ icon, label, value, chip, note, indicator }) {
  const chipTone = CHIP_TONES.includes(chip?.tone) ? chip.tone : 'green';
  return (
    <article className="paper-surface snapshot-kpi">
      <div className="snapshot-kpi-top">
        <span><span aria-hidden="true">{icon}</span> {label}</span>
        {indicator != null && indicator !== '' && (
          <span aria-hidden="true">{indicator}</span>
        )}
      </div>
      <strong className={kpiValueClassName(value)}>{renderKpiValue(value)}</strong>
      {chip && <span className={`snapshot-chip ${chipTone}`}>{chip.text}</span>}
    </article>
  );
}

export function MetricKpiRow({ items = [] }) {
  return (
    <section className="snapshot-kpi-row" aria-label="Key metrics">
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

export function ScrollBody({ children, label, className = '' }) {
  return (
    <div
      className={`scroll-body ${className}`.trim()}
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
    <section className={`paper-surface snapshot-large-panel panel-stack ${className}`.trim()}>
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
  const list = (
    <div className="summary-list">
      {rows.map((row) => (
        <div className="summary-row" key={row.title}>
          <span aria-hidden="true">{row.icon}</span>
          <div>
            <b>{row.title}</b>
            <p>{row.text}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="paper-surface snapshot-panel panel-stack">
      <h2>{title}</h2>
      {scrollLabel ? <ScrollBody label={scrollLabel}>{list}</ScrollBody> : list}
      {children && <PanelFooter>{children}</PanelFooter>}
    </section>
  );
}

export function InsightBanner({ children }) {
  return <div className="insight-banner">{children}</div>;
}

export function StickyCard({ label, children, tone = 'default' }) {
  return (
    <section className={`paper-surface sticky-card ${tone}`}>
      <span className="sticky-card-label">{label}</span>
      {children}
    </section>
  );
}

export function MeaningTag({ tone, children }) {
  return <span className={`meaning-tag ${tone}`}>{children}</span>;
}

export function DashedList({ items = [], large = false }) {
  return (
    <div className={`dashed-list ${large ? 'dashed-list-large' : ''}`.trim()}>
      {items.map((item) => (
        <div className="dashed-list-row" key={`${item.name}-${item.amount}`}>
          <span>{item.name}</span>
          <strong>{item.amount}</strong>
        </div>
      ))}
    </div>
  );
}

export function GroupedLists({ groups = [] }) {
  return (
    <div className="grouped-lists">
      {groups.map((group) => (
        <div className="list-group" key={group.label}>
          <h3>{group.label}</h3>
          <DashedList items={group.items} />
        </div>
      ))}
    </div>
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

export function StatPills({ items }) {
  return (
    <div className="stat-pills">
      {items.map((item) => (
        <div className="stat-pill paper-surface" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function WarningBanner({ children }) {
  return <div className="warning-banner">{children}</div>;
}

export function ClosingBand({ label, insight }) {
  return (
    <section className="paper-surface closing-band">
      <div>
        <span className="sticky-card-label">{label}</span>
        <h2>{insight}</h2>
      </div>
    </section>
  );
}

export function MomChangeCard({ priorLabel, priorValue, changeLabel }) {
  return (
    <div className="mom-change-card paper-surface">
      <span>{priorLabel} {priorValue}</span>
      <strong>{changeLabel}</strong>
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
          <MeaningTag tone={row.tag}>{row.tagLabel}</MeaningTag>
        </div>
      ))}
    </div>
  );
}

export function ContributionBlock({ label, value, note }) {
  return (
    <div className="contribution-block">
      <span className="sticky-card-label">{label}</span>
      <strong>{value}</strong>
      {note && <p>{note}</p>}
    </div>
  );
}

export function EmergencyBand({ label, title, description, checks }) {
  return (
    <section className="paper-surface emergency-band">
      <div>
        <span className="sticky-card-label">{label}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="emergency-checks">
        {checks.map((item) => (
          <label key={item}>
            <input type="checkbox" readOnly aria-label={item} />
            {item}
          </label>
        ))}
      </div>
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

export function DecisionChecklist({ items }) {
  return (
    <ul className="decision-checklist">
      {items.map((item) => (
        <li key={item}>
          <label>
            <input type="checkbox" readOnly aria-label={item} />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export function ActionTable({ rows }) {
  return (
    <div className="action-table">
      <div className="action-row head">
        <span>Action</span>
        <span>Owner</span>
        <span>Due</span>
        <span>Status</span>
      </div>
      {rows.map((row) => (
        <div className="action-row" key={row.action}>
          <span>{row.action}</span>
          <span>{row.owner || '—'}</span>
          <span>{row.dueDate || '—'}</span>
          <span>{row.status}</span>
        </div>
      ))}
    </div>
  );
}

export function BulletGrid({ title, items }) {
  return (
    <div className="bullet-grid-panel">
      {title && <h3>{title}</h3>}
      <ul className="compact-bullets">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function PromptField({ label, value, onChange, placeholder }) {
  return (
    <label className="prompt-field">
      <span className="prompt-field-label">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </label>
  );
}

export function DetailRows({ rows }) {
  return (
    <dl className="detail-rows">
      {rows.map((row) => (
        <div className="detail-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
