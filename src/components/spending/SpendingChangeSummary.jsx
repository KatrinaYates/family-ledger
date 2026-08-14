import React from 'react';
import { StickyCard } from '../content/NotebookPrimitives';
import { PanelSurface, SectionBlock } from '../notebook';

function ChangeGroup({ title, items, tone }) {
  if (!items?.length) return null;

  return (
    <StickyCard label={title} tone={tone} variant="priority" className="spending-change-group">
      <ul className="spending-change-list">
        {items.map((item) => (
          <li key={item.category} className="spending-change-row">
            <div className="spending-change-row-main">
              <span className="spending-change-category">{item.category}</span>
              <span className={`spending-change-amount spending-change-${tone === 'focus' ? 'up' : 'down'}`}>
                {item.changeLabel}
              </span>
            </div>
            {item.reason && (
              <p className="spending-change-reason">{item.reason}</p>
            )}
          </li>
        ))}
      </ul>
    </StickyCard>
  );
}

export function SpendingChangeSummary({ whatChanged }) {
  if (!whatChanged) return null;

  return (
    <SectionBlock label={whatChanged.title} className="spending-changes">
      <PanelSurface>
        {whatChanged.hasChanges ? (
          <div className="spending-change-stack">
            <ChangeGroup
              title="Biggest increases"
              items={whatChanged.increased}
              tone="focus"
            />
            <ChangeGroup
              title="Biggest decreases"
              items={whatChanged.decreased}
              tone="win"
            />
          </div>
        ) : whatChanged.emptyMessage ? (
          <p className="panel-note">{whatChanged.emptyMessage}</p>
        ) : null}
      </PanelSurface>
    </SectionBlock>
  );
}
