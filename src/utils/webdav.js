export class WebDAVClient {
    constructor(url, username, password) {
        this.url = url.endsWith('/') ? url : url + '/';
        this.username = username;
        this.password = password;
        this.authHeader = 'Basic ' + btoa(username + ':' + password);
    }

    async checkConnection() {
        try {
            const response = await fetch(this.url, {
                method: 'PROPFIND',
                headers: {
                    'Authorization': this.authHeader,
                    'Depth': '0',
                    'Content-Type': 'application/xml' // Or text/xml
                }
            });
            return response.ok;
        } catch (e) {
            console.error('[WebDAV] Connection check failed:', e);
            return false;
        }
    }

    async upload(filename, data) {
        const fullUrl = this.url + filename;
        try {
            const response = await fetch(fullUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (e) {
            console.error('[WebDAV] Upload failed:', e);
            throw e;
        }
    }

    async download(filename) {
        const fullUrl = this.url + filename;
        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': this.authHeader
                }
            });
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error('[WebDAV] Download failed:', e);
            throw e;
        }
    }
}
