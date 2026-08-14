import React from 'react';
import { SectionPageShell } from './SectionPageShell';
import { FutureAtAGlance } from '../future/FutureAtAGlance';
import { FutureGoals } from '../future/FutureGoals';
import { FutureComingUp } from '../future/FutureComingUp';
import { FutureTalkTogether } from '../future/FutureTalkTogether';

export function FuturePage({ data, month, section }) {
  const { future } = data;
  const hasGlance = Boolean(future.futureProgress?.total);
  const hasGoals = Boolean(future.goals?.length);
  const hasTalk = Boolean(future.discussionPrompts?.length);

  return (
    <SectionPageShell
      sectionId="future"
      section={section}
      month={month}
      data={data}
      subtitle={future.subtitle}
    >
      <div className="future-page">
        {hasGlance && (
          <FutureAtAGlance
            atAGlanceLabel={future.atAGlanceLabel}
            futureProgress={future.futureProgress}
            summary={future.summary}
          />
        )}

        {hasGoals && (
          <FutureGoals
            goalsLabel={future.goalsLabel}
            goals={future.goals}
          />
        )}

        <div className="future-footer">
          <FutureComingUp
            comingUpLabel={future.comingUpLabel}
            comingUp={future.comingUp}
            monthId={month.id}
          />
          {hasTalk && (
            <FutureTalkTogether
              talkTogetherLabel={future.talkTogetherLabel}
              discussionPrompts={future.discussionPrompts}
              monthId={month.id}
            />
          )}
        </div>
      </div>
    </SectionPageShell>
  );
}
