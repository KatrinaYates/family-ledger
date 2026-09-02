import React, { useState } from 'react';
import { ExpandableContextNote, InsightList, PanelOkLine } from '../content/NotebookPrimitives';
import { PanelModule, PanelSurface, SectionBlock } from '../notebook';
import { useMeetingJson } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';

function PersistedExpandableContext({
  itemId,
  storageKey,
  seedFactory,
  isLocked,
  placeholder = 'Add context...',
}) {
  const { value: contexts, setValue: setContexts } = useMeetingJson(storageKey, seedFactory);
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

  return (
    <ExpandableContextNote
      value={context}
      onChange={updateContext}
      readOnly={isLocked}
      placeholder={placeholder}
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
    <PanelModule label="Subscriptions & recurring">
      {recurring.summary && (
        <span className="panel-module__value">{recurring.summary}</span>
      )}

      {recurring.stable && (
        <PanelOkLine>{recurring.stableMessage}</PanelOkLine>
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
    </PanelModule>
  );
}

export function SpendingWatch({ spendingWatch, monthId }) {
  if (!spendingWatch) return null;
  return <SpendingWatchBody spendingWatch={spendingWatch} monthId={monthId} />;
}

function SpendingWatchBody({ spendingWatch, monthId }) {
  const storageKey = sectionFieldKey(monthId, 'spending', 'watch-contexts');
  const seedFactory = () => (
    (spendingWatch.review?.items ?? []).map((item) => ({ id: item.id, context: '' }))
  );
  const { isLocked } = useMeetingJson(storageKey, seedFactory);

  const { patterns, recurring, fees, review } = spendingWatch;
  const hasReview = review?.hasItems;

  return (
    <SectionBlock label="Spending Watch" className="spending-watch">
      <PanelSurface className="spending-watch-panel">
        <PanelModule label="Patterns worth noticing">
          {patterns?.status === 'alert' && patterns.items?.length ? (
            <InsightList items={patterns.items} />
          ) : (
            <PanelOkLine>{patterns?.okMessage}</PanelOkLine>
          )}
        </PanelModule>

        <RecurringModule recurring={recurring} />

        {fees && (
          <PanelModule label="Fees">
            {fees.status === 'ok' ? (
              <PanelOkLine>{fees.okMessage}</PanelOkLine>
            ) : (
              <>
                <span className="panel-module__value">{fees.total} found</span>
                <ul className="spending-watch-sublist">
                  {fees.items.map((item) => (
                    <li key={item.name}>{item.name} · {item.amount}</li>
                  ))}
                </ul>
              </>
            )}
          </PanelModule>
        )}

        {hasReview && (
          <PanelModule label="Transactions to review" className="panel-module--review">
            <ul className="spending-watch-review-list">
              {review.items.map((item) => (
                <li key={item.id} className="spending-watch-review-row">
                  <div className="spending-watch-review-main">
                    <span className="spending-watch-review-name">
                      {item.name}{item.amount ? ` · ${item.amount}` : ''}
                    </span>
                    <PersistedExpandableContext
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
          </PanelModule>
        )}
      </PanelSurface>
    </SectionBlock>
  );
}
