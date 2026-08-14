import React from 'react';
import { QuestionList } from '../content/NotebookPrimitives';
import { DecorativeStickyNote } from '../notebook';
import { sectionFieldKey } from '../../utils/meetingKeys';

/** @param {{ talkTogetherLabel?: string, discussionPrompts?: string[], monthId?: string }} props */
export function FutureTalkTogether({ talkTogetherLabel, discussionPrompts, monthId }) {
  if (!discussionPrompts?.length) return null;

  return (
    <section className="future-talk" aria-label={talkTogetherLabel}>
      <DecorativeStickyNote
        tone="lav"
        title={talkTogetherLabel}
        fill
        className="future-talk-card"
      >
        <QuestionList
          editable
          storageKey={sectionFieldKey(monthId, 'future', 'talk-together')}
          items={discussionPrompts}
          script
        />
      </DecorativeStickyNote>
    </section>
  );
}
