import { db, STORES_CONSTANTS } from './db.js';

export function storageGet(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => resolve(result || {}));
    });
}

export function storageSet(items) {
    return new Promise((resolve) => {
        chrome.storage.local.set(items, () => {
            if (chrome.runtime?.lastError) {
                console.error('[Storage] Set failed:', chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}

export async function migrateToIndexedDB() {
    const data = await storageGet(null);
    const keysToRemove = [];
    let appsChanged = false;

    // 1. Migrate Wallpapers
    if (data.wallpaperData && typeof data.wallpaperData === 'string' && data.wallpaperData.startsWith('data:')) {
        await db.set(STORES_CONSTANTS.WALLPAPERS, 'local', data.wallpaperData);
        keysToRemove.push('wallpaperData');
        console.log('[Migration] Moved local wallpaper to IDB');
    }

    if (data.currentBingWallpaper && typeof data.currentBingWallpaper === 'string' && data.currentBingWallpaper.startsWith('data:')) {
        await db.set(STORES_CONSTANTS.WALLPAPERS, 'bing', data.currentBingWallpaper);
        keysToRemove.push('currentBingWallpaper');
        console.log('[Migration] Moved Bing wallpaper to IDB');
    }

    if (data.currentGoogleWallpaper && typeof data.currentGoogleWallpaper === 'string' && data.currentGoogleWallpaper.startsWith('data:')) {
        await db.set(STORES_CONSTANTS.WALLPAPERS, 'google', data.currentGoogleWallpaper);
        keysToRemove.push('currentGoogleWallpaper');
        console.log('[Migration] Moved Google wallpaper to IDB');
    }

    // 2. Migrate Shortcuts (Favicons)
    if (Array.isArray(data.apps)) {
        for (const app of data.apps) {
            if (app && app.img && app.img.startsWith('data:')) {
                const id = crypto.randomUUID();
                await db.set(STORES_CONSTANTS.FAVICONS, id, app.img);
                app.img = `idb://favicons/${id}`;
                appsChanged = true;
            }
        }
        if (appsChanged) {
            await storageSet({ apps: data.apps });
            console.log('[Migration] Moved app icons to IDB');
        }
    }

    // 3. Clean up
    if (keysToRemove.length > 0) {
        await new Promise(resolve => chrome.storage.local.remove(keysToRemove, resolve));
        console.log('[Migration] Removed migrated keys from storage.local');
    }
}
