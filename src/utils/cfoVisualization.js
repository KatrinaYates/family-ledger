function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/** @param {object | undefined} visualization */
export function canRenderCfoVisualization(visualization) {
  if (!visualization?.type) return false;

  if (visualization.type === 'balance_comparison' || visualization.type === 'payment_comparison') {
    return isFiniteNumber(visualization.currentValue) && isFiniteNumber(visualization.projectedValue);
  }

  if (visualization.type === 'allocation') {
    return (visualization.items ?? []).some((item) => isFiniteNumber(item.value));
  }

  if (visualization.type === 'timeline') {
    const points = visualization.items ?? visualization.points ?? [];
    return points.filter((item) => isFiniteNumber(item.value)).length >= 2;
  }

  return false;
}
