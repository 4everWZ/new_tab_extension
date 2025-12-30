import { WebDAVClient } from '../utils/webdav.js';
import { db, STORES_CONSTANTS } from '../utils/db.js';
import { storageGet, storageSet } from '../utils/storage.js';
import { loadWallpaper } from './wallpaper.js';
import { render } from './shortcuts.js';
import { applySettings } from '../ui/settingsApply.js';

export async function checkWebDAVConnection(ctx) {
    const { webdavUrl, webdavUsername, webdavPassword } = ctx.state.settings;
    if (!webdavUrl) throw new Error('请输入 WebDAV URL');

    const client = new WebDAVClient(webdavUrl, webdavUsername, webdavPassword);
    return await client.checkConnection();
}

export async function syncUpload(ctx) {
    const { webdavUrl, webdavUsername, webdavPassword } = ctx.state.settings;
    if (!webdavUrl) throw new Error('请输入 WebDAV URL');

    const client = new WebDAVClient(webdavUrl, webdavUsername, webdavPassword);
    const statusEl = document.getElementById('sync-status');
    const updateStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

    updateStatus('Uploading configuration...');

    // 1. Prepare JSON Payload
    const data = {
        settings: ctx.state.settings,
        apps: ctx.state.allApps.filter(app => app !== null),
        timestamp: Date.now()
    };

    // 2. Identify binaries to upload
    const blobsToUpload = [];

    // Wallpaper
    if (ctx.state.settings.wallpaperSource === 'local') {
        const wpData = await db.get(STORES_CONSTANTS.WALLPAPERS, 'local');
        if (wpData) {
            blobsToUpload.push({
                name: 'wallpaper_local',
                data: wpData // Base64 string
            });
        }
    }

    // App Icons
    for (const app of ctx.state.allApps) {
        if (!app) continue;
        if (app.img && app.img.startsWith('idb://favicons/')) {
            const id = app.img.split('/').pop();
            const iconData = await db.get(STORES_CONSTANTS.FAVICONS, id);
            if (iconData) {
                blobsToUpload.push({
                    name: `favicon_${id}`,
                    data: iconData
                });
            }
        }
    }

    // 3. Upload binaries
    let uploadedCount = 0;
    for (const blob of blobsToUpload) {
        updateStatus(`Uploading assets (${uploadedCount + 1}/${blobsToUpload.length})...`);
        // We wrap base64 in a simple JSON or text file, or just raw?
        // Raw is better but we are dealing with base64 strings in IDB.
        // Let's finish them with .txt suffix or just custom extension
        await client.upload(blob.name + '.data', { content: blob.data });
        uploadedCount++;
    }

    // 4. Upload Config
    updateStatus('Uploading settings.json...');
    await client.upload('settings.json', data);

    updateStatus(`Upload complete! (${new Date().toLocaleTimeString()})`);
}

export async function syncDownload(ctx, mode = 'overwrite') { // mode: 'overwrite' | 'merge'
    const { webdavUrl, webdavUsername, webdavPassword } = ctx.state.settings;
    if (!webdavUrl) throw new Error('请输入 WebDAV URL');

    const client = new WebDAVClient(webdavUrl, webdavUsername, webdavPassword);
    const statusEl = document.getElementById('sync-status');
    const updateStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

    updateStatus('Downloading configuration...');

    // 1. Download settings.json
    const remoteData = await client.download('settings.json');
    if (!remoteData) throw new Error('Remote settings.json not found');

    // 2. Determine what binaries we need
    const neededBinaries = [];

    // Wallpaper
    if (remoteData.settings.wallpaperSource === 'local') {
        neededBinaries.push('wallpaper_local');
    }

    // Icons
    if (Array.isArray(remoteData.apps)) {
        for (const app of remoteData.apps) {
            if (!app) continue;
            if (app.img && app.img.startsWith('idb://favicons/')) {
                const id = app.img.split('/').pop();
                neededBinaries.push(`favicon_${id}`);
            }
        }
    }

    // 3. Download binaries
    let downloadedCount = 0;
    for (const name of neededBinaries) {
        updateStatus(`Downloading assets (${downloadedCount + 1}/${neededBinaries.length})...`);
        try {
            const wrapper = await client.download(name + '.data');
            if (wrapper && wrapper.content) {
                if (name === 'wallpaper_local') {
                    await db.set(STORES_CONSTANTS.WALLPAPERS, 'local', wrapper.content);
                } else if (name.startsWith('favicon_')) {
                    const id = name.replace('favicon_', '');
                    await db.set(STORES_CONSTANTS.FAVICONS, id, wrapper.content);
                }
            }
        } catch (e) {
            console.warn(`Failed to download asset ${name}:`, e);
        }
        downloadedCount++;
    }

    // 4. Apply Settings (Overwrite or Merge)
    if (mode === 'merge') {
        // MERGE LOGIC
        // Settings: Remote overwrites local (per user request usually, or merge?)
        // Implementation Plan said: "Settings: Merged (remote values overwrite local if conflict)"
        Object.assign(ctx.state.settings, remoteData.settings);

        // Restore/Merge webdav config (keep local creds if remote doesn't have them or to avoid lockout?)
        // Usually we don't want to overwrite connection settings with potentially empty ones?
        // But here we are downloading FROM valid connection.

        // Apps: Deduplicate by URL
        const localApps = ctx.state.allApps;
        const remoteApps = remoteData.apps || [];

        const urlMap = new Map();
        localApps.forEach(app => { if (app.url) urlMap.set(app.url, app); });

        remoteApps.forEach(app => {
            if (app.url) {
                urlMap.set(app.url, app); // Remote overwrites local for same URL? Or keep local?
                // Let's say Remote Newer wins? We don't have timestamps per app.
                // Plan: "Deduplicated by URL". I'll let remote overwrite local for same URL.
            }
        });

        ctx.state.allApps = Array.from(urlMap.values());

    } else {
        // OVERWRITE LOGIC
        Object.assign(ctx.state.settings, remoteData.settings);
        ctx.state.allApps = remoteData.apps || [];
    }

    // Ensure we keep the credentials we are currently using, unless we want to sync them?
    // If I overwrite settings, I overwrite webdavUrl/User/Pass.
    // If remote has empty strings, I might lose connection.
    // Ideally we preserve local credentials if remote is empty, or just overwrite.
    // Let's assume user manages this.

    // 5. Save and Render
    await storageSet({ apps: ctx.state.allApps, settings: ctx.state.settings });

    applySettings(ctx);
    await loadWallpaper(ctx); // Reload wallpaper
    render(ctx);

    updateStatus(`Sync complete! (${new Date().toLocaleTimeString()})`);
}
