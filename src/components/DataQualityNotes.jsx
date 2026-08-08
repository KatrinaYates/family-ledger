import React from 'react';
import { collectDataQualityItems } from '../data/normalizeDataQuality';
import { useLedgerRecord } from '../hooks/useLedgerRecord';

/** Collapsed-by-default toolbar disclosure for data quality notes. */
export function DataQualityNotes({ monthId }) {
  const { record, loading, error } = useLedgerRecord(monthId);

  if (!monthId || loading || error || !record) return null;

  const items = collectDataQualityItems(record.dataQuality);
  if (!items.length) return null;

  return (
    <details className="data-quality-notes">
      <summary className="data-quality-notes-trigger">Data notes ({items.length})</summary>
      <div className="data-quality-notes-panel" role="note">
        <p className="data-quality-notes-title">Data quality notes</p>
        <ul className="data-quality-notes-list">
          {items.map((item, index) => (
            <li key={`${item.kind}-${index}`}>{item.text}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
