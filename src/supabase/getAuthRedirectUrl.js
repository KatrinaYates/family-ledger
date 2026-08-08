/** App root URL for Supabase auth redirects (local `/`, GitHub Pages `/family-ledger/`). */
export function getAuthRedirectUrl() {
    const base = import.meta.env.BASE_URL;
    const url = new URL(base, window.location.origin);
    const invite = new URLSearchParams(window.location.search).get('invite');
    if (invite) {
        url.searchParams.set('invite', invite);
    }
    return url.href;
}

/** Invitation links should use the same app-root base as auth redirects. */
export function getHouseholdInviteUrl(token) {
    const url = new URL(getAuthRedirectUrl());
    url.search = '';
    url.searchParams.set('invite', token);
    return url.toString();
}
