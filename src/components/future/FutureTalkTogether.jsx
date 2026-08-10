import React from 'react';

/** @param {{ talkTogetherLabel?: string, discussionPrompts?: string[] }} props */
export function FutureTalkTogether({ talkTogetherLabel, discussionPrompts }) {
  if (!discussionPrompts?.length) return null;

  return (
    <section className="future-talk" aria-label={talkTogetherLabel}>
      <article className="paper-surface spending-panel-surface">
        <h2 className="spending-watch-module-label future-footer-panel-label">
          {talkTogetherLabel}
        </h2>
        <ul className="future-talk-prompts">
          {discussionPrompts.map((prompt) => (
            <li key={prompt}>
              <span className="future-talk-bullet" aria-hidden="true">○</span>
              {prompt}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
