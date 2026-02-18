// Passthrough middleware to ensure the functions directory is recognized by Cloudflare Pages
export const onRequest: PagesFunction = async (context) => {
    return context.next();
};
