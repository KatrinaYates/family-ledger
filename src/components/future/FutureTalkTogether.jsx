import React from 'react';

/** @param {{ talkTogetherLabel?: string, discussionPrompts?: string[] }} props */
export function FutureTalkTogether({ talkTogetherLabel, discussionPrompts }) {
  if (!discussionPrompts?.length) return null;

  return (
    <section className="spending-block" aria-label={talkTogetherLabel}>
      <h2 className="month-snapshot-section-heading">{talkTogetherLabel}</h2>
      <div className="paper-surface spending-panel-surface">
        <ul className="spending-watch-sublist future-talk-prompts">
          {discussionPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
