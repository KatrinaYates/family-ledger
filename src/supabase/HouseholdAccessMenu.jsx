import React, { useEffect, useRef, useState } from 'react';
import { useHousehold } from '../context/HouseholdContext.jsx';
import { ledgerRepository } from '../repository';
import { getErrorMessage } from '../utils/getErrorMessage.js';
import { supabase } from './client.js';

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
    const [copied, setCopied] = useState(false);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState('');
    const [removingMemberId, setRemovingMemberId] = useState('');
    const menuRef = useRef(null);
    const copiedTimerRef = useRef(null);

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

    useEffect(() => () => {
        if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    }, []);

    useEffect(() => {
        if (!open) setCopied(false);
    }, [open]);

    useEffect(() => {
        setCopied(false);
    }, [household?.createdInvite?.url]);

    useEffect(() => {
        if (!open || !household?.activeHousehold?.id) return undefined;

        let cancelled = false;
        setMembersLoading(true);
        setMembersError('');

        ledgerRepository.listHouseholdMembers(household.activeHousehold.id)
            .then((rows) => {
                if (!cancelled) setMembers(rows);
            })
            .catch((loadError) => {
                if (!cancelled) {
                    setMembers([]);
                    setMembersError(getErrorMessage(loadError));
                }
            })
            .finally(() => {
                if (!cancelled) setMembersLoading(false);
            });

        return () => { cancelled = true; };
    }, [open, household?.activeHousehold?.id]);

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

    const handleCopyLink = async () => {
        await copyInviteLink();
        setCopied(true);
        if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveMember = async (member) => {
        const memberLabel = member.displayName || member.email || 'this household member';
        const confirmed = window.confirm(
            `Remove ${memberLabel} from ${activeHousehold.name}? They will immediately lose access to this ledger.`,
        );
        if (!confirmed) return;

        setRemovingMemberId(member.userId);
        setMembersError('');

        try {
            const { error: removeError } = await supabase.rpc('remove_household_member', {
                target_household_id: activeHousehold.id,
                target_user_id: member.userId,
            });
            if (removeError) throw removeError;
            setMembers((current) => current.filter((item) => item.userId !== member.userId));
        } catch (removeError) {
            setMembersError(getErrorMessage(removeError));
        } finally {
            setRemovingMemberId('');
        }
    };

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

                        <div className="household-members">
                            <span className="household-members-label">Members</span>
                            {membersLoading && (
                                <p className="household-members-status" aria-live="polite">Loading members…</p>
                            )}
                            {!membersLoading && membersError && (
                                <p className="household-error" role="alert">{membersError}</p>
                            )}
                            {!membersLoading && members.length > 0 && (
                                <ul className="household-members-list" role="list">
                                    {members.map((member) => (
                                        <li key={member.userId} className="household-member-item">
                                            <div className="household-member-details">
                                                <span className="household-member-name">
                                                    {member.displayName}
                                                    {member.isSelf && (
                                                        <span className="household-member-you">You</span>
                                                    )}
                                                </span>
                                                <span className="household-member-email">{member.email}</span>
                                            </div>
                                            {!member.isSelf && (
                                                <button
                                                    type="button"
                                                    className="household-member-remove"
                                                    onClick={() => handleRemoveMember(member)}
                                                    disabled={Boolean(removingMemberId)}
                                                    aria-label={`Remove ${member.displayName || member.email} from household`}
                                                >
                                                    {removingMemberId === member.userId ? 'Removing…' : 'Remove'}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="household-invite-actions">
                            <button type="button" onClick={createInvitation} disabled={busy}>
                                {busy ? 'Creating link…' : 'Create invite link'}
                            </button>
                        </div>

                        {createdInvite && (
                            <div className="household-invite-result" role="status">
                                <p>Share this one-time link with someone you trust.</p>
                                <input readOnly value={createdInvite.url} aria-label="Household invitation link" />
                                <button
                                    type="button"
                                    className={copied ? 'is-copied' : ''}
                                    onClick={handleCopyLink}
                                    aria-live="polite"
                                >
                                    {copied ? 'Copied!' : 'Copy link'}
                                </button>
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
