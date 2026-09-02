export const months = [
    {
        id: "2026-07",
        year: 2026,
        month: 7,
        short: "JULY",
        label: "July",
        number: "01",
        slug: "july",
        icon: "☀",
        season: "Sunshine Edition",
        sticker: "🌻",
        illustration: "sun",
        colors: ["#F6C85F", "#F4A261", "#E97C6C"],
    },
    {
        id: "2026-08",
        year: 2026,
        month: 8,
        short: "AUG",
        label: "August",
        number: "02",
        slug: "august",
        sticker: "🌺",
        illustration: "sunflower",
        colors: ["#F5B16F", "#E98A67", "#CC6F72"],
        message: "The garden is still growing.",
        promise: "We'll open it together in August.",
        preview: ["Garden goals.", "Warm-weather wins.", "Gentle course corrections."],
    },
    {
        id: "2026-09",
        year: 2026,
        month: 9,
        short: "SEP",
        label: "September",
        number: "03",
        slug: "september",
        sticker: "✏️",
        illustration: "pencil",
        colors: ["#B8C96A", "#8EAA51", "#6D8B45"],
        message: "A fresh-start chapter is waiting.",
        promise: "Meet us here in September.",
        preview: ["Reset routines.", "Refocus goals.", "Keep what works."],
    },
    {
        id: "2026-10",
        year: 2026,
        month: 10,
        short: "OCT",
        label: "October",
        number: "04",
        slug: "october",
        sticker: "🍂",
        illustration: "ghost",
        colors: ["#D98A5F", "#B95F43", "#8E4638"],
        message: "This cozy chapter is still steeping.",
        promise: "October will be here soon.",
        preview: ["Cozy choices.", "Intentional spending.", "Warm little wins."],
    },
    {
        id: "2026-11",
        year: 2026,
        month: 11,
        short: "NOV",
        label: "November",
        number: "05",
        slug: "november",
        sticker: "🌾",
        illustration: "turkey",
        colors: ["#A99573", "#7F6B52", "#5C4D3D"],
        message: "A gratitude-filled chapter is waiting.",
        promise: "We'll open it together in November.",
        preview: ["Notice abundance.", "Plan with care.", "Celebrate enough."],
    },
    {
        id: "2026-12",
        year: 2026,
        month: 12,
        short: "DEC",
        label: "December",
        number: "06",
        slug: "december",
        sticker: "✨",
        illustration: "christmas-tree",
        colors: ["#4F9A86", "#2E7568", "#25584F"],
        message: "The final chapter is saving a little magic.",
        promise: "December will close the year beautifully.",
        preview: ["Reflect on progress.", "Celebrate the year.", "Dream forward."],
    },
];

/** @param {string} monthId */
export function getMonthCatalogEntry(monthId) {
    const exact = months.find((entry) => entry.id === monthId);
    if (exact) return exact;

    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(monthId ?? '');
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const label = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' })
        .format(new Date(Date.UTC(year, month - 1, 1)));
    const themedMonth = months.find((entry) => entry.month === month);

    return {
        id: monthId,
        year,
        month,
        short: label.slice(0, 3).toUpperCase(),
        label,
        number: String(month).padStart(2, '0'),
        slug: label.toLowerCase(),
        sticker: themedMonth?.sticker ?? '✦',
        illustration: themedMonth?.illustration ?? 'sun',
        colors: themedMonth?.colors ?? ['#7EC8C4', '#F0D978', '#F6ABC0'],
    };
}
