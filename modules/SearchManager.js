/**
 * 搜索管理模块 - 处理搜索引擎和搜索相关功能
 */

import dataManager from './DataManager.js';
import { SEARCH_ENGINES, SEARCH_ENGINE_ICONS_DATA, CONSTANTS } from './config.js';

class SearchManager {
    constructor() {
        this.currentSearchEngine = 'google';
        this.currentSearchType = 'web';
        this.customSearchEngines = {};
        this.customEngineIcons = {};
    }

    /**
     * 初始化搜索引擎
     */
    initialize() {
        const settings = dataManager.getSettings();
        this.currentSearchEngine = settings.currentSearchEngine || 'google';

        const storageData = dataManager.getAllStorageData();
        this.customSearchEngines = storageData[CONSTANTS.STORAGE_KEYS.CUSTOM_SEARCH_ENGINES] || {};
        this.customEngineIcons = storageData[CONSTANTS.STORAGE_KEYS.CUSTOM_ENGINE_ICONS] || {};
    }

    /**
     * 设置当前搜索引擎
     */
    setSearchEngine(engine) {
        this.currentSearchEngine = engine;
        return dataManager.updateSetting('currentSearchEngine', engine);
    }

    /**
     * 获取当前搜索引擎
     */
    getSearchEngine() {
        return this.currentSearchEngine;
    }

    /**
     * 设置当前搜索类型
     */
    setSearchType(type) {
        this.currentSearchType = type;
    }

    /**
     * 获取当前搜索类型
     */
    getSearchType() {
        return this.currentSearchType;
    }

    /**
     * 获取搜索URL
     */
    getSearchUrl(query) {
        const type = this.currentSearchType;
        const engine = this.currentSearchEngine;

        const searchUrlTemplates = { ...SEARCH_ENGINES, ...this.customSearchEngines };
        if (searchUrlTemplates[engine] && searchUrlTemplates[engine][type]) {
            return searchUrlTemplates[engine][type].replace('{query}', encodeURIComponent(query));
        }

        return null;
    }

    /**
     * 执行搜索
     */
    search(query) {
        if (!query.trim()) return;
        const url = this.getSearchUrl(query);
        if (url) {
            window.open(url, '_blank');
        }
    }

    /**
     * 获取搜索引擎图标数据
     */
    getEngineIconData(engine) {
        return SEARCH_ENGINE_ICONS_DATA[engine] || { color: '#999', text: '?' };
    }

    /**
     * 获取自定义搜索引擎图标
     */
    getCustomEngineIcon(engine) {
        return this.customEngineIcons[engine] || null;
    }

    /**
     * 添加自定义搜索引擎
     */
    addCustomSearchEngine(engineName, searchUrlTemplate, icon) {
        this.customSearchEngines[engineName] = searchUrlTemplate;
        if (icon) {
            this.customEngineIcons[engineName] = icon;
        }

        return Promise.all([
            chrome.storage.local.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_SEARCH_ENGINES]: this.customSearchEngines }),
            chrome.storage.local.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_ENGINE_ICONS]: this.customEngineIcons })
        ]);
    }

    /**
     * 删除自定义搜索引擎
     */
    deleteCustomSearchEngine(engineName) {
        delete this.customSearchEngines[engineName];
        delete this.customEngineIcons[engineName];

        return Promise.all([
            chrome.storage.local.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_SEARCH_ENGINES]: this.customSearchEngines }),
            chrome.storage.local.set({ [CONSTANTS.STORAGE_KEYS.CUSTOM_ENGINE_ICONS]: this.customEngineIcons })
        ]);
    }

    /**
     * 获取所有搜索引擎
     */
    getAllSearchEngines() {
        return {
            ...SEARCH_ENGINES,
            ...this.customSearchEngines
        };
    }

    /**
     * 获取所有搜索类型
     */
    getSearchTypes() {
        const defaultSearchTypes = ['web', 'images', 'news', 'video', 'maps'];
        const currentEngines = { ...SEARCH_ENGINES, ...this.customSearchEngines };

        if (currentEngines[this.currentSearchEngine]) {
            return Object.keys(currentEngines[this.currentSearchEngine]);
        }

        return defaultSearchTypes;
    }

    /**
     * 是否是自定义搜索引擎
     */
    isCustomEngine(engine) {
        return engine in this.customSearchEngines;
    }

    /**
     * 是否可以删除搜索引擎（自定义引擎可以删除）
     */
    canDeleteEngine(engine) {
        return this.isCustomEngine(engine);
    }
}

export default new SearchManager();
