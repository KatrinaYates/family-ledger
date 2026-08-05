import { getMeetingDataRegistry, RUNDOWN_GROUPS } from '../data/meetingDataRegistry';

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.label ?? ''}::${item.text ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseText(raw, label) {
  const text = raw?.trim();
  if (!text) return [];
  return [{ label, text }];
}

function parseChecklist(data, label, checkedOnly) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item.text?.trim() && (!checkedOnly || item.checked))
    .map((item) => ({
      label,
      text: item.checked ? `✓ ${item.text.trim()}` : item.text.trim(),
    }));
}

function parseQuestions(data, label) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item.question?.trim() || item.answer?.trim())
    .map((item) => {
      const q = item.question?.trim() ?? '';
      const a = item.answer?.trim() ?? '';
      if (q && a) return { label, text: `${q} — ${a}` };
      if (a) return { label, text: a };
      return { label, text: q };
    });
}

function parseActions(data, label) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((row) => row.action?.trim() || row.owner?.trim() || row.dueDate?.trim())
    .map((row) => {
      const parts = [
        row.action?.trim(),
        row.owner?.trim() && `Owner: ${row.owner.trim()}`,
        row.dueDate?.trim() && `Due: ${row.dueDate.trim()}`,
        row.status?.trim() && `Status: ${row.status.trim()}`,
      ].filter(Boolean);
      return { label, text: parts.join(' · ') };
    });
}

function parseBullets(data, label) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item.text?.trim())
    .map((item) => ({ label, text: item.text.trim() }));
}

function parseEntry(entry, raw) {
  if (raw == null) return [];

  switch (entry.type) {
    case 'text':
      return parseText(raw, entry.label);
    case 'checklist': {
      const data = parseJson(raw);
      const checkedOnly = entry.group === 'status' || entry.group === 'decisions';
      if (data) return parseChecklist(data, entry.label, checkedOnly);
      return [];
    }
    case 'questions': {
      const data = parseJson(raw);
      return data ? parseQuestions(data, entry.label) : [];
    }
    case 'actions': {
      const data = parseJson(raw);
      return data ? parseActions(data, entry.label) : [];
    }
    case 'bullets': {
      const data = parseJson(raw);
      return data ? parseBullets(data, entry.label) : [];
    }
    default:
      return [];
  }
}

export function collectMeetingRundown() {
  const registry = getMeetingDataRegistry();
  const grouped = {};

  for (const entry of registry) {
    const raw = readStorage(entry.key);
    const items = parseEntry(entry, raw);
    if (!items.length) continue;

    if (!grouped[entry.group]) grouped[entry.group] = [];
    grouped[entry.group].push(...items);
  }

  const sections = Object.values(RUNDOWN_GROUPS)
    .map(({ id, title }) => ({
      id,
      title,
      items: dedupeItems(grouped[id] ?? []),
    }))
    .filter((section) => section.items.length > 0);

  return {
    generatedAt: new Date().toISOString(),
    sections,
  };
}

export function formatRundownAsText(rundown) {
  if (!rundown.sections.length) {
    return 'Meeting rundown\n\nNothing captured yet.';
  }

  const lines = ['Meeting rundown', ''];

  for (const section of rundown.sections) {
    lines.push(section.title);
    for (const item of section.items) {
      const prefix = item.label && item.text !== item.label ? `${item.label}: ` : '';
      lines.push(`  • ${prefix}${item.text}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}
