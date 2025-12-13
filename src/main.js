// ==================== 应用入口文件 ====================

import WallpaperManager from './modules/wallpaper.js';
import SearchManager from './modules/search.js';
import ShortcutManager from './modules/shortcuts.js';
import SettingsManager from './modules/settings.js';
import UIManager from './modules/ui.js';
import StorageManager from './modules/storage.js';
import { convertImageToDataUrl, compressImage } from './utils/image.js';

// 全局管理器实例
let wallpaperManager;
let searchManager;
let shortcutManager;
let settingsManager;
let uiManager;

// 初始化应用
async function initApp() {
    console.log('[App] Initializing application...');
    
    try {
        // 初始化 UI
        uiManager = new UIManager();
        uiManager.setupUI();
        uiManager.setupModalClosing();
        uiManager.setupKeyboardShortcuts();
        uiManager.setupResponsive();
        uiManager.setupHighDPI();
        
        // 初始化设置（必须首先加载，因为其他模块依赖于它）
        settingsManager = new SettingsManager();
        await settingsManager.loadSettings();
        
        // 初始化快捷方式
        shortcutManager = new ShortcutManager();
        await shortcutManager.loadApps();
        
        // 初始化搜索引擎
        searchManager = new SearchManager();
        await searchManager.setupSearch();
        
        // 初始化壁纸
        wallpaperManager = new WallpaperManager();
        wallpaperManager.loadWallpaper(settingsManager.settings);
        
        // 绑定壁纸上传
        uiManager.setupWallpaperUpload(handleWallpaperUpload);
        uiManager.setupWallpaperDelete(handleWallpaperDelete);
        
        console.log('[App] Application initialized successfully');
    } catch (error) {
        console.error('[App] Failed to initialize application:', error);
    }
}

// 处理壁纸上传
async function handleWallpaperUpload(file) {
    console.log('[App] Wallpaper upload started:', file.name);
    
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                let dataUrl = event.target.result;
                
                // 自动压缩大于 5MB 的图片
                if (dataUrl.length > 5242880) {
                    console.log('[App] Compressing large wallpaper');
                    dataUrl = await compressImage(dataUrl);
                }
                
                // 保存壁纸
                const result = await StorageManager.loadAllData();
                result.wallpaperData = dataUrl;
                result.settings = result.settings || {};
                result.settings.wallpaperSource = 'local';
                
                await chrome.storage.local.set({
                    wallpaperData: dataUrl,
                    settings: result.settings
                });
                
                // 显示壁纸
                wallpaperManager.displayWallpaper(dataUrl, 'wallpaperData');
                settingsManager.settings.wallpaperSource = 'local';
                
                uiManager.showNotification('Wallpaper uploaded successfully');
                console.log('[App] Wallpaper uploaded successfully');
            } catch (error) {
                console.error('[App] Failed to process wallpaper:', error);
                uiManager.showNotification('Failed to upload wallpaper');
            }
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('[App] Failed to upload wallpaper:', error);
        uiManager.showNotification('Failed to upload wallpaper');
    }
}

// 处理壁纸删除
async function handleWallpaperDelete() {
    console.log('[App] Deleting wallpaper');
    
    try {
        await StorageManager.deleteWallpaper();
        
        // 设置为 Bing 壁纸
        settingsManager.settings.wallpaperSource = 'bing';
        await StorageManager.saveSettings(settingsManager.settings);
        
        wallpaperManager.loadWallpaper(settingsManager.settings);
        
        uiManager.showNotification('Wallpaper deleted');
        console.log('[App] Wallpaper deleted successfully');
    } catch (error) {
        console.error('[App] Failed to delete wallpaper:', error);
        uiManager.showNotification('Failed to delete wallpaper');
    }
}

// 监听壁纸刷新按钮
function setupWallpaperRefresh() {
    const refreshBtn = document.getElementById('wallpaper-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('[App] Refreshing wallpaper');
            wallpaperManager.loadWallpaper(settingsManager.settings);
        });
    }
}

// 监听窗口焦点，重新加载壁纸
window.addEventListener('focus', () => {
    if (wallpaperManager && wallpaperManager.settings && wallpaperManager.settings.wallpaperSource !== 'local') {
        console.log('[App] Window focused, refreshing wallpaper');
        wallpaperManager.loadWallpaper(wallpaperManager.settings);
    }
});

// 监听存储变化（其他标签页更新）
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        console.log('[App] Storage changed from another tab:', Object.keys(changes));
        
        // 如果搜索引擎更改，重新加载
        if (changes.searchEngines || changes.searchEngineIcons) {
            searchManager.populateSearchEngineDropdown();
        }
        
        // 如果应用更改，重新加载
        if (changes.apps) {
            shortcutManager.loadApps();
        }
        
        // 如果设置更改，重新加载
        if (changes.settings) {
            settingsManager.loadSettings();
        }
    }
});

// 在 DOM 完全加载后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
