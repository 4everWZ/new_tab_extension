// Background service worker to handle WebDAV requests (bypassing CORS)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'webdav_proxy') {
        handleWebDAVRequest(request)
            .then(sendResponse)
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep channel open for async response
    }
});

async function handleWebDAVRequest(data) {
    const { url, method, headers, body } = data;

    try {
        const fetchOptions = {
            method,
            headers,
        };

        if (body) {
            fetchOptions.body = body;
        }

        const response = await fetch(url, fetchOptions);

        // We need to return the body, but message passing only supports JSON-serializable data.
        // For binary downloads, we might need to return base64 or text.
        // WebDAVClient expects JSON for 'download' of settings, and base64/blob handling for assets.
        // Let's return text and handle parsing in the client.

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            // For binary or text
            // To be safe for message passing, let's treat everything as text or base64?
            // SimpleDB stores blobs.
            // If we download an image, we want it as a Blob or Base64.
            // Background script fetching a blob -> convert to base64 -> send to client -> client converts to blob?
            // Or client stores base64 string directly (which we are doing for simpledb anyway? No, SimpleDB stores Blobs/ArrayBuffers usually, but our code in shortcuts.js used data URLs (strings)).

            // Let's check how we store data.
            // In shortcuts.js: `await db.set(..., id, raw)` where raw is data URL string.
            // In sync.js, we `client.download(name + '.data')` and expect `{ content: ... }` wrapper if we uploaded it that way.

            // The upload/download logic in `sync.js` sends JSON for settings and wrapper JSON `{ content: string }` for assets because `WebDAVClient.upload` does `JSON.stringify(data)`.
            // So actually, ALL our WebDAV bodies are JSON!
            // `sync.js`: `client.upload(blob.name + '.data', { content: blob.data });`
            // So we only ever need to parse JSON responses or Text responses.
            responseData = await response.text();
            try {
                responseData = JSON.parse(responseData);
            } catch (e) {
                // Keep as text if not JSON
            }
        }

        return {
            success: true,
            status: response.status,
            statusText: response.statusText,
            data: responseData
        };
    } catch (e) {
        return { success: false, error: e.toString() };
    }
}
