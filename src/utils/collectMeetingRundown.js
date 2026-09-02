import { getMeetingDataRegistry, getLegacyRundownEntries, RUNDOWN_GROUPS } from '../data/meetingDataRegistry';
import { resolveMonthView } from '../data/normalizeLedgerMonth.js';
import { ledgerRepository } from '../repository';
import { formatActionSummary } from './actionUtils';
import { retrospectiveQuestionKey } from './meetingKeys';

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
  const text = typeof raw === 'string' ? raw.trim() : '';
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
      const checkedOnly = entry.group === 'status' || entry.group === 'retrospective';
      if (Array.isArray(raw)) return parseChecklist(raw, entry.label, checkedOnly);
      return [];
    }
    case 'questions':
      return Array.isArray(raw) ? parseQuestions(raw, entry.label) : [];
    case 'bullets':
      return Array.isArray(raw) ? parseBullets(raw, entry.label) : [];
    default:
      return [];
  }
}

async function repositoryActionItems(monthId) {
  const actions = await ledgerRepository.listActionsForMonth(monthId);
  return actions.map((action) => ({
    label: 'Action plan',
    text: formatActionSummary(action),
  }));
}

async function collectRegistryEntries(monthId, entries) {
  const grouped = {};

  for (const entry of entries) {
    const raw = await ledgerRepository.getMeetingEntry(monthId, entry.key);
    const items = parseEntry(entry, raw);
    if (!items.length) continue;

    if (!grouped[entry.group]) grouped[entry.group] = [];
    grouped[entry.group].push(...items);
  }

  return grouped;
}

/** @param {string} monthId */
export async function collectMeetingRundown(monthId) {
  const registry = getMeetingDataRegistry(monthId);
  const legacyRegistry = getLegacyRundownEntries(monthId);
  const grouped = await collectRegistryEntries(monthId, registry);
  const legacyGrouped = await collectRegistryEntries(monthId, legacyRegistry);

  for (const [groupId, items] of Object.entries(legacyGrouped)) {
    if (!grouped[groupId]) grouped[groupId] = [];
    grouped[groupId].push(...items);
  }

  try {
    const record = await ledgerRepository.getMonth(monthId);
    if (record) {
      const view = resolveMonthView(record);
      const questionEntries = (view.retrospective?.questionsToConsider ?? [])
        .filter((question) => question.allowResponse !== false)
        .map((question) => ({
          key: retrospectiveQuestionKey(monthId, question.id),
          label: question.question,
          group: 'retrospective',
          type: 'text',
        }));
      const questionGrouped = await collectRegistryEntries(monthId, questionEntries);
      for (const [groupId, items] of Object.entries(questionGrouped)) {
        if (!grouped[groupId]) grouped[groupId] = [];
        grouped[groupId].push(...items);
      }
    }
  } catch {
    // Rundown can still compile from stored meeting entries when month load fails.
  }

  const actionItems = await repositoryActionItems(monthId);
  if (actionItems.length) {
    if (!grouped.actions) grouped.actions = [];
    grouped.actions.push(...actionItems);
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
