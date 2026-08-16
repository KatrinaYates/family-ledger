import React from 'react';
import {
  NOTEBOOK_SYMBOLS,
  QuestionList,
  StickyCard,
  ToneChip,
  WarningBanner,
} from '../content/NotebookPrimitives';
import {
  CardGrid,
  DecorativeStickyNote,
  PanelSurface,
  SectionBlock,
} from '../notebook';
import { SectionPageShell } from './SectionPageShell';
import './reviewPages.css';

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
        <span className="panel-module__label">
          <span className="notebook-symbol" aria-hidden="true">{NOTEBOOK_SYMBOLS.target}</span>{' '}
          {priority.priorityLabel}
        </span>
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
          <h3 className="section-inline-heading">
            <span className="notebook-symbol" aria-hidden="true">{NOTEBOOK_SYMBOLS.talk}</span>{' '}
            What this asks us to decide
          </h3>
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
      <div
        className="cfo-advice-page"
        style={{ '--content-block-max-cqw': '100cqw', width: '100%', maxWidth: '100%' }}
      >
        {first && (
          <SectionBlock label="Start Here" className="cfo-primary-recommendation">
            <CardGrid layout="mainSidebar">
              <RecommendationCard priority={first} featured />
              <aside className="snapshot-side">
                <DecorativeStickyNote tone="lav" title="CFO lens" fill>
                  Start with the recommendation that would create the most breathing room. We only need to decide what fits our family — not follow every suggestion.
                </DecorativeStickyNote>
              </aside>
            </CardGrid>
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
