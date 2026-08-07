import React, { useMemo } from 'react';
import { useMonthContext } from '../context/MonthContext';
import { collectDataQualityItems } from '../data/normalizeDataQuality';
import { ledgerRepository } from '../repository';

export function DataQualityBanner() {
  const { monthId } = useMonthContext();
  const items = useMemo(() => {
    const record = ledgerRepository.getLedgerRecord(monthId);
    return collectDataQualityItems(record?.dataQuality);
  }, [monthId]);

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
