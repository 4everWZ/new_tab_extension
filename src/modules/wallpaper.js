// ==================== 壁纸功能模块 ====================

import { getWallpaperUrl } from '../utils/helpers.js';
import { bingFallbackWallpapers, googleFallbackWallpapers } from '../utils/constants.js';
import StorageManager from './storage.js';

export class WallpaperManager {
    constructor() {
        this.body = document.getElementById('body');
        this.wallpaperRefreshBtn = document.getElementById('wallpaper-refresh-btn');
        this.settings = null;
    }

    // 显示壁纸
    displayWallpaper(imageUrl, saveKey = null) {
        const style = document.createElement('style');
        style.textContent = `body::before { background-image: url("${imageUrl}") !important; }`;
        document.head.appendChild(style);
        this.body.classList.add('has-wallpaper');
        
        if (saveKey) {
            StorageManager.saveWallpaper(saveKey, imageUrl);
        }
        console.log('[Wallpaper] Wallpaper displayed, saved key:', saveKey);
    }

    // 加载壁纸（根据设置选择来源）
    loadWallpaper(settings) {
        this.settings = settings;
        console.log('[Wallpaper] Loading wallpaper source:', settings.wallpaperSource);
        
        if (settings.wallpaperSource === 'local') {
            this.loadLocalWallpaper();
            this.wallpaperRefreshBtn.classList.remove('show');
        } else if (settings.wallpaperSource === 'bing') {
            this.wallpaperRefreshBtn.classList.add('show');
            this.fetchBingWallpaper();
        } else if (settings.wallpaperSource === 'google') {
            this.wallpaperRefreshBtn.classList.add('show');
            this.fetchGoogleWallpaper();
        }
    }

    // 加载本地壁纸
    loadLocalWallpaper() {
        console.log('[Wallpaper] Loading local wallpaper...');
        StorageManager.loadAllData().then(result => {
            if (result.wallpaperData) {
                this.displayWallpaper(result.wallpaperData, 'wallpaperData');
                console.log('[Wallpaper] Local wallpaper loaded');
            } else {
                console.log('[Wallpaper] No local wallpaper found');
            }
        });
    }

    // 获取 Bing 壁纸
    fetchBingWallpaper() {
        console.log('[Wallpaper - Bing] Using fallback wallpapers');
        const randomIdx = Math.floor(Math.random() * bingFallbackWallpapers.length);
        const imageUrl = bingFallbackWallpapers[randomIdx];
        
        console.log('[Wallpaper - Bing] Selected fallback image index:', randomIdx);
        
        const img = new Image();
        let loaded = false;
        
        img.onload = () => {
            if (!loaded) {
                loaded = true;
                console.log('[Wallpaper - Bing] Image loaded successfully');
                this.displayWallpaper(imageUrl, 'currentBingWallpaper');
            }
        };
        
        img.onerror = () => {
            if (!loaded) {
                loaded = true;
                console.log('[Wallpaper - Bing] Image failed to load');
                this.useFallbackWallpaper();
            }
        };
        
        img.src = imageUrl;
        
        setTimeout(() => {
            if (!loaded) {
                loaded = true;
                console.log('[Wallpaper - Bing] Image load timeout');
                this.useFallbackWallpaper();
            }
        }, 3000);
    }

    // 获取 Google 壁纸
    fetchGoogleWallpaper() {
        console.log('[Wallpaper - Google] Starting image load');
        const randomIndex = Math.floor(Math.random() * googleFallbackWallpapers.length);
        this.tryLoadGoogleWallpaper(randomIndex);
    }

    // 尝试加载 Google 壁纸
    tryLoadGoogleWallpaper(startIndex) {
        if (startIndex >= googleFallbackWallpapers.length) {
            console.log('[Wallpaper - Google] All images failed');
            this.useFallbackWallpaper();
            return;
        }
        
        const imageUrl = googleFallbackWallpapers[startIndex];
        const img = new Image();
        let loaded = false;
        
        img.onload = () => {
            if (!loaded) {
                loaded = true;
                console.log('[Wallpaper - Google] Image loaded successfully');
                this.displayWallpaper(imageUrl, 'currentGoogleWallpaper');
            }
        };
        
        img.onerror = () => {
            if (!loaded) {
                loaded = true;
                this.tryLoadGoogleWallpaper(startIndex + 1);
            }
        };
        
        img.src = imageUrl;
        
        setTimeout(() => {
            if (!loaded) {
                loaded = true;
                img.src = '';
                this.tryLoadGoogleWallpaper(startIndex + 1);
            }
        }, 2000);
    }

    // 使用备用壁纸
    useFallbackWallpaper() {
        StorageManager.loadAllData().then(result => {
            if (result.lastBingWallpaper) {
                this.body.style.backgroundImage = `url("${result.lastBingWallpaper}")`;
                this.body.style.backgroundSize = 'cover';
                this.body.style.backgroundPosition = 'center';
                this.body.classList.add('has-wallpaper');
            } else if (result.lastGoogleWallpaper) {
                this.body.style.backgroundImage = `url("${result.lastGoogleWallpaper}")`;
                this.body.style.backgroundSize = 'cover';
                this.body.style.backgroundPosition = 'center';
                this.body.classList.add('has-wallpaper');
            } else {
                this.body.style.backgroundImage = 'none';
                this.body.classList.remove('has-wallpaper');
            }
        });
    }
}

export default WallpaperManager;
