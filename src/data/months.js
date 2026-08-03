export const months = [
  {
    id: 'july',
    label: 'July',
    chapter: 'Chapter Seven',
    title: 'July Money Meeting',
    status: 'active',
    teaser: '',
  },
  { id: 'august', label: 'August', chapter: 'Chapter Eight', title: 'August Money Meeting', status: 'locked', teaser: 'Up next ✦' },
  { id: 'september', label: 'September', chapter: 'Chapter Nine', title: 'September Money Meeting', status: 'locked', teaser: 'Waiting in the wings' },
  { id: 'october', label: 'October', chapter: 'Chapter Ten', title: 'October Money Meeting', status: 'locked', teaser: 'Almost our turn' },
  { id: 'november', label: 'November', chapter: 'Chapter Eleven', title: 'November Money Meeting', status: 'locked', teaser: 'Saved for later' },
  { id: 'december', label: 'December', chapter: 'Chapter Twelve', title: 'December Money Meeting', status: 'locked', teaser: 'Year-end sparkle' },
];

export const createBlankMonth = () => ({
  overallScore: 'Steady',
  biggestWin: '',
  biggestChallenge: '',
  monthStory: '',
  patterns: '',
  futureUs: '',
  decisions: [],
  actions: [],
});
