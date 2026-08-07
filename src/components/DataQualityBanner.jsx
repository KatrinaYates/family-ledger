import React from 'react';
import { useMonthContext } from '../context/MonthContext';
import { collectDataQualityItems } from '../data/normalizeDataQuality';
import { useLedgerRecord } from '../hooks/useLedgerRecord';

export function DataQualityBanner() {
  const { monthId } = useMonthContext();
  const { record, loading, error } = useLedgerRecord(monthId);

  if (loading || error || !record) return null;

  const items = collectDataQualityItems(record.dataQuality);
  if (!items.length) return null;

  return (
    <div className="data-quality-banner" role="status" aria-live="polite">
      <p className="data-quality-banner-title">Data quality notes</p>
      <ul className="data-quality-banner-list">
        {items.map((item, index) => (
          <li key={`${item.kind}-${index}`}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
