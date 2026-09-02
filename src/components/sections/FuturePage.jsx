import React from 'react';
import { SectionPageShell } from './SectionPageShell';
import { FutureAtAGlance } from '../future/FutureAtAGlance';
import { FutureDirection } from '../future/FutureDirection';
import { FutureComingUp } from '../future/FutureComingUp';
import { FutureTalkTogether } from '../future/FutureTalkTogether';
import { FutureFinancialSections } from '../future/FutureFinancialSections';

export function FuturePage({ data, month, section }) {
  const { future } = data;
  const hasGlance = Boolean(future.futureProgress?.total);
  const hasDirection = Boolean(future.direction?.length);
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

        <FutureFinancialSections
          debt={future.debt}
          payoffPlan={future.debtPayoffPlan}
          emergencyFund={future.emergencyFund}
          savings={future.savings}
          retirement={future.retirement}
          monthLabel={month.label}
        />

        {hasDirection && (
          <FutureDirection
            directionLabel={future.directionLabel}
            direction={future.direction}
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
