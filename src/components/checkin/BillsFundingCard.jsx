import React from 'react';
import { PanelCard } from '../content/NotebookPrimitives';
import { MiniBalanceBar, ProgressBar } from './CheckInVisuals';

function BucketRow({ bucket }) {
  return (
    <div className={`check-in-bucket-row ${bucket.statusClass}`}>
      <div className="check-in-bucket-copy">
        <span className="check-in-bucket-name">{bucket.name}</span>
        <span className="check-in-bucket-amounts">
          {bucket.currentLabel}
          {bucket.targetLabel ? ` / ${bucket.targetLabel}` : ''}
        </span>
        <span className={`check-in-bucket-status ${bucket.statusClass}`}>{bucket.statusLabel}</span>
      </div>
      {bucket.progressPercent != null && (
        <ProgressBar
          percent={bucket.progressPercent}
          label={`${bucket.progressPercent}%`}
          tone={bucket.progressTone}
          ariaLabel={`${bucket.name} bucket ${bucket.currentLabel}${bucket.targetLabel ? ` of ${bucket.targetLabel}` : ''}, ${bucket.statusLabel}`}
          className="check-in-bucket-progress"
        />
      )}
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
          {bills.fundingGapLabel && (
            <p className={bills.isFullyFunded ? 'is-funded' : 'is-short'}>
              <span>Funding gap</span>
              <strong>{bills.isFullyFunded ? 'Fully funded' : bills.fundingGapLabel}</strong>
            </p>
          )}
          {bills.fundedSummary && <p className="check-in-bills-count">{bills.fundedSummary}</p>}
        </div>
      )}
    >
      <p className="check-in-card-lead">
        Bills account money is committed, not spendable. Required buckets exclude the credit card estimate bucket.
      </p>

      {bills.fundedPercent != null && (
        <div className="check-in-bills-progress-block">
          <div className="check-in-bills-progress-header">
            <span>Bills funding progress</span>
            <strong>{bills.fundingProgressLabel}</strong>
          </div>
          <ProgressBar
            percent={bills.fundedPercent}
            label={bills.fundingProgressLabel}
            tone={bills.isFullyFunded ? 'green' : 'yellow'}
            ariaLabel={bills.fundingAriaLabel}
          />
          <div className="check-in-bills-progress-stats">
            {bills.balanceLabel && (
              <p><span>Current Bills balance</span><strong>{bills.balanceLabel}</strong></p>
            )}
            {bills.requiredTotalLabel && (
              <p><span>Required total</span><strong>{bills.requiredTotalLabel}</strong></p>
            )}
            {bills.fundedAmountLabel && (
              <p><span>Funded amount</span><strong>{bills.fundedAmountLabel}</strong></p>
            )}
          </div>
        </div>
      )}

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
