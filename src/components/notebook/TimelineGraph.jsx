import React from 'react';
import './timeline-graph.css';

/**
 * Ordered milestone timeline for plans with meaningful dates or checkpoints.
 * @param {{ milestones: Array<{label:string, title:string, value?:string, detail?:string}>, title?:string, className?:string }} props
 */
export function TimelineGraph({ milestones = [], title, className = '' }) {
  const validMilestones = milestones.filter((item) => item?.label && item?.title);
  if (!validMilestones.length) return null;

  const summary = validMilestones
    .map((item) => [item.label, item.title, item.value, item.detail].filter(Boolean).join(' · '))
    .join(', ');

  return (
    <figure className={`paper-surface notebook-timeline-graph ${className}`.trim()}>
      {title && <figcaption className="notebook-chart-title">{title}</figcaption>}
      <div className="notebook-timeline-scroll" role="img" aria-label={summary}>
        <ol
          className="notebook-timeline-track"
          style={{ '--timeline-count': validMilestones.length }}
        >
          {validMilestones.map((item, index) => (
            <li
              key={`${item.label}-${item.title}-${index}`}
              className={`notebook-timeline-milestone ${index === 0 ? 'is-start' : ''} ${index === validMilestones.length - 1 ? 'is-end' : ''}`.trim()}
            >
              <span className="notebook-timeline-date">{item.label}</span>
              <div className="notebook-timeline-marker-row" aria-hidden="true">
                <span className="notebook-timeline-marker" />
              </div>
              <div className="notebook-timeline-copy">
                <strong>{item.title}</strong>
                {item.value && <b>{item.value}</b>}
                {item.detail && <small>{item.detail}</small>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
