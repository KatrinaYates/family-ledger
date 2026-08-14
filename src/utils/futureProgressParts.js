const COMPONENT_LABELS = {
  Retirement: 'Retirement',
  'Kids savings': 'Kids savings',
  'Emergency fund': 'Emergency fund',
  'Other savings': 'Other savings',
  'Debt payments': 'Debt payments',
};

const COMPONENT_TONES = {
  Retirement: 'win',
  'Kids savings': 'family',
  'Emergency fund': 'safety',
  'Other savings': 'ready',
  'Debt payments': 'focus',
};

/** Map futureProgress.components to ComposedMoneyGrid part rows. */
export function buildFutureProgressParts(components = []) {
  return components.map((component) => {
    const isDebt = component.label === 'Debt payments';
    const value = isDebt
      ? component.value
      : `+${String(component.value).replace(/^\+/, '')}`;

    return {
      label: COMPONENT_LABELS[component.label] ?? component.label,
      value,
      tone: COMPONENT_TONES[component.label] ?? 'win',
    };
  });
}
