import React, { useState } from 'react';
import { useMeetingJson } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';

function ExpandableContext({ itemId, storageKey, seedFactory, isLocked, placeholder = 'Add context...' }) {
  const { value: contexts, setValue: setContexts } = useMeetingJson(storageKey, seedFactory);
  const [expanded, setExpanded] = useState(false);

  const context = contexts.find((entry) => entry.id === itemId)?.context ?? '';

  const updateContext = (next) => {
    setContexts((prev) => {
      const existing = prev.find((entry) => entry.id === itemId);
      if (existing) {
        return prev.map((entry) => (entry.id === itemId ? { ...entry, context: next } : entry));
      }
      return [...prev, { id: itemId, context: next }];
    });
  };

  if (context && !expanded) {
    return (
      <div className="spending-inline-note">
        <span>{context}</span>
        {!isLocked && (
          <button type="button" className="notebook-link-btn" onClick={() => setExpanded(true)}>
            Edit
          </button>
        )}
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        className="notebook-link-btn"
        onClick={() => setExpanded(true)}
        disabled={isLocked}
      >
        Add context
      </button>
    );
  }

  return (
    <textarea
      className="inline-notes-area spending-inline-input"
      value={context}
      onChange={(e) => updateContext(e.target.value)}
      onBlur={() => { if (!context.trim()) setExpanded(false); }}
      placeholder={placeholder}
      rows={2}
      readOnly={isLocked}
      aria-readonly={isLocked}
      autoFocus
    />
  );
}

function RecurringModule({ recurring }) {
  const [expanded, setExpanded] = useState(false);

  if (!recurring) return null;

  const previewCount = 3;
  const allCharges = recurring.allCharges ?? [];
  const reviewGroups = recurring.reviewGroups ?? [];
  const showViewAll = recurring.viewAllCount && recurring.viewAllCount > previewCount;

  return (
    <div className="spending-watch-module">
      <div className="spending-watch-module-body">
        <span className="spending-watch-module-label">Subscriptions & recurring</span>
        {recurring.summary && (
          <span className="spending-watch-module-value">{recurring.summary}</span>
        )}

        {recurring.stable && (
          <span className="spending-watch-ok">✓ {recurring.stableMessage}</span>
        )}

        {recurring.changes?.length > 0 && (
          <ul className="spending-watch-sublist">
            {recurring.changes.slice(0, expanded ? undefined : previewCount).map((change) => (
              <li key={change.label}>{change.label}{change.amount ? ` · ${change.amount}` : ''}</li>
            ))}
          </ul>
        )}

        {reviewGroups.length > 0 && (
          <div className="spending-watch-recurring-review">
            {reviewGroups.slice(0, expanded ? undefined : 2).map((group, index) => (
              <p className="spending-watch-review-reason" key={group.id ?? group.name ?? index}>
                <strong>{group.name ?? 'Worth reviewing'}{group.amount ? ` · ${group.amount}` : ''}</strong>
                {group.note ? ` — ${group.note}` : ''}
              </p>
            ))}
          </div>
        )}

        {showViewAll && (
          <button type="button" className="notebook-link-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : `View all ${recurring.viewAllCount} →`}
          </button>
        )}

        {expanded && allCharges.length > 0 && (
          <ul className="spending-watch-sublist">
            {allCharges.map((charge, index) => (
              <li key={charge.id ?? charge.name ?? index}>
                {charge.name ?? charge.label}{charge.amount ? ` · ${charge.amount}` : ''}
                {charge.frequency ? ` · ${String(charge.frequency).toLowerCase()}` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SpendingWatch({ spendingWatch, monthId }) {
  if (!spendingWatch) return null;

  const storageKey = sectionFieldKey(monthId, 'spending', 'watch-contexts');
  const seedFactory = () => (
    (spendingWatch.review?.items ?? []).map((item) => ({ id: item.id, context: '' }))
  );
  const { isLocked } = useMeetingJson(storageKey, seedFactory);

  const { patterns, recurring, fees, review } = spendingWatch;
  const hasReview = review?.hasItems;

  return (
    <section className="spending-block" aria-label="Spending watch">
      <h2 className="month-snapshot-section-heading">Spending Watch</h2>
      <div className="paper-surface spending-panel-surface">
        <div className="spending-watch-dashboard">
          <div className="spending-watch-module">
            <span className="spending-watch-module-label">Patterns worth noticing</span>
            {patterns?.status === 'alert' && patterns.lines?.length ? (
              <ul className="spending-watch-sublist">
                {patterns.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <span className="spending-watch-ok">✓ {patterns?.okMessage}</span>
            )}
          </div>

          <RecurringModule recurring={recurring} />

          {fees && (
            <div className="spending-watch-module">
              <span className="spending-watch-module-label">Fees</span>
              {fees.status === 'ok' ? (
                <span className="spending-watch-ok">✓ {fees.okMessage}</span>
              ) : (
                <div className="spending-watch-module-body">
                  <span className="spending-watch-module-value">{fees.total} found</span>
                  <ul className="spending-watch-sublist">
                    {fees.items.map((item) => (
                      <li key={item.name}>{item.name} · {item.amount}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {hasReview && (
            <div className="spending-watch-module spending-watch-module-review">
              <span className="spending-watch-module-label">Transactions to review</span>
              <ul className="spending-watch-review-list">
                {review.items.map((item) => (
                  <li key={item.id} className="spending-watch-review-row">
                    <div className="spending-watch-review-main">
                      <span className="spending-watch-review-name">
                        {item.name}{item.amount ? ` · ${item.amount}` : ''}
                      </span>
                      <ExpandableContext
                        itemId={item.id}
                        storageKey={storageKey}
                        seedFactory={seedFactory}
                        isLocked={isLocked}
                      />
                    </div>
                    <p className="spending-watch-review-reason">{item.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
