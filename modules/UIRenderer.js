/**
 * UI 渲染模块 - 处理所有 UI 渲染相关的功能
 */

import dataManager from './DataManager.js';
import appManager from './AppManager.js';
import settingsManager from './SettingsManager.js';

class UIRenderer {
    constructor() {
        this.domElements = {};
        this.listeners = [];
    }

    /**
     * 初始化 DOM 元素引用
     */
    initializeDOMElements() {
        this.domElements = {
            body: document.getElementById('body'),
            grid: document.getElementById('grid'),
            sidebar: document.getElementById('sidebar'),
            searchInput: document.getElementById('search-input'),
            searchEngineSelector: document.querySelector('.search-engine-selector'),
            searchEngineDropdownMenu: document.getElementById('search-engine-dropdown-menu'),
            searchTypes: document.querySelectorAll('.search-type-btn'),
            searchBox: document.querySelector('.search-box'),
            searchEngineIcon: document.getElementById('search-engine-icon'),
            sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
            sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
            shortcutForm: document.getElementById('shortcut-form'),
            iconTypeRadios: document.querySelectorAll('input[name="icon-type"]'),
            wallpaperRefreshBtn: document.getElementById('wallpaper-refresh-btn'),
            addTab: document.getElementById('add-tab'),
            settingsTab: document.getElementById('settings-tab'),
            addPanel: document.getElementById('add-panel'),
            settingsPanel: document.getElementById('settings-panel'),
            pagination: document.getElementById('pagination'),
            maskOpacityInput: document.getElementById('mask-opacity'),
            wallpaperBlurInput: document.getElementById('wallpaper-blur')
        };
    }

    /**
     * 获取 DOM 元素
     */
    getElement(key) {
        return this.domElements[key];
    }

    /**
     * 获取所有 DOM 元素
     */
    getAllElements() {
        return this.domElements;
    }

    /**
     * 渲染网格
     */
    renderGrid() {
        const grid = this.domElements.grid;
        if (!grid) return;

        grid.innerHTML = '';
        const apps = appManager.getCurrentPageApps();
        const globalStartIndex = appManager.currentPage * appManager.pageSize;

        apps.forEach((app, pageIndex) => {
            const globalIndex = globalStartIndex + pageIndex;
            const appElement = this.createAppElement(app, globalIndex);
            grid.appendChild(appElement);
        });
    }

    /**
     * 创建应用元素
     */
    createAppElement(app, index) {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.draggable = true;
        div.dataset.appIndex = index;

        let iconHtml = '';
        if (app.iconType === 'image' || app.iconType === 'color') {
            if (app.image) {
                // 图片图标
                iconHtml = `<img src="${app.image}" alt="${app.name}" class="app-icon-image">`;
            } else if (app.color && app.text) {
                // 文本图标
                const settings = settingsManager.getAllSettings();
                iconHtml = `
                    <div class="app-icon" style="background-color: ${app.color}; border-radius: ${settings.iconRadius}%;">
                        <span class="icon-text">${app.text}</span>
                    </div>
                `;
            }
        }

        const settings = settingsManager.getAllSettings();
        const displayLabel = !settings.showIconLabel;

        div.innerHTML = `
            <div class="app-card" style="opacity: ${settings.iconOpacity / 100}; ${settings.iconAnimation ? 'animation: pulse 2s infinite;' : ''}">
                ${iconHtml}
                ${displayLabel ? `<div class="app-name">${app.name}</div>` : ''}
                <div class="app-actions" style="display: none;">
                    <button class="btn-edit" data-index="${index}">✏️</button>
                    <button class="btn-delete" data-index="${index}">🗑️</button>
                </div>
            </div>
        `;

        // 添加事件监听
        div.addEventListener('click', (e) => this.handleAppClick(e, index));
        div.addEventListener('contextmenu', (e) => this.handleAppContextMenu(e, index));
        div.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
        div.addEventListener('dragover', (e) => this.handleDragOver(e));
        div.addEventListener('drop', (e) => this.handleDrop(e, index));

        return div;
    }

    /**
     * 处理应用点击
     */
    handleAppClick(e, index) {
        const app = appManager.getApp(index);
        if (app && !appManager.isInEditMode()) {
            window.open(app.url, '_blank');
        }
    }

    /**
     * 处理应用右键菜单
     */
    handleAppContextMenu(e, index) {
        e.preventDefault();
        // 这里可以显示右键菜单
    }

    /**
     * 处理拖拽开始
     */
    handleDragStart(e, index) {
        appManager.setDraggedItem(appManager.getApp(index), index);
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * 处理拖拽悬停
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * 处理拖拽释放
     */
    handleDrop(e, targetIndex) {
        e.preventDefault();
        const { index: sourceIndex } = appManager.getDraggedItem();
        if (sourceIndex !== targetIndex) {
            appManager.swapApps(sourceIndex, targetIndex);
            this.renderGrid();
        }
        appManager.clearDraggedItem();
    }

    /**
     * 渲染分页
     */
    renderPagination() {
        const pagination = this.domElements.pagination;
        if (!pagination) return;

        pagination.innerHTML = '';
        const totalPages = appManager.getTotalPages();

        if (totalPages <= 1) return;

        for (let i = 0; i < totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${i === appManager.getCurrentPage() ? 'active' : ''}`;
            btn.textContent = i + 1;
            btn.addEventListener('click', () => {
                appManager.setCurrentPage(i);
                this.renderGrid();
                this.renderPagination();
            });
            pagination.appendChild(btn);
        }
    }

    /**
     * 应用设置到 DOM
     */
    applySettings() {
        const settings = settingsManager.getAllSettings();
        const body = this.domElements.body;

        if (body) {
            body.style.setProperty('--mask-opacity', settings.maskOpacity / 100);
            body.style.setProperty('--wallpaper-blur', (settings.wallpaperBlur || 0) + '%');
        }

        // 应用网格列数
        const grid = this.domElements.grid;
        if (grid) {
            grid.style.gridTemplateColumns = `repeat(${settings.gridCols}, 1fr)`;
        }

        // 应用搜索框设置
        const searchBox = this.domElements.searchBox;
        if (searchBox) {
            searchBox.style.width = settings.searchWidth + '%';
            searchBox.style.height = settings.searchHeight + 'px';
            searchBox.style.borderRadius = settings.searchRadius + 'px';
            searchBox.style.opacity = settings.searchOpacity / 100;
            searchBox.style.marginTop = settings.searchTopMargin + 'px';
            searchBox.style.display = settings.hideSearchBar ? 'none' : 'flex';
        }

        // 应用文字设置
        const style = document.createElement('style');
        style.textContent = `
            .app-name {
                font-size: ${settings.textSize}px;
                color: ${settings.textColor};
                text-shadow: ${settings.textShadow ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'};
            }
            .grid-item {
                opacity: ${settings.iconOpacity / 100};
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 显示提示信息
     */
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease-in-out;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    /**
     * 更新搜索引擎图标
     */
    updateSearchEngineIcon(iconData) {
        const icon = this.domElements.searchEngineIcon;
        if (!icon) return;

        icon.innerHTML = `
            <svg class="icon-svg" viewBox="1 1 22 22" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
                <circle cx="12" cy="12" r="11" fill="${iconData.color}"/>
                <text x="12" y="16" text-anchor="middle" font-size="14" font-weight="bold" font-family="Arial" fill="white">${iconData.text}</text>
            </svg>
        `;
    }

    /**
     * 注册事件监听器（用于卸载）
     */
    registerEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.listeners.push({ element, event, handler });
        }
    }

    /**
     * 移除所有事件监听器
     */
    removeAllEventListeners() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
    }

    /**
     * 清理 DOM
     */
    cleanup() {
        this.removeAllEventListeners();
        this.domElements = {};
    }
}

export default new UIRenderer();
