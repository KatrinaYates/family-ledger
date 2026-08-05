import { enrichSnapshot } from './enrichSnapshot.js';
import { enrichStory } from './enrichStory.js';
import { enrichSpending } from './enrichSpending.js';
import { enrichCfo } from './enrichCfo.js';
import { enrichFuture } from './enrichFuture.js';
import { enrichMeeting } from './enrichMeeting.js';
import { enrichActions } from './enrichActions.js';
import { enrichCelebrate } from './enrichCelebrate.js';
import { enrichHandoff } from './enrichHandoff.js';

export function enrichJulyData(data) {
  return {
    ...data,
    snapshot: enrichSnapshot(data.snapshot, data.meta),
    story: enrichStory(data.story),
    spending: enrichSpending(data.spending),
    cfo: enrichCfo(data.cfo),
    future: enrichFuture(data.future),
    meeting: enrichMeeting(data.meeting),
    actions: enrichActions(data.actions),
    celebrate: enrichCelebrate(data.celebrate, data.meta),
    handoff: enrichHandoff(data.handoff),
  };
}
