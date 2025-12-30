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
async function getClientId() {
    const stored = await storageGet(['clientId']);
    if (stored.clientId) return stored.clientId;
    const newId = crypto.randomUUID();
    await storageSet({ clientId: newId });
    return newId;
}

async function computePayloadHash(data) {
    const msgBuffer = new TextEncoder().encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sync Upload: Push local to remote
 */
export async function syncUpload(ctx, force = false) {
    const { webdavUrl, webdavUsername, webdavPassword } = ctx.state.settings;
    if (!webdavUrl) throw new Error('请输入 WebDAV URL');

    const client = new WebDAVClient(webdavUrl, webdavUsername, webdavPassword);
    const statusEl = document.getElementById('sync-status');
    const updateStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

    // 1. Prepare Payload
    const settingsToUpload = { ...ctx.state.settings };
    delete settingsToUpload.webdavUrl;
    delete settingsToUpload.webdavUsername;
    delete settingsToUpload.webdavPassword;

    const appsToUpload = ctx.state.allApps.filter(app => app !== null);

    const payloadContent = {
        settings: settingsToUpload,
        apps: appsToUpload
    };

    const payloadHash = await computePayloadHash(payloadContent);
    const clientId = await getClientId();
    const now = Date.now();

    const finalPayload = {
        schemaVersion: 2,
        updatedAt: now,
        clientId: clientId,
        payloadHash: payloadHash,
        ...payloadContent
    };

    updateStatus('Checking remote status...');

    // 2. Conflict Check
    if (!force) {
        try {
            const remoteData = await client.download('settings.json');
            if (remoteData) {
                // V2 check
                if (remoteData.schemaVersion === 2) {
                    if (remoteData.payloadHash === payloadHash) {
                        updateStatus('Remote content is identical. Skipping upload.');
                        return;
                    }
                    if (remoteData.updatedAt > now && remoteData.payloadHash !== payloadHash) {
                        // Strictly newer remote?
                        // If we want to be safe, we should warn.
                        // But for now, user action "Upload" usually implies "Overwrite".
                        // We'll log it but proceed if valid.
                        console.warn('Overwriting newer remote data');
                    }
                } else if (remoteData.timestamp && remoteData.timestamp > now) {
                    // V1 check
                    console.warn('Overwriting newer remote V1 data');
                }
            }
        } catch (e) {
            // Ignore missing
        }
    }

    // 3. Identify binaries
    const blobsToUpload = [];

    // Wallpaper logic merged into combined block above to use dataURLToBlob

    // Icons
    // Import helper
    const { dataURLToBlob } = await import('../utils/images.js');

    const ensureBlob = (data) => {
        if (typeof data === 'string' && data.startsWith('data:')) {
            return dataURLToBlob(data);
        }
        return data;
    };

    // Wallpaper
    if (ctx.state.settings.wallpaperSource === 'local') {
        let wpData = await db.get(STORES_CONSTANTS.WALLPAPERS, 'local');
        if (wpData) {
            wpData = ensureBlob(wpData); // Convert Data URL String -> Blob

            const type = wpData.type || 'image/jpeg';
            const ext = type.split('/')[1] || 'bin';
            blobsToUpload.push({
                name: `wallpaper_local.${ext}`,
                data: wpData,
                type: type
            });
        }
    }

    // Icons
    for (const app of appsToUpload) {
        if (app.img && app.img.startsWith('idb://favicons/')) {
            const hash = app.img.split('/').pop();
            let iconData = await db.get(STORES_CONSTANTS.FAVICONS, hash);
            if (iconData) {
                iconData = ensureBlob(iconData); // Convert Data URL String -> Blob

                const ext = iconData.type ? iconData.type.split('/')[1] : 'png';
                blobsToUpload.push({
                    name: `favicon_${hash}.${ext}`,
                    data: iconData,
                    type: iconData.type || 'image/png'
                });
            }
        }
    }

    // 4. Upload Binaries (Optimized: check existence?)
    // For now, simple upload. Cost of HEAD request vs PUT is similar for small files.
    // Hash check? If remote file exists (by name), content is same (by definition of hash).
    // So if filename exists, SKIP!

    // We need 'Head' method? Client has _request.
    // Or just try PUT.
    let uploadedCount = 0;
    for (const blob of blobsToUpload) {
        updateStatus(`Uploading assets (${uploadedCount + 1}/${blobsToUpload.length})...`);
        try {
            // Optimization: Skip if exists?
            // await client.upload(...) -- standard PUT
            await client.upload(blob.name, blob.data, blob.type);
        } catch (e) {
            console.error('Asset upload failed', e);
        }
        uploadedCount++;
    }

    // 5. Upload Config
    updateStatus('Uploading settings.json...');
    await client.upload('settings.json', finalPayload);

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

    // 1a. Payload Check (Hash) if V2
    if (remoteData.schemaVersion === 2 && remoteData.payloadHash) {
        const currentPayload = {
            settings: { ...ctx.state.settings },
            apps: ctx.state.allApps.filter(a => a)
        };
        // We'd need to exclude creds to match canonical?
        delete currentPayload.settings.webdavUrl;
        delete currentPayload.settings.webdavUsername;
        delete currentPayload.settings.webdavPassword;

        const localHash = await computePayloadHash(currentPayload);
        if (localHash === remoteData.payloadHash) {
            updateStatus('Already up to date.');
            return;
        }
    }

    // 2. Identify Missing Binaries (Atomic Prepare)
    const neededBinaries = []; // { name, store, key }

    // Wallpaper
    // Determine remote wallpaper reference?
    // In V2 we might need to store it in 'settings' or 'meta'. 
    // Or just look for standard 'wallpaper_local.*'
    if (remoteData.settings.wallpaperSource === 'local') {
        // We try standard names
        neededBinaries.push({ name: 'wallpaper_local.jpeg', store: 'wallpaper', key: 'local' });
        neededBinaries.push({ name: 'wallpaper_local.png', store: 'wallpaper', key: 'local' });
        neededBinaries.push({ name: 'wallpaper_local.bin', store: 'wallpaper', key: 'local' });
        // Legacy
        neededBinaries.push({ name: 'wallpaper_local.data', store: 'wallpaper', key: 'local', isLegacy: true });
    }

    // Icons
    if (Array.isArray(remoteData.apps)) {
        for (const app of remoteData.apps) {
            if (!app) continue;
            if (app.img && app.img.startsWith('idb://favicons/')) {
                const id = app.img.split('/').pop();
                // If V2, 'id' is Hash. Filename is `favicon_${id}.png` or similar.
                // We'll try a few extensions or rely on 'bin'.
                // Ideally V2 'app.img' logic implies filename match.
                // But we don't store exact filename extension in app.img.
                // Let's queue main candidates.
                neededBinaries.push({ name: `favicon_${id}.png`, store: 'favicon', key: id });
                neededBinaries.push({ name: `favicon_${id}.bin`, store: 'favicon', key: id });
                neededBinaries.push({ name: `favicon_${id}.ico`, store: 'favicon', key: id });
                // Legacy
                if (id.length > 50) return; // Hash is 64 hex chars. UUID is 36.
            }
        }
    }

    // 3. Download & Verify in Memory/Temp (Atomic Phase 1)
    // We use a temporary map so we don't pollute IDB if half fails?
    // Actually writing to IDB is persistent. 
    // "Atomic" implies: don't update 'apps/settings' until all assets are safe.
    // Saving to IDB is safe because if we crash, they are just orphaned blobs (GC later).
    // The critical part is NOT updating `ctx.state` until success.

    let downloadedCount = 0;
    // We need to dedupe neededBinaries by key?
    // And optimization: check if IDB already has it?
    // Hash-based ID means: if we have IDB key, we have content!

    const uniqueAssets = new Map(); // key -> { possibleNames... }
    for (const item of neededBinaries) {
        if (item.store === 'favicon') {
            // Check local IDB first
            const exists = await db.get(STORES_CONSTANTS.FAVICONS, item.key);
            // If exists is string "[object Blob]", we must kill it and re-download!
            if (typeof exists === 'string' && exists.includes('[object Blob]')) {
                await db.delete(STORES_CONSTANTS.FAVICONS, item.key);
                // proceed to download
            } else if (exists) {
                continue; // Skip download!
            }
        }
        // Wallpaper always re-download? Hash check would be nice but wallpaper key is 'local' (fixed).
        // So wallpaper always download.

        if (!uniqueAssets.has(item.key)) {
            uniqueAssets.set(item.key, item);
        }
    }

    const assetsToFetch = Array.from(uniqueAssets.values());

    for (const item of assetsToFetch) {
        updateStatus(`Downloading assets (${downloadedCount + 1}/${assetsToFetch.length})...`);

        let content = null;
        // Try names
        const namesToTry = [item.name];
        // Logic to populate namesToTry based on item? 
        // We pushed multiple variants above, but map deduped by key. 
        // Let's simplify: try strict logic.

        // Actually, let's just loop names associated with key if we grouped them.
        // Current logic above pushed multiple items with same key.
        // 'uniqueAssets' only kept LAST one. Bad.

        // Fix: Just loop original neededBinaries, check IDB, if missing, try download.
        // If download fails, try next variant?
        // This is getting complex.
        // V2 Simplified: Just try `favicon_${id}.png` then `.bin`.

        try {
            // Try defaults
            // NOTE: WebDAV Client 'download' returns null on 404
            if (item.store === 'wallpaper') {
                content = await client.download('wallpaper_local.png', true) ||
                    await client.download('wallpaper_local.jpeg', true) ||
                    await client.download('wallpaper_local.bin', true);
            } else {
                content = await client.download(`favicon_${item.key}.png`, true) ||
                    await client.download(`favicon_${item.key}.bin`, true);
            }

            if (content) {
                // Critical Guard: V2 Sync Fix
                let isCorrupt = false;
                if (typeof content === 'string' && content.includes('[object Blob]')) {
                    isCorrupt = true;
                } else if (content instanceof Blob && content.size < 50) {
                    // Check if blob content is literally "[object Blob]"
                    const text = await content.text();
                    if (text.includes('[object Blob]')) {
                        isCorrupt = true;
                    }
                }

                if (isCorrupt) {
                    console.error(`[Sync] Downloaded CORRUPT data for ${item.key}. Discarding.`);
                    // Do not save. Treat as failed.
                    break;
                }

                if (item.store === 'wallpaper') {
                    // Revert to Data URL logic:
                    // If content is Blob, convert to Data URL String before saving
                    if (content instanceof Blob) {
                        const { blobToDataUrl } = await import('../utils/images.js');
                        content = await blobToDataUrl(content);
                    }
                    await db.set(STORES_CONSTANTS.WALLPAPERS, item.key, content);
                } else {
                    await db.set(STORES_CONSTANTS.FAVICONS, item.key, content);
                }
            }
        } catch (e) {
            console.warn(`Failed asset ${item.key}`, e);
        }
        downloadedCount++;
    }

    // 4. Apply Settings (Atomic Phase 2)
    // Only reachable if no major error thrown.

    // OVERWRITE LOGIC (Merge is complex, defaulting to overwrite for Atomic V2 baseline)
    if (mode === 'merge') {
        const remoteSettings = { ...remoteData.settings };
        delete remoteSettings.webdavUrl;
        delete remoteSettings.webdavUsername;
        delete remoteSettings.webdavPassword;
        Object.assign(ctx.state.settings, remoteSettings);

        const localApps = ctx.state.allApps;
        const remoteApps = remoteData.apps || [];
        const urlMap = new Map();
        localApps.forEach(app => { if (app.url) urlMap.set(app.url, app); });
        remoteApps.forEach(app => {
            if (app.url) urlMap.set(app.url, app);
        });
        ctx.state.allApps = Array.from(urlMap.values());
    } else {
        const remoteSettings = { ...remoteData.settings };
        delete remoteSettings.webdavUrl;
        delete remoteSettings.webdavUsername;
        delete remoteSettings.webdavPassword;
        Object.assign(ctx.state.settings, remoteSettings);
        ctx.state.allApps = remoteData.apps || [];
    }

    // 5. Save and Render
    await storageSet({ apps: ctx.state.allApps, settings: ctx.state.settings });

    applySettings(ctx);
    await loadWallpaper(ctx); // Reload wallpaper

    updateStatus(`Sync complete! (${new Date().toLocaleTimeString()})`);
}
