// ==================== 辅助函数 ====================

// 获取网站 favicon
export function getFaviconUrl(urlString) {
    try {
        const url = new URL(urlString);
        const hostname = url.hostname;
        // 返回多个favicon源的数组，按优先级排列
        return [
            `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
            `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
            `${url.protocol}//${hostname}/favicon.ico`
        ];
    } catch (e) {
        return [];
    }
}

// 获取当前搜索引擎的壁纸 URL
export function getWallpaperUrl(settings, storageResult) {
    console.log('[getWallpaperUrl] Checking source:', settings.wallpaperSource, {
        hasLocalData: !!storageResult.wallpaperData,
        hasBingData: !!storageResult.currentBingWallpaper,
        hasGoogleData: !!storageResult.currentGoogleWallpaper
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

// 格式化搜索引擎 URL
export function formatSearchEngineUrl(baseUrl) {
    let url = baseUrl.trim();
    
    // 检查URL是否以=或?结尾，如果没有则自动添加
    if (!url.endsWith('=') && !url.endsWith('?')) {
        if (url.includes('?')) {
            url += '&q=';
        } else {
            url += '?q=';
        }
    }
    
    // 在URL末尾添加{query}占位符
    url += '{query}';
    
    return url;
}
