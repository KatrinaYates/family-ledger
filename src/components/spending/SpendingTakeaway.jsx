import React from 'react';
import { PanelSurface, SectionBlock } from '../notebook';
import { useMeetingNotes } from '../../hooks/useMeetingField';
import { sectionFieldKey } from '../../utils/meetingKeys';

function TakeawayPrompt({ monthId, field, label, placeholder }) {
  const storageKey = sectionFieldKey(monthId, 'spending', field);
  const { value, setValue, isLocked, saveError } = useMeetingNotes(storageKey);

  return (
    <label className="prompt-field">
      <span className="prompt-field-label">{label}</span>
      <textarea
        className="inline-notes-area"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        readOnly={isLocked}
        aria-readonly={isLocked}
      />
      {saveError && (
        <p className="field-save-error" role="alert">{saveError}</p>
      )}
    </label>
  );
}

export function SpendingTakeaway({ monthId }) {
  return (
    <SectionBlock label="Our Spending Takeaway" className="spending-takeaway">
      <PanelSurface>
        <p className="panel-note spending-takeaway-hint">
          Capture your household&apos;s interpretation — not financial recommendations.
        </p>
        <div className="spending-takeaway-prompts">
          <TakeawayPrompt
            monthId={monthId}
            field="takeaway-worth"
            label="What felt worth it?"
            placeholder="Worth-it spending this month..."
          />
          <TakeawayPrompt
            monthId={monthId}
            field="takeaway-differently"
            label="What would we do differently?"
            placeholder="Anything you'd adjust..."
          />
          <TakeawayPrompt
            monthId={monthId}
            field="takeaway-watch"
            label="What should we watch next month?"
            placeholder="Patterns or categories to keep an eye on..."
          />
        </div>
      </PanelSurface>
    </SectionBlock>
  );
}
