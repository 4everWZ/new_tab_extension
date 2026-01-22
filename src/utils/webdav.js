export class WebDAVClient {
    constructor(url, username, password) {
        this.url = url.endsWith('/') ? url : url + '/';
        this.username = username;
        this.password = password;
        this.authHeader = 'Basic ' + btoa(username + ':' + password);
    }

    async _request(method, filename = '', body = null, extraHeaders = {}, isBinary = false) {
        const headers = {
            'Authorization': this.authHeader,
            ...extraHeaders
        };

        let payloadBody = null;
        let isPayloadBinary = false;

        if (body) {
            // Robust check for Blob/File (instanceof can fail across contexts)
            const isBlob = body instanceof Blob ||
                (body && body.constructor && (body.constructor.name === 'Blob' || body.constructor.name === 'File')) ||
                Object.prototype.toString.call(body) === '[object Blob]' ||
                Object.prototype.toString.call(body) === '[object File]';

            if (isBlob) {
                // Convert Blob/File to Data URL for message passing
                payloadBody = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(body);
                });
                isPayloadBinary = true;
            } else if (typeof body === 'object') {
                payloadBody = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            } else {
                payloadBody = body; // String
            }
        }

        const messageData = {
            type: 'webdav_proxy',
            url: this.url + filename,
            method,
            headers,
            body: payloadBody,
            isBinary: isPayloadBinary || isBinary,
            timeout: 30000
        };

        const sendMessagePromise = new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(messageData, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[WebDAV] Runtime Error:', chrome.runtime.lastError);
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            } catch (e) {
                console.error('[WebDAV] sendMessage threw:', e);
                reject(e);
            }
        });

        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                console.error('[WebDAV] Client Timeout Triggered!');
                reject(new Error('Request timed out (Client)'));
            }, 35000);
        });

        try {
            const response = await Promise.race([sendMessagePromise, timeoutPromise]);
            clearTimeout(timeoutId);

            if (!response || !response.success) {
                throw new Error(response ? response.error : 'Unknown error');
            }

            // Convert base64 response back to Blob if requested
            if (isBinary && typeof response.data === 'string' && response.data.startsWith('data:')) {
                const res = await fetch(response.data);
                response.data = await res.blob();
            }

            return response;
        } catch (e) {
            console.error('[WebDAV] _request failed caught:', e);
            throw e;
        }
    }

    async checkConnection() {
        try {
            const response = await this._request('PROPFIND', '', null, {
                'Depth': '0',
                'Content-Type': 'application/xml'
            });
            return response.status >= 200 && response.status < 300;
        } catch (e) {
            console.error('[WebDAV] Connection check failed:', e);
            return false;
        }
    }

    async upload(filename, data, contentType) {
        try {
            const headers = {};
            if (contentType) headers['Content-Type'] = contentType;

            const response = await this._request('PUT', filename, data, headers);
            if (response.status >= 300) {
                throw new Error(`HTTP ${response.status} ${response.statusText} for ${this.url + filename}`);
            }
            return true;
        } catch (e) {
            console.error('[WebDAV] Upload failed:', e);
            throw e;
        }
    }

    async download(filename, isBinary = false) {
        try {
            const response = await this._request('GET', filename, null, {}, isBinary);
            if (response.status === 404) return null;
            if (response.status >= 400) throw new Error(`HTTP ${response.status}`);
            return response.data;
        } catch (e) {
            console.error('[WebDAV] Download failed:', e);
            throw e;
        }
    }
    async getDirectoryContents(path = '') {
        try {
            // Ensure path starts/ends correctly if needed, but standard WebDAV is usually tolerant.
            // PROPFIND Depth: 1
            const response = await this._request('PROPFIND', path, null, {
                'Depth': '1',
                'Content-Type': 'application/xml'
            });

            if (response.status >= 300) {
                console.warn('[WebDAV] PROPFIND failed:', response.status);
                return [];
            }

            // Parse XML response
            // We need to handle the response body which might be a string (XML)
            const xmlText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            const responses = xmlDoc.getElementsByTagNameNS("DAV:", "response");
            const files = [];

            for (let i = 0; i < responses.length; i++) {
                const resp = responses[i];
                const hrefNode = resp.getElementsByTagNameNS("DAV:", "href")[0];
                const propNode = resp.getElementsByTagNameNS("DAV:", "propstat")[0]?.getElementsByTagNameNS("DAV:", "prop")[0];
                const resTypeNode = propNode?.getElementsByTagNameNS("DAV:", "resourcetype")[0];

                // Check if collection (directory)
                const isCollection = resTypeNode?.getElementsByTagNameNS("DAV:", "collection").length > 0;

                if (!isCollection && hrefNode) {
                    let href = hrefNode.textContent;
                    // Decode URI just in case
                    try { href = decodeURIComponent(href); } catch { }

                    // Extract basename
                    const basename = href.split('/').pop();
                    if (basename) files.push(basename);
                }
            }

            console.log('[WebDAV] Directory listing:', files);
            return files;
        } catch (e) {
            console.error('[WebDAV] getDirectoryContents failed:', e);
            return [];
        }
    }
}
