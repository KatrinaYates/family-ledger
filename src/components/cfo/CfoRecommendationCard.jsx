import React from 'react';
import {
  DetailRows,
  StickyCard,
  ToneChip,
  WarningBanner,
} from '../content/NotebookPrimitives';
import { CardGrid, PanelSurface } from '../notebook';
import { formatCurrencyDetailed } from '../../data/spendingAnalysis.js';
import { CfoRecommendationVisualization } from './CfoRecommendationVisualization.jsx';

function confidenceTone(confidence) {
  const value = String(confidence ?? '').toLowerCase();
  if (value === 'high') return 'good';
  if (value === 'low') return 'watch';
  return 'neutral';
}

function formatOptionalCurrency(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? formatCurrencyDetailed(value, true)
    : null;
}

/**
 * @param {{ recommendation: object, featured?: boolean }} props
 */
export function CfoRecommendationCard({ recommendation, featured = false }) {
  const {
    headline,
    action,
    timeframe,
    amountFreed,
    target,
    impact,
    evidence,
    calculationLine,
    assumptions,
    confidence,
    visualization,
    note,
    difficulty,
    suggestedFunds,
    legacyWhy,
    legacyBenefit,
    isLegacy,
    rank,
  } = recommendation;

  if (isLegacy) {
    return (
      <PanelSurface className={`cfo-recommendation-card${featured ? ' is-featured' : ''}`}>
        <div className="cfo-recommendation-heading">
          <span className="panel-module__label">Recommendation {rank}</span>
          <ToneChip tone="neutral">Legacy format</ToneChip>
        </div>
        <h2 className="cfo-recommendation-title">{headline}</h2>
        {action && <p className="panel-note">{action}</p>}
        {(legacyWhy || legacyBenefit) && (
          <CardGrid columns={2} className="cfo-recommendation-detail-grid">
            {legacyWhy && (
              <StickyCard label="Why this matters" tone="context" fill>
                <p>{legacyWhy}</p>
              </StickyCard>
            )}
            {legacyBenefit && (
              <StickyCard label="What this could improve" tone="win" fill>
                <p>{legacyBenefit}</p>
              </StickyCard>
            )}
          </CardGrid>
        )}
        {note && <WarningBanner compact label={null}>{note}</WarningBanner>}
      </PanelSurface>
    );
  }

  const detailRows = [
    action ? { label: 'Do this', value: action } : null,
    timeframe ? { label: 'Timeframe', value: timeframe } : null,
    formatOptionalCurrency(amountFreed) ? { label: 'This frees or redirects', value: formatOptionalCurrency(amountFreed) } : null,
    target?.name ? {
      label: 'Put it here',
      value: [
        target.name,
        formatOptionalCurrency(target.currentBalance) && formatOptionalCurrency(target.projectedBalance)
          ? `${formatOptionalCurrency(target.currentBalance)} → ${formatOptionalCurrency(target.projectedBalance)}`
          : formatOptionalCurrency(target.currentBalance),
      ].filter(Boolean).join(' · '),
    } : null,
    formatOptionalCurrency(impact?.extraPayment) ? {
      label: 'Expected result',
      value: [
        `${formatOptionalCurrency(impact.extraPayment)} extra payment`,
        impact.payoffTimeReducedMonths != null ? `${impact.payoffTimeReducedMonths} months sooner` : null,
        formatOptionalCurrency(impact.interestAvoided) ? `${formatOptionalCurrency(impact.interestAvoided)} interest avoided` : null,
      ].filter(Boolean).join(' · '),
    } : (
      target?.projectedBalance != null && target?.currentBalance != null
        ? {
          label: 'Expected result',
          value: `${formatOptionalCurrency(target.currentBalance)} → ${formatOptionalCurrency(target.projectedBalance)}`,
        }
        : null
    ),
  ].filter(Boolean);

  const hasVisualization = Boolean(visualization?.type);
  const chart = hasVisualization ? (
    <CfoRecommendationVisualization visualization={visualization} />
  ) : null;

  return (
    <PanelSurface className={`cfo-recommendation-card${featured ? ' is-featured' : ''}`}>
      <div className="cfo-recommendation-heading">
        <span className="panel-module__label">{featured ? 'Top recommendation' : `Recommendation ${rank}`}</span>
        {confidence && <ToneChip tone={confidenceTone(confidence)}>{confidence} confidence</ToneChip>}
        {difficulty && <ToneChip tone="neutral">{difficulty}</ToneChip>}
      </div>

      <h2 className="cfo-recommendation-title">{headline}</h2>

      {detailRows.length > 0 && <DetailRows rows={detailRows} />}

      {evidence?.length > 0 && (
        <div className="cfo-recommendation-evidence">
          <h3 className="section-inline-heading">Evidence</h3>
          <DetailRows
            rows={evidence.map((item) => ({
              label: item.label,
              value: typeof item.value === 'number' ? formatCurrencyDetailed(item.value, true) : String(item.value ?? ''),
            }))}
          />
        </div>
      )}

      {calculationLine && (
        <p className="panel-note cfo-recommendation-calculation">
          <strong>How this was estimated:</strong> {calculationLine}
        </p>
      )}

      {chart || (
        hasVisualization && (
          <p className="panel-note">More information is needed to estimate this accurately.</p>
        )
      )}

      {assumptions?.length > 0 && (
        <ul className="cfo-recommendation-assumptions panel-note">
          {assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {suggestedFunds?.length > 0 && (
        <p className="panel-note">
          <strong>Possible funding:</strong> {suggestedFunds.join(' · ')}
        </p>
      )}

      {note && <WarningBanner compact label={null}>{note}</WarningBanner>}
    </PanelSurface>
  );
}
