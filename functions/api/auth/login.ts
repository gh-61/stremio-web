interface Env {
    AUTH_USERNAME?: string;
    AUTH_PASSWORD?: string;
    AUTH_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;

    if (!env.AUTH_SECRET || !env.AUTH_USERNAME || !env.AUTH_PASSWORD) {
        return Response.json({ authenticated: true });
    }

    let body: { username?: string; password?: string };
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { username, password } = body;

    if (!username || !password) {
        return Response.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const enc = new TextEncoder();
    const usernameMatch = await timingSafeCompare(enc.encode(username), enc.encode(env.AUTH_USERNAME));
    const passwordMatch = await timingSafeCompare(enc.encode(password), enc.encode(env.AUTH_PASSWORD));

    if (!usernameMatch || !passwordMatch) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create signed session cookie (7 days)
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const expiryStr = expiry.toString();

    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(env.AUTH_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        enc.encode(expiryStr)
    );

    const hmacHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    const token = `${expiryStr}.${hmacHex}`;

    return new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `site_auth=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`,
        },
    });
};

async function timingSafeCompare(a: Uint8Array, b: Uint8Array): Promise<boolean> {
    if (a.byteLength !== b.byteLength) {
        // Compare against itself to avoid timing leak on length mismatch
        const dummy = new Uint8Array(a.byteLength);
        try { await crypto.subtle.timingSafeEqual(a, dummy); } catch { /* ignore */ }
        return false;
    }
    return crypto.subtle.timingSafeEqual(a, b);
}
