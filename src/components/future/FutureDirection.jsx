import React from 'react';
import { InsightList } from '../content/NotebookPrimitives';
import { PanelSurface, SectionBlock } from '../notebook';

/** @param {{ directionLabel?: string, direction?: Array<{ id?: string, text?: string }> }} props */
export function FutureDirection({ directionLabel, direction }) {
  if (!direction?.length) return null;

  const items = direction
    .filter((item) => item?.text?.trim())
    .map((item, index) => ({
      id: item.id ?? `direction-${index}`,
      title: `Priority ${index + 1}`,
      detail: item.text.trim(),
    }));

  if (!items.length) return null;

  return (
    <SectionBlock label={directionLabel} className="future-direction">
      <PanelSurface>
        <p className="panel-note">
          The household priorities guiding what we build, pay down, and prepare for next.
        </p>
        <InsightList items={items} className="future-direction-list" />
      </PanelSurface>
    </SectionBlock>
  );
}
