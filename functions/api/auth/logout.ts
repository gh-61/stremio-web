export const onRequestPost: PagesFunction = async () => {
    return new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'site_auth=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
        },
    });
};
