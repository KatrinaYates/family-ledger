import React from 'react';
import { NotebookButton } from '../content/NotebookPrimitives';

export function CheckInEmptyState() {
  return (
    <section className="paper-surface check-in-empty-state">
      <h2>No Financial Check-In yet</h2>
      <p>Refresh your financial picture to create the latest household snapshot.</p>
      <NotebookButton
        className="check-in-refresh-btn"
        disabled
        title="Refresh will be wired to the live data source soon"
      >
        Refresh financial picture
      </NotebookButton>
    </section>
  );
}
