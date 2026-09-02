import React from 'react';
import { PanelSurface, SectionBlock } from '../notebook';

export function CfoCurrentUpdate({ update }) {
  if (!update?.metrics?.length) return null;

  return (
    <SectionBlock label="Since Month-End" className="cfo-current-update">
      <PanelSurface>
        {update.note && <p className="panel-note">{update.note}</p>}
        <div className="meeting-update-list">
          {update.metrics.map((metric) => (
            <p className="panel-note" key={metric.label}>
              <strong>{metric.label}</strong>: {metric.monthEnd} at month-end → {metric.current} latest connected{' '}
              <span>({metric.change})</span>
            </p>
          ))}
        </div>
        {update.debtBreakdown && (
          <p className="panel-note">
            Latest connected debt: {update.debtBreakdown.creditCards} credit cards + {update.debtBreakdown.loans} loans.
          </p>
        )}
        {update.coverageNote && <p className="panel-note">{update.coverageNote}</p>}
      </PanelSurface>
    </SectionBlock>
  );
}
