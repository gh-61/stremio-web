// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const styles = require('./styles');

const Auth = ({ onAuthenticated }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const passwordRef = React.useRef(null);

    const handleSubmit = React.useCallback(async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Username and password are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const resp = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await resp.json();

            if (resp.ok && data.authenticated) {
                onAuthenticated();
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch {
            setError('Authentication service unavailable');
        } finally {
            setLoading(false);
        }
    }, [username, password, onAuthenticated]);

    const handleUsernameKeyDown = React.useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordRef.current?.focus();
        }
    }, []);

    return (
        <div className={styles['auth-container']}>
            <div className={styles['background']} />
            <img className={styles['logo']} src={'/images/logo.png'} alt={'Stremio'} />
            <div className={styles['title']}>Site Authentication</div>
            <form className={styles['form']} onSubmit={handleSubmit}>
                <input
                    className={styles['input']}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleUsernameKeyDown}
                    autoFocus
                />
                <input
                    ref={passwordRef}
                    className={styles['input']}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <div className={styles['error']}>{error}</div>}
                <button className={styles['submit-button']} type="submit" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Log In'}
                </button>
            </form>
        </div>
    );
};

module.exports = Auth;
