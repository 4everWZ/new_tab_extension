/**
 * 壁纸管理模块 - 处理壁纸相关功能
 */

import dataManager from './DataManager.js';
import {
    BING_FALLBACK_WALLPAPERS,
    GOOGLE_WALLPAPER_URLS,
    IMAGE_COMPRESSION_CONFIG,
    WALLPAPER_LOAD_TIMEOUT,
    CONSTANTS
} from './config.js';

class WallpaperManager {
    constructor() {
        this.currentWallpaper = null;
        this.loadTimeout = WALLPAPER_LOAD_TIMEOUT;
    }

    /**
     * 获取壁纸URL
     */
    getWallpaperUrl(storageResult) {
        const settings = dataManager.getSettings();
        
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

    /**
     * 压缩图片
     */
    compressImage(dataUrl, maxSize = IMAGE_COMPRESSION_CONFIG.maxSize) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;
                const maxDimension = IMAGE_COMPRESSION_CONFIG.maxDimension;

                if (width > height) {
                    if (width > maxDimension) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                let quality = IMAGE_COMPRESSION_CONFIG.quality;
                let compressedData = canvas.toDataURL('image/jpeg', quality);

                // 逐步降低质量直到达到大小限制
                while (compressedData.length > maxSize && quality > 0.1) {
                    quality -= 0.05;
                    compressedData = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(compressedData);
            };
            img.onerror = () => resolve(null);
            img.src = dataUrl;
        });
    }

    /**
     * 检查图片是否有透明背景
     */
    checkImageTransparency(imageUrl) {
        return new Promise((resolve) => {
            try {
                const img = new Image();
                img.crossOrigin = 'Anonymous';

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // 检查是否有透明像素
                    for (let i = 3; i < data.length; i += 4) {
                        if (data[i] < 255) {
                            resolve(true); // 有透明背景
                            return;
                        }
                    }
                    resolve(false); // 无透明背景
                };

                img.onerror = () => resolve(false);
                img.src = imageUrl;
            } catch (e) {
                console.error('[checkImageTransparency] Error:', e);
                resolve(false);
            }
        });
    }

    /**
     * 将图片转换为 data URL
     */
    convertImageToDataUrl(imageUrl) {
        return new Promise((resolve) => {
            try {
                const img = new Image();
                img.crossOrigin = 'Anonymous';

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };

                img.onerror = () => {
                    console.error('[convertImageToDataUrl] Failed to load image:', imageUrl);
                    resolve(null);
                };

                img.src = imageUrl;
            } catch (e) {
                console.error('[convertImageToDataUrl] Error:', e);
                resolve(null);
            }
        });
    }

    /**
     * 显示壁纸
     */
    displayWallpaper(imageUrl, saveKey = null) {
        const style = document.createElement('style');
        style.textContent = `body::before { background-image: url("${imageUrl}") !important; }`;
        document.head.appendChild(style);
        document.body.classList.add('has-wallpaper');

        if (saveKey) {
            dataManager.saveWallpaperData(saveKey, imageUrl);
        }
        console.log('[Wallpaper] Wallpaper displayed, saved key:', saveKey);
    }

    /**
     * 加载壁纸
     */
    loadWallpaper() {
        const settings = dataManager.getSettings();
        console.log('[Wallpaper] Loading wallpaper source:', settings.wallpaperSource);

        if (settings.wallpaperSource === 'local') {
            const storageData = dataManager.getAllStorageData();
            const wallpaperUrl = this.getWallpaperUrl(storageData);
            if (wallpaperUrl) {
                this.displayWallpaper(wallpaperUrl);
            }
        } else if (settings.wallpaperSource === 'bing') {
            this.fetchBingWallpaper();
        } else if (settings.wallpaperSource === 'google') {
            this.fetchGoogleWallpaper();
        }
    }

    /**
     * 获取 Bing 壁纸
     */
    fetchBingWallpaper() {
        console.log('[Wallpaper - Bing] Using fallback wallpapers');

        const randomIdx = Math.floor(Math.random() * BING_FALLBACK_WALLPAPERS.length);
        const imageUrl = BING_FALLBACK_WALLPAPERS[randomIdx];

        console.log('[Wallpaper - Bing] Selected fallback image index:', randomIdx);

        const img = new Image();
        let loaded = false;

        img.onload = () => {
            if (!loaded) {
                loaded = true;
                this.displayWallpaper(imageUrl, CONSTANTS.STORAGE_KEYS.CURRENT_BING_WALLPAPER);
            }
        };

        img.onerror = () => {
            if (!loaded) {
                loaded = true;
                this.useFallbackWallpaper();
            }
        };

        img.src = imageUrl;

        // 设置超时
        setTimeout(() => {
            if (!loaded) {
                loaded = true;
                this.useFallbackWallpaper();
            }
        }, this.loadTimeout);
    }

    /**
     * 获取 Google 壁纸
     */
    fetchGoogleWallpaper() {
        const randomIndex = Math.floor(Math.random() * GOOGLE_WALLPAPER_URLS.length);
        const imageUrl = GOOGLE_WALLPAPER_URLS[randomIndex];

        console.log('[Wallpaper - Google] Total URLs available:', GOOGLE_WALLPAPER_URLS.length);
        console.log('[Wallpaper - Google] Selected image index:', randomIndex);

        const img = new Image();
        let loaded = false;

        img.onload = () => {
            if (!loaded) {
                loaded = true;
                this.displayWallpaper(imageUrl, CONSTANTS.STORAGE_KEYS.CURRENT_GOOGLE_WALLPAPER);
            }
        };

        img.onerror = () => {
            if (!loaded) {
                loaded = true;
                this.tryNextImage(GOOGLE_WALLPAPER_URLS, randomIndex + 1);
            }
        };

        console.log('[Wallpaper - Google] Starting image load...');
        img.src = imageUrl;

        setTimeout(() => {
            if (!loaded) {
                loaded = true;
                this.tryNextImage(GOOGLE_WALLPAPER_URLS, randomIndex + 1);
            }
        }, this.loadTimeout);
    }

    /**
     * 尝试加载下一张图片
     */
    tryNextImage(urls, startIndex) {
        if (startIndex >= urls.length) {
            this.useFallbackWallpaper();
            return;
        }

        const imageUrl = urls[startIndex];
        const img = new Image();
        let loaded = false;

        img.onload = () => {
            if (!loaded) {
                loaded = true;
                this.displayWallpaper(imageUrl, CONSTANTS.STORAGE_KEYS.CURRENT_GOOGLE_WALLPAPER);
            }
        };

        img.onerror = () => {
            if (!loaded) {
                loaded = true;
                this.tryNextImage(urls, startIndex + 1);
            }
        };

        img.src = imageUrl;

        setTimeout(() => {
            if (!loaded) {
                loaded = true;
                this.tryNextImage(urls, startIndex + 1);
            }
        }, this.loadTimeout);
    }

    /**
     * 使用备用壁纸
     */
    useFallbackWallpaper() {
        chrome.storage.local.get(
            [CONSTANTS.STORAGE_KEYS.LAST_BING_WALLPAPER, CONSTANTS.STORAGE_KEYS.LAST_GOOGLE_WALLPAPER],
            (result) => {
                const fallbackUrl =
                    result[CONSTANTS.STORAGE_KEYS.LAST_BING_WALLPAPER] ||
                    result[CONSTANTS.STORAGE_KEYS.LAST_GOOGLE_WALLPAPER] ||
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

                this.displayWallpaper(fallbackUrl);
            }
        );
    }

    /**
     * 刷新壁纸
     */
    refreshWallpaper() {
        const settings = dataManager.getSettings();
        
        if (settings.wallpaperSource === 'bing') {
            this.fetchBingWallpaper();
        } else if (settings.wallpaperSource === 'google') {
            this.fetchGoogleWallpaper();
        }
    }
}

export default new WallpaperManager();
