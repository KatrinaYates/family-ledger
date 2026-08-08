import React, { useEffect, useState } from 'react';
import { supabase } from './client.js';
import { AuthShell } from './AuthShell.jsx';
import { getAuthRedirectUrl } from './getAuthRedirectUrl.js';

function LockIcon() {
    return (
        <svg className="ledger-auth-privacy-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg className="ledger-auth-google-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21.6 12.23c0-.82-.07-1.42-.22-2.05H12v3.72h5.52c-.11.92-.71 2.3-2.04 3.23l-.02.12 2.96 2.3.21.02c1.89-1.74 2.98-4.3 2.98-7.34z" fill="#4285F4" />
            <path d="M12 22c2.7 0 4.96-.89 6.61-2.43l-3.15-2.45c-.84.57-1.96.97-3.46.97-2.64 0-4.88-1.74-5.68-4.15l-.12.01-3.08 2.39-.04.11C3.87 19.84 7.65 22 12 22z" fill="#34A853" />
            <path d="M6.32 14.05c-.22-.65-.35-1.35-.35-2.05s.13-1.4.33-2.05l-.01-.13-3.12-2.43-.1.05C2.42 9.36 2 10.63 2 12s.42 2.64 1.07 4.16l3.25-2.11z" fill="#FBBC05" />
            <path d="M12 5.38c1.88 0 3.15.81 3.87 1.49l2.83-2.76C16.93 2.89 14.7 2 12 2 7.65 2 3.87 4.16 2.07 7.84l3.25 2.11C6.12 7.5 8.36 5.38 12 5.38z" fill="#EA4335" />
        </svg>
    );
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

    const signInWithGoogle = async () => {
        resetFeedback();
        setGoogleSubmitting(true);
        const { error: signInError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: getAuthRedirectUrl() },
        });
        setGoogleSubmitting(false);
        if (signInError) setError(signInError.message);
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

    if (loading) {
        return (
            <AuthShell busy>
                <p className="ledger-auth-status">Opening your ledger…</p>
            </AuthShell>
        );
    }

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

            <button
                type="button"
                className="ledger-auth-btn ledger-auth-btn-google"
                onClick={signInWithGoogle}
                disabled={busy}
                aria-busy={googleSubmitting || undefined}
            >
                <GoogleIcon />
                {googleSubmitting ? 'Redirecting…' : 'Continue with Google'}
            </button>

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
