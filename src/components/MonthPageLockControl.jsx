import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getMonthCatalogEntry } from '../data/months';
import { MonthProvider } from '../context/MonthContext';
import { useWorkflow } from '../hooks/useWorkflow';
import { LockMonthControl } from './handoff/LockMonthControl';

function monthIdFromLocation() {
  const match = window.location.hash.match(/^#\/(\d{4}-\d{2})$/);
  return match?.[1] ?? null;
}

export function MonthPageLockControl() {
  const [monthId, setMonthId] = useState(() => monthIdFromLocation());
  const [portalTarget, setPortalTarget] = useState(null);
  const { workflow } = useWorkflow(monthId);

  useEffect(() => {
    const sync = () => {
      const nextMonthId = monthIdFromLocation();
      const nextTarget = nextMonthId ? document.querySelector('.month-chapter .month-content') : null;
      setMonthId(nextMonthId);
      setPortalTarget(nextTarget);
    };

    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);

    const root = document.getElementById('root');
    const observer = root ? new MutationObserver(sync) : null;
    observer?.observe(root, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
      observer?.disconnect();
    };
  }, []);

  if (!monthId || !portalTarget) return null;

  const month = getMonthCatalogEntry(monthId);
  if (!month) return null;

  return createPortal(
    <MonthProvider monthId={monthId} month={month} workflow={workflow}>
      <LockMonthControl className="month-page-lock-control" />
    </MonthProvider>,
    portalTarget,
  );
}
