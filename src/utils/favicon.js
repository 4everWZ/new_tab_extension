// Get possible favicon urls for a site (kept consistent with legacy implementation)

export function getFaviconUrl(urlString) {
    try {
        const url = new URL(urlString);
        const hostname = url.hostname;
        return [
            `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
            `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
            `${url.protocol}//${hostname}/favicon.ico`,
        ];
    } catch {
        return [];
    }
}
