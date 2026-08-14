import React from 'react';
import {
  QuestionList,
  StickyCard,
  ToneChip,
  WarningBanner,
} from '../content/NotebookPrimitives';
import { CardGrid, PanelSurface, SectionBlock } from '../notebook';
import { SectionPageShell } from './SectionPageShell';

function difficultyTone(difficulty) {
  const value = difficulty?.toLowerCase() ?? '';
  if (value.includes('low')) return 'good';
  if (value.includes('high')) return 'watch';
  return 'neutral';
}

function RecommendationCard({ priority, featured = false }) {
  return (
    <PanelSurface className={`cfo-recommendation-card${featured ? ' is-featured' : ''}`}>
      <div className="cfo-recommendation-heading">
        <span className="panel-module__label">{priority.priorityLabel}</span>
        {priority.difficulty && (
          <ToneChip tone={difficultyTone(priority.difficulty)}>{priority.difficulty} effort</ToneChip>
        )}
      </div>

      <h2 className="cfo-recommendation-title">{priority.title}</h2>

      <CardGrid columns={2} className="cfo-recommendation-detail-grid">
        <StickyCard label="Why this matters" tone="context" fill>
          <p>{priority.why}</p>
        </StickyCard>
        <StickyCard label="What this could improve" tone="win" fill>
          <p>{priority.benefit}</p>
        </StickyCard>
      </CardGrid>

      {priority.decisions?.length > 0 && (
        <div className="cfo-recommendation-decisions">
          <h3 className="section-inline-heading">What this asks us to decide</h3>
          <QuestionList items={priority.decisions} />
        </div>
      )}

      {priority.suggestedFunds?.length > 0 && (
        <p className="panel-note">
          <strong>Possible funding:</strong> {priority.suggestedFunds.join(' · ')}
        </p>
      )}

      {priority.note && (
        <WarningBanner compact label={null}>{priority.note}</WarningBanner>
      )}
    </PanelSurface>
  );
}

export function CfoPage({ data, month, section }) {
  const { cfo } = data;
  const [first, ...rest] = cfo.priorities ?? [];

  return (
    <SectionPageShell
      sectionId="cfo"
      section={section}
      month={month}
      data={data}
      subtitle={cfo.overview?.subtitle}
    >
      <div className="cfo-advice-page">
        {first && (
          <SectionBlock label="Start Here" className="cfo-primary-recommendation">
            <RecommendationCard priority={first} featured />
          </SectionBlock>
        )}

        {rest.length > 0 && (
          <SectionBlock label="Then Consider" className="cfo-next-recommendations">
            <div className="cfo-recommendation-stack">
              {rest.map((priority) => (
                <RecommendationCard key={priority.number} priority={priority} />
              ))}
            </div>
          </SectionBlock>
        )}

        <StickyCard label="This page is advice, not a decision" tone="context" fill>
          <p>
            Use the next section to record what we actually agree to do, change, postpone, or leave alone.
          </p>
        </StickyCard>
      </div>
    </SectionPageShell>
  );
}
