import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';

function BucketRow({ bucket }) {
  const statusClass = bucket.funded ? 'is-funded' : 'is-short';
  const statusLabel = bucket.funded ? 'Funded' : 'Short';

  return (
    <div className={`check-in-bucket-row ${statusClass}`}>
      <span className="check-in-bucket-name">{bucket.name}</span>
      <span className="check-in-bucket-amounts">
        {bucket.currentLabel}
        {bucket.targetLabel ? ` / ${bucket.targetLabel}` : ''}
      </span>
      <span className={`check-in-bucket-status ${statusClass}`}>{statusLabel}</span>
    </div>
  );
}

export function BillsFundingCard({ bills }) {
  if (!bills) return null;

  const hasContent =
    bills.balanceLabel
    || bills.requiredTotalLabel
    || bills.fundingGapLabel
    || bills.fundedSummary
    || (bills.buckets ?? []).length > 0;

  if (!hasContent) return null;

  return (
    <PanelCard
      title="Bills funding"
      total={bills.balanceLabel || undefined}
      scrollLabel="Required bill buckets"
      className="check-in-card check-in-bills-card"
      footer={(
        <div className="check-in-bills-footer">
          {bills.requiredTotalLabel && (
            <p>
              <span>Required total</span>
              <strong>{bills.requiredTotalLabel}</strong>
            </p>
          )}
          {bills.fundingStatus && (
            <p className={bills.isFullyFunded ? 'is-funded' : 'is-short'}>
              <span>{bills.isFullyFunded ? 'Status' : 'Still needed'}</span>
              <strong>{bills.fundingStatus}</strong>
            </p>
          )}
          {bills.fundedSummary && <p className="check-in-bills-count">{bills.fundedSummary}</p>}
        </div>
      )}
    >
      <p className="check-in-card-lead">
        Bills account money is committed, not spendable. Required buckets exclude the credit card estimate bucket.
      </p>
      {(bills.buckets ?? []).length > 0 && (
        <div className="check-in-bucket-list" role="list">
          {bills.buckets.map((bucket) => (
            <BucketRow key={bucket.name} bucket={bucket} />
          ))}
        </div>
      )}
    </PanelCard>
  );
}
