/**
 * 数据管理模块 - 处理所有数据存储和读取操作
 */

import { DEFAULT_APPS, DEFAULT_SETTINGS, CONSTANTS } from './config.js';

class DataManager {
    constructor() {
        this.allApps = [];
        this.settings = { ...DEFAULT_SETTINGS };
        this.storageData = {};
        this.callbacks = {
            onDataChanged: null,
            onSettingsChanged: null
        };
    }

    /**
     * 加载所有数据
     */
    loadData() {
        return new Promise((resolve) => {
            const storageKeys = Object.values(CONSTANTS.STORAGE_KEYS);
            chrome.storage.local.get(storageKeys, (result) => {
                this.storageData = result;

                // 加载应用列表
                if (result.apps && result.apps.length > 0) {
                    this.allApps = result.apps;
                } else {
                    this.allApps = [...DEFAULT_APPS];
                }

                // 加载设置
                if (result.settings) {
                    this.settings = { ...DEFAULT_SETTINGS, ...result.settings };
                } else {
                    this.settings = { ...DEFAULT_SETTINGS };
                }

                resolve({
                    apps: this.allApps,
                    settings: this.settings,
                    storage: result
                });
            });
        });
    }

    /**
     * 保存应用到存储
     */
    saveApps() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ apps: this.allApps }, () => {
                if (this.callbacks.onDataChanged) {
                    this.callbacks.onDataChanged(this.allApps);
                }
                resolve();
            });
        });
    }

    /**
     * 保存设置到存储
     */
    saveSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ settings: this.settings }, () => {
                if (this.callbacks.onSettingsChanged) {
                    this.callbacks.onSettingsChanged(this.settings);
                }
                resolve();
            });
        });
    }

    /**
     * 添加应用
     */
    addApp(app) {
        this.allApps.push(app);
        return this.saveApps();
    }

    /**
     * 更新应用
     */
    updateApp(index, app) {
        if (index >= 0 && index < this.allApps.length) {
            this.allApps[index] = app;
            return this.saveApps();
        }
        return Promise.reject('Invalid app index');
    }

    /**
     * 删除应用
     */
    deleteApp(index) {
        if (index >= 0 && index < this.allApps.length) {
            this.allApps.splice(index, 1);
            return this.saveApps();
        }
        return Promise.reject('Invalid app index');
    }

    /**
     * 获取所有应用
     */
    getApps() {
        return this.allApps;
    }

    /**
     * 获取指定应用
     */
    getApp(index) {
        return this.allApps[index];
    }

    /**
     * 更新单个设置
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        return this.saveSettings();
    }

    /**
     * 批量更新设置
     */
    updateSettings(updates) {
        this.settings = { ...this.settings, ...updates };
        return this.saveSettings();
    }

    /**
     * 获取所有设置
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 获取单个设置
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * 保存壁纸数据
     */
    saveWallpaperData(key, data) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: data }, () => {
                this.storageData[key] = data;
                resolve();
            });
        });
    }

    /**
     * 获取存储数据
     */
    getStorageData(key) {
        return this.storageData[key];
    }

    /**
     * 获取所有存储数据
     */
    getAllStorageData() {
        return { ...this.storageData };
    }

    /**
     * 注册数据变更回调
     */
    onDataChanged(callback) {
        this.callbacks.onDataChanged = callback;
    }

    /**
     * 注册设置变更回调
     */
    onSettingsChanged(callback) {
        this.callbacks.onSettingsChanged = callback;
    }
}

export default new DataManager();
