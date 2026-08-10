import { getMonthCatalogEntry } from '../data/months';
import { sectionPageCounts, sectionPageLabels } from '../data/sectionPageCounts';

const GLOBAL_PAGES = [
    { id: 'cover', type: 'cover', label: 'Front Cover' },
    { id: 'inside', type: 'inside', label: 'Inside Cover' },
    { id: 'check-in', type: 'check-in', label: 'Financial Check-In' },
];

/** @param {string} monthId @param {string} monthLabel @param {Record<string, { title?: string }>} [sections] */
export function buildMonthPages(monthId, monthLabel, sections = {}) {
    const sectionIds = Object.keys(sectionPageCounts);
    return [
        { id: monthId, type: 'month', monthId, label: `${monthLabel} Chapter` },
        ...sectionIds.flatMap((sectionId) => {
            const count = sectionPageCounts[sectionId] ?? 1;
            const labels = sectionPageLabels[sectionId] || [];
            const sectionTitle = sections[sectionId]?.title ?? sectionId;
            return [
                {
                    id: `${monthId}-${sectionId}`,
                    type: 'divider',
                    monthId,
                    sectionId,
                    label: sectionTitle,
                },
                ...Array.from({ length: count }, (_, index) => {
                    const pageNum = index + 1;
                    const pageLabel = labels[index] || `Page ${pageNum}`;
                    return {
                        id: `${monthId}-${sectionId}-${pageNum}`,
                        type: 'content',
                        monthId,
                        sectionId,
                        pageInSection: pageNum,
                        totalInSection: count,
                        pageLabel,
                        label: `${sectionTitle} — ${pageLabel}`,
                    };
                }),
            ];
        }),
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
