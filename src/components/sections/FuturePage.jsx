import React from 'react';
import { SectionPageShell } from './SectionPageShell';
import { FutureAtAGlance } from '../future/FutureAtAGlance';
import { FutureGoals } from '../future/FutureGoals';
import { FutureMonthlyActivity } from '../future/FutureMonthlyActivity';
import { FutureComingUp } from '../future/FutureComingUp';
import { FutureTalkTogether } from '../future/FutureTalkTogether';

export function FuturePage({ data, month, section }) {
  const { future } = data;

  return (
    <SectionPageShell
      sectionId="future"
      section={section}
      month={month}
      data={data}
      subtitle={future.subtitle}
    >
      <div className="spending-page future-page">
        <FutureAtAGlance
          atAGlanceLabel={future.atAGlanceLabel}
          futureProgress={future.futureProgress}
          summary={future.summary}
        />
        <FutureGoals
          goalsLabel={future.goalsLabel}
          goals={future.goals}
        />
        <FutureMonthlyActivity
          activityLabel={future.activityLabel}
          monthlyActivity={future.monthlyActivity}
        />
        <FutureComingUp
          comingUpLabel={future.comingUpLabel}
          comingUp={future.comingUp}
        />
        <FutureTalkTogether
          talkTogetherLabel={future.talkTogetherLabel}
          discussionPrompts={future.discussionPrompts}
        />
      </div>
    </SectionPageShell>
  );
}
