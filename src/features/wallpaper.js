import { storageGet, storageSet } from '../utils/storage.js';
import { db, STORES_CONSTANTS } from '../utils/db.js';

export async function getWallpaperUrl(ctx) {
    const { settings } = ctx.state;

    console.log('[getWallpaperUrl] Checking source:', settings.wallpaperSource);

    if (settings.wallpaperSource === 'local') {
        const data = await db.get(STORES_CONSTANTS.WALLPAPERS, 'local');
        if (data) {
            console.log('[getWallpaperUrl] ✓ Returning local wallpaper from IDB');
            if (data instanceof Blob) {
                return URL.createObjectURL(data);
            }
            return data;
        }
    }
    // ... bing/google ignore for now as they are URLs usually, or cached blobs?
    // Bing/Google in this codebase seem to use external URLs or previous cached strings.
    // If we want to cache their blobs, we would need to fetchBlob and save.
    // Existing logic uses `db.get` for 'bing'/'google'.
    // If we stored strings there, it works.

    // For now only 'local' is guaranteed Blob by our change.

    if (settings.wallpaperSource === 'bing') {
        const data = await db.get(STORES_CONSTANTS.WALLPAPERS, 'bing');
        if (data) return data;
    }
    if (settings.wallpaperSource === 'google') {
        const data = await db.get(STORES_CONSTANTS.WALLPAPERS, 'google');
        if (data) return data;
    }

    console.warn('[getWallpaperUrl] No wallpaper found in IDB for source:', settings.wallpaperSource);
    return null;
}

export async function displayWallpaper(ctx, imageUrl, saveKey = null) {
    const { body } = ctx.dom;

    const style = document.createElement('style');
    style.textContent = `body::before { background-image: url("${imageUrl}") !important; }`;
    document.head.appendChild(style);
    body?.classList.add('has-wallpaper');

    if (saveKey) {
        // Map saveKey to IDB keys
        let dbKey = null;
        if (saveKey === 'wallpaperData') dbKey = 'local';
        else if (saveKey === 'currentBingWallpaper') dbKey = 'bing';
        else if (saveKey === 'currentGoogleWallpaper') dbKey = 'google';

        if (dbKey) {
            await db.set(STORES_CONSTANTS.WALLPAPERS, dbKey, imageUrl);
        }
        // Legacy: we used to verify saving here
    }

    console.log('[Wallpaper] Wallpaper displayed, saved key:', saveKey);
}

export async function loadWallpaper(ctx) {
    const { settings } = ctx.state;
    const { wallpaperRefreshBtn, body } = ctx.dom;

    console.log('[Wallpaper] Loading wallpaper source:', settings.wallpaperSource);

    if (settings.wallpaperSource === 'local') {
        console.log('[Wallpaper] Loading local wallpaper...');
        const data = await db.get(STORES_CONSTANTS.WALLPAPERS, 'local');
        if (data) {
            await displayWallpaper(ctx, data, 'wallpaperData');
            console.log('[Wallpaper] Local wallpaper loaded from IDB');
        } else {
            console.log('[Wallpaper] No local wallpaper found in IDB');
            // Maybe fallback to default or nothing
        }
        wallpaperRefreshBtn?.classList.remove('show');
        return;
    }

    if (settings.wallpaperSource === 'bing') {
        console.log('[Wallpaper] Bing wallpaper mode - showing refresh button and loading');
        wallpaperRefreshBtn?.classList.add('show');
        fetchBingWallpaper(ctx);
        return;
    }

    if (settings.wallpaperSource === 'google') {
        console.log('[Wallpaper] Google wallpaper mode - showing refresh button and loading');
        wallpaperRefreshBtn?.classList.add('show');
        fetchGoogleWallpaper(ctx);
        return;
    }

    // fallback
    body?.classList.remove('has-wallpaper');
    wallpaperRefreshBtn?.classList.remove('show');
}

export function setupWallpaperRefresh(ctx) {
    const { wallpaperRefreshBtn } = ctx.dom;
    wallpaperRefreshBtn?.addEventListener('click', () => {
        const { wallpaperSource } = ctx.state.settings;
        if (wallpaperSource === 'bing') {
            fetchBingWallpaper(ctx);
        } else if (wallpaperSource === 'google') {
            fetchGoogleWallpaper(ctx);
        }
    });
}

export function fetchBingWallpaper(ctx) {
    console.log('[Wallpaper - Bing] Bing API has CORS restrictions, using fallback wallpapers');

    const bingFallbackWallpapers = [
        'https://www.bing.com/th?id=OHR.MerlionPark_EN-US1969991689_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.ThailandLights_EN-US2050851255_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.IslandBay_EN-US1903389508_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.SaltFlats_EN-US1845236533_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.MooningPlanet_EN-US1751910315_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.PeacockinBloom_EN-US1934253670_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.PrairieWolves_EN-US1823879373_1920x1080.jpg',
    ];

    const randomIdx = Math.floor(Math.random() * bingFallbackWallpapers.length);
    const imageUrl = bingFallbackWallpapers[randomIdx];

    console.log('[Wallpaper - Bing] Selected fallback image index:', randomIdx);

    const img = new Image();
    let loaded = false;

    img.onload = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Bing] Image loaded successfully');
            displayWallpaper(ctx, imageUrl, 'currentBingWallpaper');
        }
    };

    img.onerror = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Bing] Fallback image failed to load, using stored wallpaper');
            useFallbackWallpaper(ctx);
        }
    };

    img.src = imageUrl;

    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Bing] Image load timeout, using stored wallpaper');
            useFallbackWallpaper(ctx);
        }
    }, 3000);
}

export function fetchGoogleWallpaper(ctx) {
    const wallpaperUrls = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1506784983066-a8165c7a090d?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1506704720897-c6b0b8ef6dba?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1506519773649-6e0ee9d4cc6e?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1506780773649-6e0ee9d4cc6e?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop',
    ];

    const randomIndex = Math.floor(Math.random() * wallpaperUrls.length);
    const imageUrl = wallpaperUrls[randomIndex];

    console.log('[Wallpaper - Google] Total URLs available:', wallpaperUrls.length);
    console.log('[Wallpaper - Google] Selected image index:', randomIndex);

    const img = new Image();
    let loaded = false;

    img.onload = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Image loaded successfully');
            displayWallpaper(ctx, imageUrl, 'currentGoogleWallpaper');
        }
    };

    img.onerror = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Image failed to load, trying next...');
            tryNextImage(ctx, wallpaperUrls, randomIndex + 1);
        }
    };

    console.log('[Wallpaper - Google] Starting image load...');
    img.src = imageUrl;

    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Image load timeout, trying next...');
            img.src = '';
            tryNextImage(ctx, wallpaperUrls, randomIndex + 1);
        }
    }, 2000);
}

export function tryNextImage(ctx, urls, startIndex) {
    if (startIndex >= urls.length) {
        console.log('[Wallpaper - Google] All images failed, using fallback');
        useFallbackWallpaper(ctx);
        return;
    }

    const imageUrl = urls[startIndex];
    const img = new Image();
    let loaded = false;

    img.onload = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Fallback image loaded successfully, index:', startIndex);
            displayWallpaper(ctx, imageUrl, 'currentGoogleWallpaper');
        }
    };

    img.onerror = () => {
        if (!loaded) {
            loaded = true;
            tryNextImage(ctx, urls, startIndex + 1);
        }
    };

    img.src = imageUrl;

    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            img.src = '';
            tryNextImage(ctx, urls, startIndex + 1);
        }
    }, 2000);
}

export function useFallbackWallpaper(ctx) {
    const { body } = ctx.dom;
    storageGet(['lastBingWallpaper', 'lastGoogleWallpaper']).then((result) => {
        if (result.lastBingWallpaper) {
            body.style.backgroundImage = `url("${result.lastBingWallpaper}")`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundRepeat = 'no-repeat';
            body.classList.add('has-wallpaper');
        } else if (result.lastGoogleWallpaper) {
            body.style.backgroundImage = `url("${result.lastGoogleWallpaper}")`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundRepeat = 'no-repeat';
            body.classList.add('has-wallpaper');
        } else {
            body.style.backgroundImage = 'none';
            body.classList.remove('has-wallpaper');
        }
    });
}
