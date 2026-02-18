interface Env {
    AUTH_SECRET?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    // If AUTH_SECRET is not set, auth is disabled — treat as authenticated
    if (!env.AUTH_SECRET) {
        return Response.json({ authenticated: true });
    }

    const cookie = parseCookie(request.headers.get('Cookie') || '');
    const token = cookie['site_auth'];

    if (!token) {
        return Response.json({ authenticated: false });
    }

    const valid = await verifyToken(token, env.AUTH_SECRET);
    return Response.json({ authenticated: valid });
};

function parseCookie(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    for (const pair of cookieHeader.split(';')) {
        const [key, ...rest] = pair.split('=');
        if (key) {
            cookies[key.trim()] = rest.join('=').trim();
        }
    }
    return cookies;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [expiryStr, hmacHex] = parts;
    const expiry = parseInt(expiryStr, 10);

    if (isNaN(expiry) || Date.now() > expiry) return false;

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const expected = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(expiryStr)
    );

    const expectedHex = Array.from(new Uint8Array(expected))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    // Timing-safe comparison
    const enc = new TextEncoder();
    const a = enc.encode(hmacHex);
    const b = enc.encode(expectedHex);

    if (a.byteLength !== b.byteLength) return false;

    return crypto.subtle.timingSafeEqual(a, b);
}
