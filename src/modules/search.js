// ==================== 搜索功能模块 ====================

import { searchEngineIcons, searchEngines, searchEngineIconsData } from '../utils/constants.js';
import { getFaviconUrl, formatSearchEngineUrl } from '../utils/helpers.js';
import { convertImageToDataUrl } from '../utils/image.js';
import StorageManager from './storage.js';

export class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchEngineIcon = document.getElementById('search-engine-icon');
        this.searchEngineDropdownMenu = document.getElementById('search-engine-dropdown-menu');
        this.dropdownOptions = this.searchEngineDropdownMenu?.querySelector('.dropdown-options');
        this.dropdownAdd = this.searchEngineDropdownMenu?.querySelector('.dropdown-add');
        
        this.currentSearchEngine = 'google';
        this.searchEngines = { ...searchEngines };
        this.searchEngineIcons = { ...searchEngineIcons };
        this.searchEngineIconsData = { ...searchEngineIconsData };
    }

    // 初始化搜索功能
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
        
        // 初始化下拉菜单
        this.setupSearchEngineDropdown();
        
        // 绑定搜索事件
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }
        
        // 初始化图标
        this.updateSearchEngineIcon();
        
        console.log('[Search] Search setup completed');
    }

    // 设置搜索引擎下拉菜单
    setupSearchEngineDropdown() {
        if (!this.searchEngineDropdownMenu || !this.dropdownOptions) {
            console.warn('[Search] Search engine dropdown not found');
            return;
        }
        
        // 清空现有选项
        this.dropdownOptions.innerHTML = '';
        
        // 添加内置搜索引擎
        ['google', 'bing', 'baidu'].forEach(key => {
            if (this.searchEngines[key]) {
                this.addSearchEngineOption(key, this.searchEngines[key]);
            }
        });
        
        // 添加自定义搜索引擎
        for (const [key, url] of Object.entries(this.searchEngines)) {
            if (!['google', 'bing', 'baidu'].includes(key)) {
                this.addSearchEngineOption(key, url);
            }
        }
        
        // 设置下拉菜单切换
        const toggle = document.querySelector('.search-engine-dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                this.searchEngineDropdownMenu.classList.toggle('active');
            });
        }
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box-wrapper')) {
                this.searchEngineDropdownMenu?.classList.remove('active');
            }
        });
        
        // 绑定"添加搜索引擎"点击事件
        if (this.dropdownAdd) {
            this.dropdownAdd.addEventListener('click', () => {
                this.showAddSearchEngineDialog();
            });
        }
    }

    // 添加搜索引擎选项到下拉菜单
    addSearchEngineOption(key, url) {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.engine = key;
        
        // 生成图标HTML
        let iconHtml = '<svg class="dropdown-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="#cccccc"/><text x="12" y="16" text-anchor="middle" font-size="14" font-weight="bold" fill="white">?</text></svg>';
        
        if (this.searchEngineIconsData[key]) {
            iconHtml = `<img src="${this.searchEngineIconsData[key]}" alt="${key}" class="dropdown-icon">`;
        } else if (this.searchEngineIcons[key]) {
            iconHtml = this.searchEngineIcons[key];
        }
        
        const nameText = this.formatEngineName(key);
        const deleteBtn = !['google', 'bing', 'baidu'].includes(key) ? `<button class="delete-engine-btn" title="Delete" style="display:none;">×</button>` : '';
        
        option.innerHTML = `${iconHtml}<span>${nameText}</span>${deleteBtn}`;
        
        // 添加选择事件
        option.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-engine-btn')) {
                this.deleteSearchEngine(key);
            } else {
                this.selectSearchEngine(key);
            }
        });
        
        // 删除按钮悬停显示
        option.addEventListener('mouseenter', () => {
            const deleteBtn = option.querySelector('.delete-engine-btn');
            if (deleteBtn && !['google', 'bing', 'baidu'].includes(key)) {
                deleteBtn.style.display = 'block';
            }
        });
        
        option.addEventListener('mouseleave', () => {
            const deleteBtn = option.querySelector('.delete-engine-btn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
        });
        
        this.dropdownOptions?.appendChild(option);
    }

    // 格式化引擎名称
    formatEngineName(key) {
        const names = {
            'google': 'Google',
            'bing': 'Bing',
            'baidu': 'Baidu'
        };
        return names[key] || key.replace(/^custom_/, 'Custom - ').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // 选择搜索引擎
    selectSearchEngine(key) {
        this.currentSearchEngine = key;
        this.updateSearchEngineIcon();
        this.searchEngineDropdownMenu?.classList.remove('active');
        
        // 更新下拉菜单中的选中状态
        this.dropdownOptions?.querySelectorAll('.dropdown-option').forEach(option => {
            option.classList.remove('active');
        });
        this.dropdownOptions?.querySelector(`[data-engine="${key}"]`)?.classList.add('active');
        
        console.log('[Search] Selected search engine:', key);
    }

    // 更新搜索引擎图标
    updateSearchEngineIcon() {
        if (!this.searchEngineIcon) return;
        
        const engine = this.currentSearchEngine;
        
        if (this.searchEngineIconsData[engine]) {
            this.searchEngineIcon.innerHTML = `<img src="${this.searchEngineIconsData[engine]}" alt="${engine}" style="width: 24px; height: 24px;">`;
        } else if (this.searchEngineIcons[engine]) {
            this.searchEngineIcon.innerHTML = this.searchEngineIcons[engine];
        } else {
            // 默认图标
            this.searchEngineIcon.innerHTML = '<svg class="icon-svg" viewBox="1 1 22 22" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><circle cx="12" cy="12" r="11" fill="#cccccc"/><text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="bold" fill="white">?</text></svg>';
        }
    }

    // 执行搜索
    performSearch() {
        if (!this.searchInput) {
            console.warn('[Search] Search input not found');
            return;
        }
        
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

    // 显示添加搜索引擎对话框
    showAddSearchEngineDialog() {
        const name = prompt('Search engine name:');
        if (!name) return;
        
        const url = prompt('Search URL (use {query} as placeholder):\nExample: https://www.google.com/search?q={query}');
        if (!url || !url.includes('{query}')) {
            alert('URL must contain {query} placeholder');
            return;
        }
        
        this.saveNewSearchEngine(name, url);
    }

    // 保存新的搜索引擎
    async saveNewSearchEngine(name, url) {
        // 生成唯一的 key
        const key = `custom_${Date.now()}`;
        
        // 保存搜索引擎
        this.searchEngines[key] = url;
        
        // 生成随机文本图标
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const text = name.substring(0, 1).toUpperCase();
        this.searchEngineIcons[key] = `<span class="text-icon" style="background-color: ${color};">${text}</span>`;
        
        // 保存到存储
        const result = await StorageManager.loadAllData();
        result.searchEngines = result.searchEngines || {};
        result.searchEngines[key] = url;
        result.searchEngineIcons = result.searchEngineIcons || {};
        result.searchEngineIcons[key] = this.searchEngineIcons[key];
        
        await StorageManager.saveCustomSearchEngines(result.searchEngines, result.searchEngineIcons, result.searchEngineIconsData);
        
        console.log('[Search] Added new search engine:', key, name);
        
        // 重新生成下拉菜单
        this.setupSearchEngineDropdown();
    }

    // 删除搜索引擎（仅限自定义）
    async deleteSearchEngine(key) {
        if (['google', 'bing', 'baidu'].includes(key)) {
            console.warn('[Search] Cannot delete built-in search engines');
            return;
        }
        
        if (!confirm('Delete this search engine?')) return;
        
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
            this.updateSearchEngineIcon();
        }
        
        // 重新生成下拉菜单
        this.setupSearchEngineDropdown();
    }
}

export default SearchManager;
