// ==================== 存储管理 ====================

export class StorageManager {
    // 保存快捷方式
    static saveApps(apps) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ apps }, resolve);
        });
    }

    // 保存设置
    static saveSettings(settings) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ settings }, resolve);
        });
    }

    // 保存壁纸
    static saveWallpaper(key, data) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: data }, resolve);
        });
    }

    // 保存自定义搜索引擎
    static saveCustomSearchEngines(engines, icons) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                customSearchEngines: engines,
                customEngineIcons: icons
            }, resolve);
        });
    }

    // 加载所有数据
    static loadAllData() {
        return new Promise((resolve) => {
            chrome.storage.local.get([
                'apps',
                'settings',
                'wallpaperData',
                'currentBingWallpaper',
                'currentGoogleWallpaper',
                'customSearchEngines',
                'customEngineIcons'
            ], (result) => {
                resolve(result);
            });
        });
    }

    // 删除壁纸
    static deleteWallpaper(key) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, resolve);
        });
    }

    // 清空所有数据（谨慎使用）
    static clearAll() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(resolve);
        });
    }
}

export default StorageManager;
