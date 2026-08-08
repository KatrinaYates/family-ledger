import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/** Dev-only: add ?loader to the URL to keep the boot overlay visible while editing styles. */
export function isLoaderPreviewActive() {
    if (!import.meta.env.DEV) return false;
    return new URLSearchParams(window.location.search).has('loader');
}

/** @typedef {(key: string, loading: boolean) => void} SetBootLoading */

/** @type {React.Context<SetBootLoading | null>} */
const BootGateContext = createContext(null);

export function BootGateProvider({ children }) {
    const [loadingKeys, setLoadingKeys] = useState(() => new Set());
    const [loaderPreview] = useState(isLoaderPreviewActive);

    const setBootLoading = useCallback((key, loading) => {
        setLoadingKeys((previous) => {
            const next = new Set(previous);
            if (loading) next.add(key);
            else next.delete(key);
            return next;
        });
    }, []);

    const value = useMemo(() => setBootLoading, [setBootLoading]);
    const showLoader = loaderPreview || loadingKeys.size > 0;

    return (
        <BootGateContext.Provider value={value}>
            {showLoader && (
                <LedgerLoader
                    overlay
                    preview={loaderPreview}
                    aria-label="Opening your ledger"
                />
            )}
            {children}
        </BootGateContext.Provider>
    );
}

/** @param {string} key @param {boolean} loading */
export function useBootLoading(key, loading) {
    const setBootLoading = useContext(BootGateContext);

    useEffect(() => {
        if (!setBootLoading) return undefined;
        setBootLoading(key, loading);
        return () => setBootLoading(key, false);
    }, [key, loading, setBootLoading]);
}

/** @param {{ overlay?: boolean, inline?: boolean, preview?: boolean, className?: string, 'aria-label'?: string }} props */
export function PageLoader({ className = '', ...rest }) {
    return (
        <div className={['page-loader', className].filter(Boolean).join(' ')} role="status" aria-live="polite" {...rest}>
            <div className="writing-loader">
                <div className="writing-loader__line">
                    <span className="writing-loader__ink" aria-hidden="true" />
                    <span className="writing-loader__pen" aria-hidden="true">✒</span>
                </div>
                <div className="writing-loader__line writing-loader__line--short">
                    <span className="writing-loader__ink" aria-hidden="true" />
                </div>
                <div className="writing-loader__line writing-loader__line--medium">
                    <span className="writing-loader__ink" aria-hidden="true" />
                </div>
                <p className="writing-loader__label" aria-hidden="true">
                    Filling in your page
                    <span className="writing-loader__dots">
                        <span /><span /><span />
                    </span>
                </p>
            </div>
        </div>
    );
}

/** @param {{ overlay?: boolean, inline?: boolean, preview?: boolean, className?: string, 'aria-label'?: string }} props */
export function LedgerLoader({ overlay = false, inline = false, preview = false, className = '', ...rest }) {
    if (inline) {
        return <PageLoader className={className} {...rest} />;
    }

    const rootClass = [
        'ledger-loader',
        overlay ? 'ledger-loader-overlay' : '',
        preview ? 'ledger-loader-preview' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={rootClass} role="status" aria-live="polite" {...rest}>
            {preview && (
                <p className="loader-preview-hint">
                    Loader preview — remove <code>?loader</code> from the URL when done
                </p>
            )}
            <div className="loader-book" aria-hidden="true">
                <div className="loader-rings">
                    <span /><span /><span /><span /><span />
                </div>
                <div className="loader-cover">
                    <div className="loader-sun">☀</div>
                    <div className="loader-title">
                        THE FAMILY
                        <br />
                        LEDGER
                    </div>
                    <div className="loader-leaf">⌁</div>
                </div>
            </div>
            <div className="loader-copy" aria-hidden="true">
                <strong>Opening your ledger</strong>
                <div className="loader-dots">
                    <span /><span /><span />
                </div>
            </div>
        </div>
    );
}
