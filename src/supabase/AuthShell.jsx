import React from 'react';
import { Illustration } from '../components/LedgerComponents.jsx';

export function AuthShell({ children, busy = false, wide = false, labelledBy }) {
    const sheetClass = wide
        ? 'ledger-auth-sheet ledger-auth-sheet--wide'
        : 'ledger-auth-sheet';

    return (
        <main className="ledger-auth-shell">
            <Illustration name="vine-doodle" className="ledger-auth-doodle ledger-auth-doodle-vine" />
            <Illustration name="sunflower" className="ledger-auth-doodle ledger-auth-doodle-flower" />
            <section
                className={sheetClass}
                aria-busy={busy || undefined}
                aria-labelledby={labelledBy}
            >
                {children}
            </section>
        </main>
    );
}
