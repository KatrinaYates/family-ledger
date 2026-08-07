import React, { useState } from 'react';
import { ScrollBody } from '../content/NotebookPrimitives';
import { useMonthContext } from '../../context/MonthContext';
import { useMeetingRundown } from '../../hooks/useMeetingRundown';
import { formatRundownAsText } from '../../utils/collectMeetingRundown';

function countRundownItems(rundown) {
  return rundown.sections.reduce((sum, section) => sum + section.items.length, 0);
}

export function MeetingRundown() {
  const { monthId } = useMonthContext();
  const { rundown, loading, error, refresh } = useMeetingRundown(monthId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatRundownAsText(rundown));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isEmpty = rundown.sections.length === 0;
  const itemCount = countRundownItems(rundown);

  return (
    <details className="meeting-rundown-panel paper-surface snapshot-large-panel panel-stack">
      <summary className="meeting-rundown-summary">
        <span className="meeting-rundown-summary-title">Meeting rundown</span>
        {!isEmpty && (
          <span className="meeting-rundown-summary-count">{itemCount} items</span>
        )}
      </summary>
      <div className="meeting-rundown-toolbar">
        <button type="button" className="meeting-add-btn" onClick={refresh}>
          Refresh
        </button>
        <button type="button" className="meeting-add-btn" onClick={handleCopy} disabled={isEmpty}>
          Copy rundown
        </button>
        {copied && (
          <span className="meeting-rundown-copied" aria-live="polite">
            Copied!
          </span>
        )}
      </div>
      <ScrollBody label="Compiled meeting rundown" className="meeting-rundown-scroll">
        <div className="meeting-rundown">
          {loading && (
            <p className="meeting-rundown-empty">Loading rundown…</p>
          )}
          {error && (
            <p className="field-save-error" role="alert">{error}</p>
          )}
          {!loading && !error && isEmpty ? (
            <p className="meeting-rundown-empty">
              Nothing captured yet — your notes and lists from earlier sections will appear here.
            </p>
          ) : (
            rundown.sections.map((section) => (
              <section className="meeting-rundown-section" key={section.id} aria-label={section.title}>
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item, index) => (
                    <li key={`${section.id}-${index}`}>
                      {item.label && section.id !== 'notes' && (
                        <span className="meeting-rundown-item-label">{item.label}: </span>
                      )}
                      {section.id === 'notes' && (
                        <span className="meeting-rundown-item-label">{item.label} — </span>
                      )}
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </ScrollBody>
    </details>
  );
}
