import React, { useEffect, useRef, useState } from 'react';
import { useHousehold } from '../context/HouseholdContext.jsx';

function ChevronIcon({ open }) {
    return (
        <svg
            className={`household-access-chevron${open ? ' is-open' : ''}`}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden="true"
        >
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
    );
}

export function HouseholdAccessMenu() {
    const household = useHousehold();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (menuRef.current?.contains(event.target)) return;
            setOpen(false);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    if (!household?.activeHousehold) return null;

    const {
        activeHousehold,
        households,
        busy,
        error,
        createdInvite,
        createInvitation,
        copyInviteLink,
        chooseHousehold,
        signOut,
    } = household;

    return (
        <>
            {open && (
                <div
                    className="household-access-backdrop"
                    aria-hidden="true"
                    onPointerDown={() => setOpen(false)}
                />
            )}
            <div className={`household-access-menu${open ? ' is-open' : ''}`} ref={menuRef}>
                <button
                    type="button"
                    className="household-access-trigger"
                    aria-expanded={open}
                    aria-haspopup="dialog"
                    onClick={() => setOpen((value) => !value)}
                >
                    <span className="household-access-trigger-text">
                        <span className="household-access-trigger-name">{activeHousehold.name}</span>
                    </span>
                    <ChevronIcon open={open} />
                </button>

                {open && (
                    <div className="household-access-panel" role="dialog" aria-label={`${activeHousehold.name} household menu`}>
                        <p className="household-access-panel-kicker">Household</p>
                        <p className="household-access-panel-title">{activeHousehold.name}</p>
                        <p className="household-access-role">Everyone with access can view and edit this ledger.</p>

                        <div className="household-invite-actions">
                            <button type="button" onClick={createInvitation} disabled={busy}>
                                {busy ? 'Creating link…' : 'Create invite link'}
                            </button>
                        </div>

                        {createdInvite && (
                            <div className="household-invite-result" role="status">
                                <p>Share this one-time link with someone you trust.</p>
                                <input readOnly value={createdInvite.url} aria-label="Household invitation link" />
                                <button type="button" onClick={copyInviteLink}>Copy link</button>
                                <small>Expires {new Date(createdInvite.expiresAt).toLocaleString()}.</small>
                            </div>
                        )}

                        {households.length > 1 && (
                            <div className="household-switcher">
                                <span>Switch household</span>
                                {households.filter((item) => item.id !== activeHousehold.id).map((item) => (
                                    <button key={item.id} type="button" onClick={() => chooseHousehold(item.id)} disabled={busy}>
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {error && <p className="household-error" role="alert">{error}</p>}
                        <button type="button" className="household-signout" onClick={signOut}>Sign out</button>
                    </div>
                )}
            </div>
        </>
    );
}
