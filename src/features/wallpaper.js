import { storageGet, storageSet } from '../utils/storage.js';

export function getWallpaperUrl(ctx, storageResult) {
    const { settings } = ctx.state;

    console.log('[getWallpaperUrl] Checking source:', settings.wallpaperSource, {
        hasLocalData: !!storageResult.wallpaperData,
        hasBingData: !!storageResult.currentBingWallpaper,
        hasGoogleData: !!storageResult.currentGoogleWallpaper,
    });

    if (settings.wallpaperSource === 'local' && storageResult.wallpaperData) {
        console.log('[getWallpaperUrl] ✓ Returning local wallpaper');
        return storageResult.wallpaperData;
    }
    if (settings.wallpaperSource === 'bing' && storageResult.currentBingWallpaper) {
        console.log('[getWallpaperUrl] ✓ Returning Bing wallpaper');
        return storageResult.currentBingWallpaper;
    }
    if (settings.wallpaperSource === 'google' && storageResult.currentGoogleWallpaper) {
        console.log('[getWallpaperUrl] ✓ Returning Google wallpaper');
        return storageResult.currentGoogleWallpaper;
    }

    console.warn('[getWallpaperUrl] No wallpaper found for source:', settings.wallpaperSource);
    return null;
}

export async function displayWallpaper(ctx, imageUrl, saveKey = null) {
    const { body } = ctx.dom;

    const style = document.createElement('style');
    style.textContent = `body::before { background-image: url("${imageUrl}") !important; }`;
    document.head.appendChild(style);
    body?.classList.add('has-wallpaper');

    if (saveKey) {
        await storageSet({ [saveKey]: imageUrl });
    }

    console.log('[Wallpaper] Wallpaper displayed, saved key:', saveKey);
}

export async function loadWallpaper(ctx) {
    const { settings } = ctx.state;
    const { wallpaperRefreshBtn, body } = ctx.dom;

    console.log('[Wallpaper] Loading wallpaper source:', settings.wallpaperSource);

    if (settings.wallpaperSource === 'local') {
        console.log('[Wallpaper] Loading local wallpaper...');
        const result = await storageGet(['wallpaperData']);
        if (result.wallpaperData) {
            await displayWallpaper(ctx, result.wallpaperData, 'wallpaperData');
            console.log('[Wallpaper] Local wallpaper loaded and saved');
        } else {
            console.log('[Wallpaper] No local wallpaper found');
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
