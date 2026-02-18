// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const Auth = require('stremio/routes/Auth');

const SiteAuthContext = React.createContext({ siteLogout: () => {}, siteAuthEnabled: false });

const withSiteAuth = (WrappedComponent) => {
    const WithSiteAuth = (props) => {
        const [authState, setAuthState] = React.useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'
        const [siteAuthEnabled, setSiteAuthEnabled] = React.useState(false);

        React.useEffect(() => {
            let cancelled = false;

            fetch('/api/auth/status')
                .then((resp) => resp.json())
                .then((data) => {
                    if (!cancelled) {
                        setSiteAuthEnabled(true);
                        setAuthState(data.authenticated ? 'authenticated' : 'unauthenticated');
                    }
                })
                .catch(() => {
                    // Auth endpoint unreachable (dev mode, non-Cloudflare deployment) — skip gate
                    if (!cancelled) {
                        setAuthState('authenticated');
                    }
                });

            return () => { cancelled = true; };
        }, []);

        const siteLogout = React.useCallback(async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch {
                // ignore
            }
            window.location.hash = '#/';
            setAuthState('unauthenticated');
        }, []);

        const onAuthenticated = React.useCallback(() => {
            setAuthState('authenticated');
        }, []);

        const contextValue = React.useMemo(() => ({ siteLogout, siteAuthEnabled }), [siteLogout, siteAuthEnabled]);

        if (authState === 'checking') {
            return null;
        }

        if (authState === 'unauthenticated') {
            return <Auth onAuthenticated={onAuthenticated} />;
        }

        return (
            <SiteAuthContext.Provider value={contextValue}>
                <WrappedComponent {...props} />
            </SiteAuthContext.Provider>
        );
    };

    WithSiteAuth.displayName = `withSiteAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithSiteAuth;
};

module.exports = withSiteAuth;
module.exports.SiteAuthContext = SiteAuthContext;
