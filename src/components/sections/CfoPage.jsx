import React from 'react';
import { SectionBlock } from '../notebook';
import { SectionPageShell } from './SectionPageShell';
import { CfoCurrentUpdate } from '../cfo/CfoCurrentUpdate.jsx';
import { CfoRecommendationCard } from '../cfo/CfoRecommendationCard.jsx';
import './reviewPages.css';

export function CfoPage({ data, month, section }) {
  const { cfo } = data;
  const recommendations = (cfo.recommendations ?? []).slice(0, 3);
  const [first, ...rest] = recommendations;

  return (
    <SectionPageShell
      sectionId="cfo"
      section={section}
      month={month}
      data={data}
      subtitle={cfo.overview?.subtitle}
    >
      <div
        className="cfo-advice-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        <CfoCurrentUpdate update={cfo.currentUpdate} />

        {first && (
          <SectionBlock label="Top Recommendation" className="cfo-primary-recommendation">
            <CfoRecommendationCard recommendation={first} featured />
          </SectionBlock>
        )}

        {rest.length > 0 && (
          <SectionBlock label="Also Consider" className="cfo-next-recommendations">
            <div className="cfo-recommendation-stack">
              {rest.map((recommendation) => (
                <CfoRecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          </SectionBlock>
        )}
      </div>
    </SectionPageShell>
  );
}
