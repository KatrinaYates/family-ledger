export function enrichActions(actions = {}) {
  return {
    items: actions.items ?? [],
    monthlyFocus: actions.monthlyFocus?.trim() || '',
  };
}
