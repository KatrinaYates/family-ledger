import React from 'react';

export function CheckInEmptyState() {
  return (
    <section className="paper-surface check-in-empty-state">
      <h2>No Financial Check-In yet</h2>
      <p>Refresh your financial picture to create the latest household snapshot.</p>
      <button
        type="button"
        className="check-in-btn check-in-btn-primary check-in-refresh-btn"
        disabled
        title="Refresh will be wired to the live data source soon"
      >
        Refresh financial picture
      </button>
    </section>
  );
}
