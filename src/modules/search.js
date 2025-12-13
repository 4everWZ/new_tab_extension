// ==================== 搜索功能模块 ====================

import { searchEngineIcons, searchEngines, searchEngineIconsData } from '../utils/constants.js';
import { getFaviconUrl, formatSearchEngineUrl } from '../utils/helpers.js';
import { convertImageToDataUrl } from '../utils/image.js';
import StorageManager from './storage.js';

export class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchEngineSelect = document.getElementById('search-engine');
        this.addSearchEngineBtn = document.getElementById('add-search-engine-btn');
        this.searchEngineModal = document.getElementById('search-engine-modal');
        this.searchEngineIconInput = document.getElementById('search-engine-icon-input');
        this.searchEngineIconSelect = document.getElementById('search-engine-icon-select');
        this.searchEngineNameInput = document.getElementById('search-engine-name-input');
        this.searchEngineUrlInput = document.getElementById('search-engine-url-input');
        
        this.currentSearchEngine = 'google';
        this.searchEngines = { ...searchEngines };
        this.searchEngineIcons = { ...searchEngineIcons };
        this.searchEngineIconsData = { ...searchEngineIconsData };
    }

    // 初始化搜索引擎下拉菜单
    async setupSearch() {
        console.log('[Search] Setting up search engines...');
        
        // 加载自定义搜索引擎
        const result = await StorageManager.loadAllData();
        if (result.searchEngines) {
            this.searchEngines = { ...this.searchEngines, ...result.searchEngines };
            console.log('[Search] Loaded custom search engines:', Object.keys(result.searchEngines));
        }
        if (result.searchEngineIconsData) {
            this.searchEngineIconsData = { ...this.searchEngineIconsData, ...result.searchEngineIconsData };
        }
        if (result.searchEngineIcons) {
            this.searchEngineIcons = { ...this.searchEngineIcons, ...result.searchEngineIcons };
        }
        
        // 恢复下拉菜单选项
        this.populateSearchEngineDropdown();
        
        // 绑定搜索事件
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        this.searchEngineSelect.addEventListener('change', (e) => {
            this.currentSearchEngine = e.target.value;
            this.updateSearchEngineIcon();
        });
        
        this.addSearchEngineBtn.addEventListener('click', () => this.showAddSearchEngineModal());
    }

    // 填充搜索引擎下拉菜单
    populateSearchEngineDropdown() {
        this.searchEngineSelect.innerHTML = '';
        
        // 内置搜索引擎
        for (const [key, name] of Object.entries(this.searchEngines)) {
            if (['google', 'bing', 'baidu'].includes(key)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = name;
                this.searchEngineSelect.appendChild(option);
            }
        }
        
        // 自定义搜索引擎
        for (const [key, name] of Object.entries(this.searchEngines)) {
            if (!['google', 'bing', 'baidu'].includes(key)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = name;
                this.searchEngineSelect.appendChild(option);
            }
        }
        
        this.searchEngineSelect.value = this.currentSearchEngine;
    }

    // 更新搜索引擎图标
    updateSearchEngineIcon() {
        const icon = document.getElementById('search-engine-icon');
        const engine = this.currentSearchEngine;
        
        if (this.searchEngineIconsData[engine]) {
            icon.innerHTML = `<img src="${this.searchEngineIconsData[engine]}" alt="${this.searchEngines[engine]}">`;
        } else if (this.searchEngineIcons[engine]) {
            icon.innerHTML = this.searchEngineIcons[engine];
        } else {
            // 获取 favicon 并缓存
            this.cacheFaviconForEngine(engine);
        }
    }

    // 为搜索引擎缓存 favicon
    async cacheFaviconForEngine(engine) {
        const engineUrl = Object.values(this.searchEngines).find(e => e === engine) ? engine : null;
        if (!engineUrl) return;
        
        try {
            const url = this.getEngineBaseUrl(engine);
            const faviconUrl = getFaviconUrl(url);
            
            // 尝试转换为 data URL
            const dataUrl = await convertImageToDataUrl(faviconUrl);
            this.searchEngineIconsData[engine] = dataUrl;
            
            // 保存到存储
            StorageManager.loadAllData().then(result => {
                result.searchEngineIconsData = result.searchEngineIconsData || {};
                result.searchEngineIconsData[engine] = dataUrl;
                chrome.storage.local.set({ searchEngineIconsData: result.searchEngineIconsData });
            });
            
            this.updateSearchEngineIcon();
        } catch (error) {
            console.log('[Search] Failed to cache favicon for', engine, error);
        }
    }

    // 获取搜索引擎基础 URL
    getEngineBaseUrl(engine) {
        const engines = {
            google: 'https://www.google.com',
            bing: 'https://www.bing.com',
            baidu: 'https://www.baidu.com'
        };
        return engines[engine] || engine;
    }

    // 执行搜索
    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        
        const engineUrl = this.searchEngines[this.currentSearchEngine];
        if (!engineUrl) {
            console.error('[Search] Invalid search engine:', this.currentSearchEngine);
            return;
        }
        
        const searchUrl = formatSearchEngineUrl(engineUrl, query);
        window.open(searchUrl, '_blank');
        console.log('[Search] Opened search URL:', searchUrl);
    }

    // 显示添加搜索引擎模态框
    showAddSearchEngineModal() {
        this.searchEngineNameInput.value = '';
        this.searchEngineUrlInput.value = '';
        this.searchEngineIconInput.value = '';
        this.searchEngineIconSelect.value = 'text';
        this.searchEngineModal.classList.add('show');
        
        // 绑定保存事件（如果还没绑定）
        if (!this.searchEngineModal.dataset.setupDone) {
            this.setupAddSearchEngineForm();
            this.searchEngineModal.dataset.setupDone = 'true';
        }
    }

    // 设置添加搜索引擎表单
    setupAddSearchEngineForm() {
        const saveBtn = document.getElementById('search-engine-save-btn');
        const cancelBtn = document.getElementById('search-engine-cancel-btn');
        
        saveBtn.addEventListener('click', () => this.saveNewSearchEngine());
        cancelBtn.addEventListener('click', () => this.closeSearchEngineModal());
        
        this.searchEngineIconSelect.addEventListener('change', (e) => {
            if (e.target.value === 'upload') {
                this.searchEngineIconInput.click();
            }
        });
        
        this.searchEngineIconInput.addEventListener('change', (e) => {
            this.handleSearchEngineIconUpload(e);
        });
    }

    // 处理搜索引擎图标上传
    async handleSearchEngineIconUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const dataUrl = event.target.result;
                this.searchEngineIconSelect.value = 'uploaded';
                this.searchEngineIconSelect.dataset.uploadedDataUrl = dataUrl;
                console.log('[Search] Icon uploaded successfully');
            } catch (error) {
                console.error('[Search] Failed to upload icon:', error);
            }
        };
        reader.readAsDataURL(file);
    }

    // 保存新的搜索引擎
    async saveNewSearchEngine() {
        const name = this.searchEngineNameInput.value.trim();
        const url = this.searchEngineUrlInput.value.trim();
        const iconSelect = this.searchEngineIconSelect.value;
        
        if (!name || !url) {
            alert('Please enter engine name and URL');
            return;
        }
        
        // 生成唯一的 key
        const key = `custom_${Date.now()}`;
        
        // 保存搜索引擎
        this.searchEngines[key] = url;
        
        // 处理图标
        if (iconSelect === 'text') {
            // 使用文本图标
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const text = name.substring(0, 1).toUpperCase();
            this.searchEngineIcons[key] = `<span class="text-icon" style="background-color: ${color};">${text}</span>`;
        } else if (iconSelect === 'uploaded' && this.searchEngineIconSelect.dataset.uploadedDataUrl) {
            this.searchEngineIconsData[key] = this.searchEngineIconSelect.dataset.uploadedDataUrl;
        }
        
        // 保存到存储
        const result = await StorageManager.loadAllData();
        result.searchEngines = result.searchEngines || {};
        result.searchEngines[key] = url;
        result.searchEngineIcons = result.searchEngineIcons || {};
        result.searchEngineIcons[key] = this.searchEngineIcons[key];
        result.searchEngineIconsData = result.searchEngineIconsData || {};
        if (this.searchEngineIconsData[key]) {
            result.searchEngineIconsData[key] = this.searchEngineIconsData[key];
        }
        
        await StorageManager.saveCustomSearchEngines(result.searchEngines, result.searchEngineIcons, result.searchEngineIconsData);
        
        console.log('[Search] Added new search engine:', key);
        
        // 更新下拉菜单
        this.populateSearchEngineDropdown();
        this.closeSearchEngineModal();
    }

    // 删除搜索引擎（仅限自定义）
    async deleteSearchEngine(key) {
        if (['google', 'bing', 'baidu'].includes(key)) {
            console.warn('[Search] Cannot delete built-in search engines');
            return;
        }
        
        delete this.searchEngines[key];
        delete this.searchEngineIcons[key];
        delete this.searchEngineIconsData[key];
        
        // 保存到存储
        const result = await StorageManager.loadAllData();
        result.searchEngines = { ...result.searchEngines };
        delete result.searchEngines[key];
        
        await StorageManager.saveCustomSearchEngines(result.searchEngines, result.searchEngineIcons, result.searchEngineIconsData);
        
        console.log('[Search] Deleted search engine:', key);
        
        // 如果删除的是当前引擎，切换到 Google
        if (this.currentSearchEngine === key) {
            this.currentSearchEngine = 'google';
            this.searchEngineSelect.value = 'google';
            this.updateSearchEngineIcon();
        }
        
        this.populateSearchEngineDropdown();
    }

    // 关闭搜索引擎模态框
    closeSearchEngineModal() {
        this.searchEngineModal.classList.remove('show');
    }
}

export default SearchManager;
