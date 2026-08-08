import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ledgerRepository } from '../repository';
import { supabase } from './client.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

function invitationTokenFromValue(value) {
  const trimmed = value?.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    return url.searchParams.get('invite') || trimmed;
  } catch {
    return trimmed;
  }
}

function invitationUrl(token) {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('invite', token);
  return url.toString();
}

export function HouseholdGate({ children }) {
  const inviteFromUrl = useMemo(() => new URLSearchParams(window.location.search).get('invite') || '', []);
  const [households, setHouseholds] = useState([]);
  const [activeHousehold, setActiveHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [householdName, setHouseholdName] = useState('Our Family');
  const [joinValue, setJoinValue] = useState(inviteFromUrl);
  const [inviteEmail, setInviteEmail] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadHouseholds = useCallback(async () => {
    setError('');
    const rows = await ledgerRepository.listHouseholds();
    setHouseholds(rows);
    return rows;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        let rows = await loadHouseholds();

        if (inviteFromUrl) {
          try {
            const accepted = await ledgerRepository.acceptHouseholdInvitation(inviteFromUrl);
            rows = await loadHouseholds();
            if (!cancelled) setActiveHousehold(accepted);
            const clean = new URL(window.location.href);
            clean.searchParams.delete('invite');
            window.history.replaceState({}, '', clean);
          } catch (inviteError) {
            if (!cancelled) setError(getErrorMessage(inviteError));
          }
        } else if (rows.length === 1) {
          const selected = await ledgerRepository.setActiveHousehold(rows[0].id);
          if (!cancelled) setActiveHousehold(selected);
        }
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [inviteFromUrl, loadHouseholds]);

  const chooseHousehold = async (householdId) => {
    setBusy(true);
    setError('');
    try {
      const selected = await ledgerRepository.setActiveHousehold(householdId);
      setActiveHousehold(selected);
    } catch (selectionError) {
      setError(getErrorMessage(selectionError));
    } finally {
      setBusy(false);
    }
  };

  const createHousehold = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await ledgerRepository.createHousehold(householdName);
      setActiveHousehold(created);
      await loadHouseholds();
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setBusy(false);
    }
  };

  const joinHousehold = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const token = invitationTokenFromValue(joinValue);
      const joined = await ledgerRepository.acceptHouseholdInvitation(token);
      setActiveHousehold(joined);
      await loadHouseholds();
    } catch (joinError) {
      setError(getErrorMessage(joinError));
    } finally {
      setBusy(false);
    }
  };

  const createInvitation = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setCreatedInvite(null);
    try {
      const invitation = await ledgerRepository.createHouseholdInvitation(inviteEmail);
      setCreatedInvite({ ...invitation, url: invitationUrl(invitation.token) });
      setInviteEmail('');
    } catch (inviteError) {
      setError(getErrorMessage(inviteError));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await ledgerRepository.setActiveHousehold(null);
    await supabase.auth.signOut();
  };

  if (loading) {
    return <main className="household-gate-shell"><section className="household-gate-card">Opening your household…</section></main>;
  }

  if (!activeHousehold) {
    return (
      <main className="household-gate-shell">
        <section className="household-gate-card" aria-labelledby="household-title">
          <p className="household-gate-kicker">The Family Ledger</p>
          <h1 id="household-title">Choose your household</h1>
          <p>Your sign-in proves who you are. Household membership decides which ledger you can open.</p>

          {households.length > 1 && (
            <div className="household-choice-list">
              {households.map((household) => (
                <button key={household.id} type="button" onClick={() => chooseHousehold(household.id)} disabled={busy}>
                  <strong>{household.name}</strong>
                  <span>{household.role === 'owner' ? 'Owner' : 'Member'}</span>
                </button>
              ))}
            </div>
          )}

          {households.length === 0 && (
            <div className="household-onboarding-grid">
              <form onSubmit={createHousehold} className="household-onboarding-panel">
                <h2>Create a family ledger</h2>
                <p>Start a new private household. You’ll become its owner.</p>
                <label htmlFor="household-name">Household name</label>
                <input id="household-name" value={householdName} onChange={(event) => setHouseholdName(event.target.value)} required />
                <button type="submit" disabled={busy}>Create household</button>
              </form>

              <form onSubmit={joinHousehold} className="household-onboarding-panel">
                <h2>Join a family ledger</h2>
                <p>Paste the invitation link or code sent by a household owner.</p>
                <label htmlFor="household-invite">Invitation</label>
                <input id="household-invite" value={joinValue} onChange={(event) => setJoinValue(event.target.value)} required />
                <button type="submit" disabled={busy}>Join household</button>
              </form>
            </div>
          )}

          {error && <p className="household-error" role="alert">{error}</p>}
          <button type="button" className="household-signout" onClick={signOut}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <div className="household-app-shell" key={activeHousehold.id}>
      <details className="household-access-menu">
        <summary>{activeHousehold.name}</summary>
        <div className="household-access-panel">
          <p><strong>{activeHousehold.name}</strong></p>
          <p className="household-access-role">{activeHousehold.role === 'owner' ? 'Household owner' : 'Household member'}</p>

          {activeHousehold.role === 'owner' && (
            <form onSubmit={createInvitation}>
              <label htmlFor="household-invite-email">Invite a member</label>
              <input
                id="household-invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="person@example.com"
                required
              />
              <button type="submit" disabled={busy}>Create invite link</button>
            </form>
          )}

          {createdInvite && (
            <div className="household-invite-result" role="status">
              <p>Invite for <strong>{createdInvite.email}</strong></p>
              <input readOnly value={createdInvite.url} aria-label="Household invitation link" />
              <button type="button" onClick={() => navigator.clipboard?.writeText(createdInvite.url)}>Copy link</button>
              <small>Expires {new Date(createdInvite.expiresAt).toLocaleString()}.</small>
            </div>
          )}

          {households.length > 1 && (
            <div className="household-switcher">
              <span>Switch household</span>
              {households.filter((household) => household.id !== activeHousehold.id).map((household) => (
                <button key={household.id} type="button" onClick={() => chooseHousehold(household.id)} disabled={busy}>
                  {household.name}
                </button>
              ))}
            </div>
          )}

          {error && <p className="household-error" role="alert">{error}</p>}
          <button type="button" className="household-signout" onClick={signOut}>Sign out</button>
        </div>
      </details>
      {children}
    </div>
  );
}
