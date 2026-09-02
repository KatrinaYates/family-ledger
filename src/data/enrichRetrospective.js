const GENERIC_FALLBACK_QUESTIONS = [
  {
    id: 'generic-alignment',
    question: 'What made it easier to stay aligned this month?',
    allowResponse: true,
    isGenericFallback: true,
  },
  {
    id: 'generic-expectation',
    question: 'Did we set an unrealistic expectation this month?',
    allowResponse: true,
    isGenericFallback: true,
  },
  {
    id: 'generic-experiment',
    question: 'What one experiment would make next month easier?',
    allowResponse: true,
    isGenericFallback: true,
  },
];

/** @param {object | undefined} meta */
function monthLabel(meta) {
  return meta?.month?.trim() || 'the month';
}

/**
 * @param {unknown} raw
 * @param {number} index
 */
function normalizeQuestion(raw, index) {
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text) return null;
    return {
      id: `question-${index + 1}`,
      question: text,
      allowResponse: true,
      isGenericFallback: true,
    };
  }

  if (!raw || typeof raw !== 'object') return null;

  const question = raw.question?.trim() || raw.text?.trim() || '';
  if (!question) return null;

  return {
    id: raw.id?.trim() || `question-${index + 1}`,
    question,
    context: raw.context?.trim() || undefined,
    allowResponse: raw.allowResponse !== false,
    isGenericFallback: Boolean(raw.isGenericFallback),
  };
}

/**
 * @param {object} sourceData
 * @param {object | undefined} meta
 */
export function enrichRetrospective(sourceData = {}, meta) {
  const retrospective = sourceData.retrospective ?? {};
  const meeting = sourceData.meeting ?? {};

  let questionsToConsider = (retrospective.questionsToConsider ?? [])
    .map(normalizeQuestion)
    .filter(Boolean);

  if (!questionsToConsider.length) {
    const legacyQuestions = (meeting.questions ?? [])
      .map(normalizeQuestion)
      .filter(Boolean);

    if (legacyQuestions.length) {
      questionsToConsider = legacyQuestions.map((item) => ({
        ...item,
        isGenericFallback: true,
      }));
    } else {
      questionsToConsider = GENERIC_FALLBACK_QUESTIONS;
    }
  }

  return {
    subtitle: retrospective.subtitle?.trim()
      || `A quick look back at ${monthLabel(meta)} before we decide what comes next.`,
    questionsToConsider,
  };
}
