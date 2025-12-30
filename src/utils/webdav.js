export class WebDAVClient {
    constructor(url, username, password) {
        this.url = url.endsWith('/') ? url : url + '/';
        this.username = username;
        this.password = password;
        this.authHeader = 'Basic ' + btoa(username + ':' + password);
    }

    async _request(method, filename = '', body = null, extraHeaders = {}) {
        const headers = {
            'Authorization': this.authHeader,
            ...extraHeaders
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await chrome.runtime.sendMessage({
            type: 'webdav_proxy',
            url: this.url + filename,
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.success) {
            throw new Error(response.error);
        }
        return response;
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

    async upload(filename, data) {
        try {
            const response = await this._request('PUT', filename, data);
            if (response.status >= 300) {
                throw new Error(`HTTP ${response.status} ${response.statusText} for ${this.url + filename}`);
            }
            return true;
        } catch (e) {
            console.error('[WebDAV] Upload failed:', e);
            throw e;
        }
    }

    async download(filename) {
        try {
            const response = await this._request('GET', filename);
            if (response.status === 404) return null;
            if (response.status >= 400) throw new Error(`HTTP ${response.status}`);
            return response.data;
        } catch (e) {
            console.error('[WebDAV] Download failed:', e);
            throw e;
        }
    }
}
