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
    const { url, method, headers, body, isBinary } = data;

    try {
        const fetchOptions = {
            method,
            headers,
            cache: 'no-store'
        };

        if (body) {
            if (isBinary) {
                // Body is passed as Base64 string from client
                // Convert to Blob for fetch
                const res = await fetch(body); // read data url
                const blob = await res.blob();
                fetchOptions.body = blob;
            } else {
                fetchOptions.body = body;
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), data.timeout || 30000); // Default 30s timeout
        fetchOptions.signal = controller.signal;

        let response;
        try {
            response = await fetch(url, fetchOptions);
        } finally {
            clearTimeout(timeoutId);
        }

        let responseData;

        if (isBinary) {
            // Return binary data as Base64 string
            const blob = await response.blob();
            responseData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result); // Returns data: URL
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } else {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
                try {
                    responseData = JSON.parse(responseData);
                } catch (e) {
                    // Keep as text
                }
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
