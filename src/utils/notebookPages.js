import { getMonthCatalogEntry } from '../data/months';
import { MONTH_SECTION_IDS } from '../data/monthSections';

const GLOBAL_PAGES = [
  { id: 'cover', type: 'cover', label: 'Front Cover' },
  { id: 'inside', type: 'inside', label: 'Inside Cover' },
  { id: 'check-in', type: 'check-in', label: 'Financial Check-In' },
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

/** @param {string[]} availableMonthIds @param {Record<string, { title?: string }>} [sections] */
export function buildNotebookPages(availableMonthIds, sections = {}) {
  const monthPages = availableMonthIds.flatMap((monthId) => {
    const catalog = getMonthCatalogEntry(monthId);
    const label = catalog?.label ?? monthId;
    return buildMonthPages(monthId, label, sections);
  });
  return [...GLOBAL_PAGES, ...monthPages];
}
