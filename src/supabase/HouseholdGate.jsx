import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useBootLoading } from '../context/BootGate.jsx';
import { HouseholdProvider } from '../context/HouseholdContext.jsx';
import { ledgerRepository } from '../repository';
import { AuthShell } from './AuthShell.jsx';
import { supabase } from './client.js';
import { getHouseholdInviteUrl } from './getAuthRedirectUrl.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const LINK_ONLY_INVITE_EMAIL = 'invite-link@family-ledger.invalid';

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
  return getHouseholdInviteUrl(token);
}

export function HouseholdGate({ children }) {
  const inviteFromUrl = useMemo(() => new URLSearchParams(window.location.search).get('invite') || '', []);
  const [households, setHouseholds] = useState([]);
  const [activeHousehold, setActiveHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [householdName, setHouseholdName] = useState('Our Family');
  const [joinValue, setJoinValue] = useState(inviteFromUrl);
  const [createdInvite, setCreatedInvite] = useState(null);
  const [busy, setBusy] = useState(false);

  useBootLoading('household', loading);

  const loadHouseholds = useCallback(async () => {
    const rows = await ledgerRepository.listHouseholds();
    setHouseholds(rows);
    return rows;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        let rows = await loadHouseholds();

        if (inviteFromUrl) {
          try {
            const accepted = await ledgerRepository.acceptHouseholdInvitation(inviteFromUrl);
            rows = await loadHouseholds();
            if (!cancelled) setActiveHousehold(accepted);
            const clean = new URL(window.location.href);
            clean.searchParams.delete('invite');
            window.history.replaceState({}, '', clean);
            return;
          } catch (inviteError) {
            if (!cancelled) setError(getErrorMessage(inviteError));
          }
        }

        if (rows.length === 1) {
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

  const createInvitation = async () => {
    setBusy(true);
    setError('');
    setCreatedInvite(null);
    try {
      // The repository still accepts an email argument for compatibility, but the
      // database now issues one-time bearer links that are not tied to an email.
      const invitation = await ledgerRepository.createHouseholdInvitation(LINK_ONLY_INVITE_EMAIL);
      setCreatedInvite({ ...invitation, url: invitationUrl(invitation.token) });
    } catch (inviteError) {
      setError(getErrorMessage(inviteError));
    } finally {
      setBusy(false);
    }
  };

  const copyInviteLink = async () => {
    if (!createdInvite?.url) return;
    await navigator.clipboard?.writeText(createdInvite.url);
  };

  const signOut = async () => {
    await ledgerRepository.setActiveHousehold(null);
    await supabase.auth.signOut();
  };

  if (loading) return null;

  if (!activeHousehold) {
    return (
      <AuthShell wide labelledBy="household-title">
        <p className="ledger-auth-kicker">The Family Ledger</p>
        <h1 id="household-title">Open your family ledger</h1>
        <p className="ledger-auth-lead household-gate-lead">
          Create a new private ledger, or open an invitation link someone shared with you.
        </p>

        {households.length > 1 && (
          <div className="household-choice-list">
            {households.map((household) => (
              <button key={household.id} type="button" onClick={() => chooseHousehold(household.id)} disabled={busy}>
                <strong>{household.name}</strong>
              </button>
            ))}
          </div>
        )}

        {households.length === 0 && (
          <div className="household-onboarding-grid">
            <form onSubmit={createHousehold} className="household-onboarding-panel">
              <h2>Create a family ledger</h2>
              <p>Start a new private household. Everyone you invite will have the same access.</p>
              <label htmlFor="household-name">Household name</label>
              <input id="household-name" value={householdName} onChange={(event) => setHouseholdName(event.target.value)} required />
              <button type="submit" disabled={busy}>Create household</button>
            </form>

            <form onSubmit={joinHousehold} className="household-onboarding-panel">
              <h2>Have an invite?</h2>
              <p>Opening the invite link should bring you straight in. You can also paste it here.</p>
              <label htmlFor="household-invite">Invitation link</label>
              <input id="household-invite" value={joinValue} onChange={(event) => setJoinValue(event.target.value)} required />
              <button type="submit" disabled={busy}>Open family ledger</button>
            </form>
          </div>
        )}

        {error && <p className="ledger-auth-error household-error" role="alert">{error}</p>}
        <button type="button" className="household-signout" onClick={signOut}>Sign out</button>
      </AuthShell>
    );
  }

  return (
    <HouseholdProvider
      value={{
        activeHousehold,
        households,
        busy,
        error,
        createdInvite,
        createInvitation,
        copyInviteLink,
        chooseHousehold,
        signOut,
      }}
    >
      {children}
    </HouseholdProvider>
  );
}
