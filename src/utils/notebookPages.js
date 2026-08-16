import { getMonthCatalogEntry } from '../data/months';
import { MONTH_SECTION_IDS } from '../data/monthSections';

const LINEAR_GLOBAL_PAGES = [
  { id: 'cover', type: 'cover', label: 'Front Cover' },
  { id: 'inside', type: 'inside', label: 'Inside Cover' },
];

/** Reachable via header buttons only — not part of left/right page flow. */
const UTILITY_PAGES = [
  { id: 'check-in', type: 'check-in', label: 'Financial Check-In' },
  { id: 'notebook-kit', type: 'notebook-kit', label: 'Notebook Kit' },
];

/** @param {string} monthId @param {string} monthLabel @param {Record<string, { title?: string }>} [sections] */
export function buildMonthPages(monthId, monthLabel, sections = {}) {
  return [
    { id: monthId, type: 'month', monthId, label: `${monthLabel} Chapter` },
    ...MONTH_SECTION_IDS.map((sectionId) => ({
      id: `${monthId}-${sectionId}`,
      type: 'content',
      monthId,
      sectionId,
      label: sections[sectionId]?.title ?? sectionId,
    })),
  ];
}

function buildMonthPageList(availableMonthIds, sections) {
  return availableMonthIds.flatMap((monthId) => {
    const catalog = getMonthCatalogEntry(monthId);
    const label = catalog?.label ?? monthId;
    return buildMonthPages(monthId, label, sections);
  });
}

/** Cover → inside → month chapters (arrow left/right flow). */
export function buildLinearNotebookPages(availableMonthIds, sections = {}) {
  return [...LINEAR_GLOBAL_PAGES, ...buildMonthPageList(availableMonthIds, sections)];
}

/** All valid page IDs, including utility pages opened from the header. */
export function buildNotebookPages(availableMonthIds, sections = {}) {
  return [
    ...LINEAR_GLOBAL_PAGES,
    ...UTILITY_PAGES,
    ...buildMonthPageList(availableMonthIds, sections),
  ];
}
