import React from 'react';
import { SectionPageHeader } from '../content/NotebookPrimitives';
import { PageWithNotes } from '../meeting/MeetingFields';

export function SectionPageShell({
  sectionId,
  section,
  month,
  data,
  subtitle,
  badge,
  badgeVariant,
  children,
}) {
  const monthLabel = month?.label || data?.meta?.month || 'This month';
  const year = data?.meta?.year || 2026;

  return (
    <div className="month-section-page snapshot-page">
      <PageWithNotes sectionId={sectionId}>
        <SectionPageHeader
          eyebrow={`${monthLabel} ${year} · Section ${section.number}`}
          title={section.title}
          subtitle={subtitle ?? section.description}
          badge={badge}
          badgeVariant={badgeVariant}
        />
        {children}
      </PageWithNotes>
    </div>
  );
}
