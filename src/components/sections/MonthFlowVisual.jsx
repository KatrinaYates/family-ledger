import React from 'react';

/**
 * Parallel month money summary — independent views, not a sequential flow.
 * @param {{ heading?: string, support?: string, blocks?: Array<{ key: string, title: string, subtitle: string, value?: string, components?: Array<{ label: string, value: string }> }> }} props
 */
export function MonthMoneySummary({ heading = 'Money this month', support, blocks = [] }) {
  if (blocks.length === 0) return null;

  return (
    <section className="month-snapshot-money paper-surface" aria-label={heading}>
      <h2 className="month-snapshot-section-heading">{heading}</h2>
      {support && <p className="panel-note month-snapshot-money-support">{support}</p>}
      <div className="month-snapshot-money-grid">
        {blocks.map((block) => (
          <article key={block.key} className="month-snapshot-money-block">
            <span className="month-snapshot-money-block-title">{block.title}</span>
            {block.components?.length ? (
              <ul className="month-snapshot-money-block-components">
                {block.components.map((item) => (
                  <li key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              block.value && (
                <strong className="month-snapshot-money-block-value">{block.value}</strong>
              )
            )}
            <span className="month-snapshot-money-block-subtitle">{block.subtitle}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
