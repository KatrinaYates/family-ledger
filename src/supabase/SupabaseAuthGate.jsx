import React, { useEffect, useRef, useState } from 'react';
import { useBootLoading } from '../context/BootGate.jsx';
import { supabase } from './client.js';
import { AuthShell } from './AuthShell.jsx';
import { getAuthRedirectUrl } from './getAuthRedirectUrl.js';

const GOOGLE_CLIENT_ID = '186838960462-6l3m806m1jfkim6q1bmn7o9c0s7d16s5.apps.googleusercontent.com';
const GOOGLE_IDENTITY_SCRIPT_ID = 'family-ledger-google-identity';

function LockIcon() {
    return (
        <svg className="ledger-auth-privacy-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </svg>
    );
}

function loadGoogleIdentityScript() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve(window.google);
            return;
        }

        const existing = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID);
        if (existing) {
            existing.addEventListener('load', () => resolve(window.google), { once: true });
            existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.id = GOOGLE_IDENTITY_SCRIPT_ID;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error('Could not load Google sign-in.'));
        document.head.appendChild(script);
    });
}

export function SupabaseAuthGate({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [googleSubmitting, setGoogleSubmitting] = useState(false);
    const googleButtonRef = useRef(null);

    useBootLoading('auth', loading);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data }) => {
            if (mounted) {
                setSession(data.session);
                setLoading(false);
            }
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setLoading(false);
        });
        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (loading || session || !googleButtonRef.current) return undefined;

        let cancelled = false;

        loadGoogleIdentityScript()
            .then((google) => {
                if (cancelled || !google?.accounts?.id || !googleButtonRef.current) return;

                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    use_fedcm_for_prompt: true,
                    callback: async (credentialResponse) => {
                        if (!credentialResponse?.credential) {
                            setError('Google did not return a sign-in credential. Please try again.');
                            return;
                        }

                        setError('');
                        setMessage('');
                        setGoogleSubmitting(true);

                        const { error: googleError } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: credentialResponse.credential,
                        });

                        setGoogleSubmitting(false);
                        if (googleError) setError(googleError.message);
                    },
                });

                googleButtonRef.current.replaceChildren();
                google.accounts.id.renderButton(googleButtonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'continue_with',
                    shape: 'pill',
                    logo_alignment: 'left',
                    width: Math.min(400, Math.max(240, googleButtonRef.current.clientWidth || 360)),
                });
            })
            .catch((loadError) => {
                if (!cancelled) setError(loadError.message);
            });

        return () => {
            cancelled = true;
        };
    }, [loading, session]);

    const resetFeedback = () => {
        setError('');
        setMessage('');
    };

    const submitPasswordAuth = async (event) => {
        event.preventDefault();
        resetFeedback();
        setSubmitting(true);

        const credentials = { email: email.trim(), password };
        const result = mode === 'signup'
            ? await supabase.auth.signUp({
                ...credentials,
                options: { emailRedirectTo: getAuthRedirectUrl() },
            })
            : await supabase.auth.signInWithPassword(credentials);

        setSubmitting(false);
        if (result.error) {
            setError(result.error.message);
            return;
        }

        if (mode === 'signup' && !result.data.session) {
            setMessage('Account created. Check your email to confirm it, then come back and sign in.');
            return;
        }

        setMessage(mode === 'signup' ? 'Account created.' : 'Signed in.');
    };

    const resetPassword = async () => {
        resetFeedback();
        if (!email.trim()) {
            setError('Enter your email first, then choose Forgot password.');
            return;
        }
        setSubmitting(true);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: getAuthRedirectUrl(),
        });
        setSubmitting(false);
        if (resetError) {
            setError(resetError.message);
            return;
        }
        setMessage('Password reset email sent.');
    };

    if (loading) return null;

    if (session) return children;

    const busy = submitting || googleSubmitting;

    return (
        <AuthShell>
            <header className="ledger-auth-header">
                <p className="ledger-auth-kicker">The Family Ledger</p>
                <h1 id="ledger-sign-in-title">{mode === 'signup' ? 'Start your ledger' : 'Welcome back'}</h1>
                <p className="ledger-auth-lead">
                    {mode === 'signup'
                        ? 'Create your account, then create or join a household.'
                        : 'Sign in to open your notebook and continue your financial journey together.'}
                </p>
            </header>

            <div
                ref={googleButtonRef}
                className={`ledger-auth-google-native${busy ? ' is-busy' : ''}`}
                aria-busy={googleSubmitting || undefined}
            >
                <span>{googleSubmitting ? 'Signing in with Google…' : 'Loading Google sign-in…'}</span>
            </div>

            <div className="ledger-auth-divider" role="separator"><span>or</span></div>

            <form className="ledger-auth-form" onSubmit={submitPasswordAuth}>
                <label className="ledger-auth-label" htmlFor="ledger-auth-email">Email</label>
                <input
                    id="ledger-auth-email"
                    className="ledger-auth-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    disabled={busy}
                />

                <label className="ledger-auth-label" htmlFor="ledger-auth-password">Password</label>
                <input
                    id="ledger-auth-password"
                    className="ledger-auth-input"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    disabled={busy}
                />

                <button
                    type="submit"
                    className="ledger-auth-btn ledger-auth-btn-primary"
                    disabled={busy}
                    aria-busy={submitting || undefined}
                >
                    {submitting ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
            </form>

            <div className="ledger-auth-links">
                {mode === 'signin' && (
                    <button type="button" className="ledger-auth-text-btn" onClick={resetPassword} disabled={busy}>
                        Forgot password?
                    </button>
                )}
                <button
                    type="button"
                    className="ledger-auth-text-btn"
                    onClick={() => {
                        resetFeedback();
                        setPassword('');
                        setMode(mode === 'signup' ? 'signin' : 'signup');
                    }}
                    disabled={busy}
                >
                    {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create account'}
                </button>
            </div>

            {message && <p className="ledger-auth-message" role="status">{message}</p>}
            {error && <p className="field-save-error ledger-auth-error" role="alert">{error}</p>}

            <p className="ledger-auth-privacy">
                <LockIcon />
                Your financial ledger is private and only available to members of your household.
            </p>
        </AuthShell>
    );
}
