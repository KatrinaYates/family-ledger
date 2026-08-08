import React, { useEffect, useState } from 'react';
import { supabase } from './client.js';

export function SupabaseAuthGate({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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

    const sendMagicLink = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        const { error: signInError } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { emailRedirectTo: window.location.href.split('#')[0] },
        });
        if (signInError) {
            setError(signInError.message);
            return;
        }
        setMessage('Check your email for the sign-in link.');
    };

    if (loading) return <div className="ledger-auth-shell">Opening your ledger…</div>;
    if (session) return children;

    return (
        <main className="ledger-auth-shell">
            <section className="ledger-auth-card" aria-labelledby="ledger-sign-in-title">
                <p className="ledger-auth-kicker">The Family Ledger</p>
                <h1 id="ledger-sign-in-title">Sign in to open your notebook</h1>
                <p>Your financial ledger is private and only available to members of your household.</p>
                <form onSubmit={sendMagicLink}>
                    <label htmlFor="ledger-auth-email">Email</label>
                    <input
                        id="ledger-auth-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                    />
                    <button type="submit">Email me a sign-in link</button>
                </form>
                {message && <p role="status">{message}</p>}
                {error && <p role="alert">{error}</p>}
            </section>
        </main>
    );
}
