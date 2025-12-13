/**
 * 重构后的主脚本 - 使用模块化架构
 * 管理应用初始化和事件处理
 */

import dataManager from './modules/DataManager.js';
import appManager from './modules/AppManager.js';
import searchManager from './modules/SearchManager.js';
import settingsManager from './modules/SettingsManager.js';
import wallpaperManager from './modules/WallpaperManager.js';
import uiRenderer from './modules/UIRenderer.js';
import eventBus, { EVENTS } from './modules/EventBus.js';
import { 
    getFaviconUrl, 
    extractDomainFromUrl, 
    isValidUrl, 
    addProtocolToUrl,
    debounce 
} from './modules/utils.js';
import { PAGE_SIZE } from './modules/config.js';

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 初始化 DOM 元素
        uiRenderer.initializeDOMElements();

        // 2. 加载数据
        const { apps, settings, storage } = await dataManager.loadData();
        
        // 3. 初始化各个管理器
        searchManager.initialize();
        appManager.setPageSize(PAGE_SIZE);

        // 4. 设置数据管理器回调
        dataManager.onDataChanged(() => {
            uiRenderer.renderGrid();
            uiRenderer.renderPagination();
            eventBus.emit(EVENTS.APPS_CHANGED, dataManager.getApps());
        });

        dataManager.onSettingsChanged(() => {
            uiRenderer.applySettings();
            eventBus.emit(EVENTS.SETTINGS_CHANGED, dataManager.getSettings());
        });

        // 5. 初始化 UI
        setupUI();
        setupSearch();
        setupSidebar();
        setupModal();
        setupSettings();

        // 6. 应用设置
        uiRenderer.applySettings();

        // 7. 渲染页面
        uiRenderer.renderGrid();
        uiRenderer.renderPagination();

        // 8. 加载壁纸
        wallpaperManager.loadWallpaper();

        // 9. 发送就绪事件
        eventBus.emit(EVENTS.READY);

        console.log('[App] Application initialized successfully');
    } catch (error) {
        console.error('[App] Initialization error:', error);
        eventBus.emit(EVENTS.ERROR, error);
    }
});

// ==================== UI 设置 ====================

function setupUI() {
    const elements = uiRenderer.getAllElements();

    // 壁纸刷新按钮
    if (elements.wallpaperRefreshBtn) {
        elements.wallpaperRefreshBtn.addEventListener('click', () => {
            wallpaperManager.refreshWallpaper();
        });
    }

    // 侧边栏切换
    if (elements.sidebarToggleBtn) {
        elements.sidebarToggleBtn.addEventListener('click', () => {
            const sidebar = elements.sidebar;
            sidebar.classList.toggle('active');
            eventBus.emit(EVENTS.SIDEBAR_OPENED);
        });
    }

    if (elements.sidebarCloseBtn) {
        elements.sidebarCloseBtn.addEventListener('click', () => {
            const sidebar = elements.sidebar;
            sidebar.classList.remove('active');
            eventBus.emit(EVENTS.SIDEBAR_CLOSED);
        });
    }

    // 点击外部关闭侧边栏
    document.addEventListener('click', (e) => {
        const sidebar = elements.sidebar;
        const sidebarToggle = elements.sidebarToggleBtn;
        
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

// ==================== 搜索设置 ====================

function setupSearch() {
    const elements = uiRenderer.getAllElements();

    // 搜索引擎图标
    updateSearchEngineIcon();

    // 搜索引擎选择器
    if (elements.searchEngineSelector) {
        elements.searchEngineSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = elements.searchEngineDropdownMenu;
            menu.classList.toggle('active');
        });
    }

    // 搜索引擎选项
    document.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-engine-btn')) {
                const engine = option.dataset.engine;
                if (searchManager.canDeleteEngine(engine)) {
                    searchManager.deleteCustomSearchEngine(engine);
                    location.reload();
                }
                return;
            }

            const engine = option.dataset.engine;
            searchManager.setSearchEngine(engine).then(() => {
                updateSearchEngineIcon();
                document.querySelectorAll('.dropdown-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                elements.searchEngineDropdownMenu.classList.remove('active');
                eventBus.emit(EVENTS.SEARCH_ENGINE_CHANGED, engine);
            });
        });
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-engine-selector')) {
            elements.searchEngineDropdownMenu.classList.remove('active');
        }
    });

    // 搜索类型选项卡
    if (elements.searchTypes) {
        elements.searchTypes.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.searchTypes.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const type = btn.dataset.type;
                searchManager.setSearchType(type);
                eventBus.emit(EVENTS.SEARCH_TYPE_CHANGED, type);
            });
        });
    }

    // 搜索输入
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = elements.searchInput.value;
                if (query.trim()) {
                    searchManager.search(query);
                }
            }
        });
    }

    // 添加搜索引擎功能
    const dropdownAdd = document.querySelector('.dropdown-add');
    if (dropdownAdd) {
        dropdownAdd.addEventListener('click', () => {
            const engineName = prompt('输入搜索引擎名称:');
            if (!engineName) return;

            const searchUrlTemplate = prompt('输入搜索URL模板 (用 {query} 表示查询词):\n例如: https://example.com/search?q={query}');
            if (!searchUrlTemplate || !searchUrlTemplate.includes('{query}')) {
                alert('URL 必须包含 {query}');
                return;
            }

            searchManager.addCustomSearchEngine(engineName, searchUrlTemplate).then(() => {
                location.reload();
            });
        });
    }
}

function updateSearchEngineIcon() {
    const engine = searchManager.getSearchEngine();
    const iconData = searchManager.getEngineIconData(engine);
    uiRenderer.updateSearchEngineIcon(iconData);
}

// ==================== 侧边栏设置 ====================

function setupSidebar() {
    const elements = uiRenderer.getAllElements();

    if (elements.addTab) {
        elements.addTab.addEventListener('click', () => {
            switchTab('add');
        });
    }

    if (elements.settingsTab) {
        elements.settingsTab.addEventListener('click', () => {
            switchTab('settings');
        });
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-panel`).classList.add('active');
}

// ==================== 快捷方式 Modal 设置 ====================

function setupModal() {
    const urlInput = document.getElementById('app-url');
    const parseUrlBtn = document.getElementById('parse-url-btn');
    const elements = uiRenderer.getAllElements();

    // 自动解析URL
    if (urlInput) {
        urlInput.addEventListener('blur', () => {
            const url = urlInput.value.trim();
            if (url && parseUrlBtn) {
                parseUrlBtn.click();
            }
        });
    }

    if (parseUrlBtn) {
        parseUrlBtn.addEventListener('click', (e) => {
            e.preventDefault();
            parseUrl();
        });
    }

    // 切换 icon 类型
    if (elements.iconTypeRadios) {
        elements.iconTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const textOptions = document.getElementById('text-icon-options');
                const uploadOptions = document.getElementById('upload-icon-options');

                if (e.target.value === 'text') {
                    textOptions.classList.remove('hidden');
                    uploadOptions.classList.add('hidden');
                } else {
                    textOptions.classList.add('hidden');
                    uploadOptions.classList.remove('hidden');
                }
            });
        });
    }

    // 图片上传预览
    const appImageInput = document.getElementById('app-image');
    if (appImageInput) {
        appImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = document.getElementById('image-preview');
                    preview.style.backgroundImage = `url(${event.target.result})`;
                    preview.classList.add('show');
                    preview.dataset.imageData = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 表单提交
    if (elements.shortcutForm) {
        elements.shortcutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewShortcut();
        });

        // 重置表单
        elements.shortcutForm.addEventListener('reset', () => {
            setTimeout(() => {
                const preview = document.getElementById('image-preview');
                if (preview) {
                    preview.classList.remove('show');
                    preview.style.backgroundImage = '';
                }
            }, 0);
        });
    }
}

function parseUrl() {
    const urlInput = document.getElementById('app-url');
    const parseUrlBtn = document.getElementById('parse-url-btn');
    const url = urlInput.value.trim();

    if (!url) {
        alert('请输入有效的URL');
        return;
    }

    try {
        const urlObj = new URL(isValidUrl(url) ? url : addProtocolToUrl(url));
        const nameInput = document.getElementById('app-name');

        if (!nameInput.value.trim()) {
            const domainName = extractDomainFromUrl(url);
            nameInput.value = domainName.charAt(0).toUpperCase() + domainName.slice(1);
        }

        parseUrlBtn.disabled = true;
        parseUrlBtn.textContent = '加载中...';

        const faviconUrls = getFaviconUrl(url);
        if (faviconUrls.length === 0) {
            parseUrlBtn.disabled = false;
            parseUrlBtn.textContent = '解析';
            return;
        }

        // 切换到图片icon模式
        document.querySelector('input[name="icon-type"][value="upload"]').checked = true;
        document.getElementById('text-icon-options').classList.add('hidden');
        document.getElementById('upload-icon-options').classList.remove('hidden');

        let currentIndex = 0;

        function tryLoadFavicon() {
            if (currentIndex >= faviconUrls.length) {
                parseUrlBtn.disabled = false;
                parseUrlBtn.textContent = '解析';
                alert('无法获取网站图标，请手动上传');
                return;
            }

            const faviconUrl = faviconUrls[currentIndex];
            currentIndex++;

            const img = new Image();
            let loaded = false;

            img.onload = () => {
                if (!loaded) {
                    loaded = true;
                    const preview = document.getElementById('image-preview');
                    preview.style.backgroundImage = `url(${faviconUrl})`;
                    preview.classList.add('show');
                    preview.dataset.imageData = faviconUrl;

                    parseUrlBtn.disabled = false;
                    parseUrlBtn.textContent = '解析';
                }
            };

            img.onerror = () => {
                if (!loaded) {
                    loaded = true;
                    setTimeout(tryLoadFavicon, 100);
                }
            };

            img.src = faviconUrl;

            setTimeout(() => {
                if (!loaded) {
                    loaded = true;
                    img.src = '';
                    tryLoadFavicon();
                }
            }, 3000);
        }

        tryLoadFavicon();
    } catch (error) {
        alert('请输入有效的URL (例: https://example.com)');
    }
}

function addNewShortcut() {
    const nameInput = document.getElementById('app-name');
    const urlInput = document.getElementById('app-url');
    const iconTypeRadio = document.querySelector('input[name="icon-type"]:checked');

    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const iconType = iconTypeRadio ? iconTypeRadio.value : 'text';

    if (!name || !url) {
        alert('请填写所有必填项');
        return;
    }

    const newApp = { name, url };

    if (iconType === 'text') {
        newApp.text = document.getElementById('app-text').value.trim() || name[0];
        newApp.color = document.getElementById('app-color').value;
        newApp.iconType = 'text';
        appManager.addApp(newApp);
    } else {
        const preview = document.getElementById('image-preview');

        if (preview.dataset.imageData) {
            newApp.image = preview.dataset.imageData;
            newApp.iconType = 'image';
            appManager.addApp(newApp);
        } else {
            // 尝试加载favicon
            const faviconUrls = getFaviconUrl(url);
            if (faviconUrls.length > 0) {
                loadFaviconAndAddApp(newApp, faviconUrls);
                return;
            } else {
                // 使用默认文本icon
                newApp.text = name[0];
                newApp.color = '#0066cc';
                newApp.iconType = 'text';
                appManager.addApp(newApp);
            }
        }
    }

    // 重置表单
    const shortcutForm = document.getElementById('shortcut-form');
    if (shortcutForm) {
        shortcutForm.reset();
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.classList.remove('show');
        }
    }
}

function loadFaviconAndAddApp(app, faviconUrls, index = 0) {
    if (index >= faviconUrls.length) {
        app.text = app.name[0];
        app.color = '#0066cc';
        app.iconType = 'text';
        appManager.addApp(app);
        return;
    }

    const img = new Image();
    let loaded = false;

    img.onload = () => {
        if (!loaded) {
            loaded = true;
            app.image = faviconUrls[index];
            app.iconType = 'image';
            appManager.addApp(app);
        }
    };

    img.onerror = () => {
        if (!loaded) {
            loaded = true;
            loadFaviconAndAddApp(app, faviconUrls, index + 1);
        }
    };

    img.src = faviconUrls[index];

    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            loadFaviconAndAddApp(app, faviconUrls, index + 1);
        }
    }, 2000);
}

// ==================== 设置 Modal 设置 ====================

function setupSettings() {
    // 初始化设置 UI 值
    initializeSettingsUI();

    // 壁纸源变更
    const wallpaperSourceSelect = document.getElementById('wallpaper-source');
    if (wallpaperSourceSelect) {
        wallpaperSourceSelect.addEventListener('change', (e) => {
            const source = e.target.value;
            settingsManager.setWallpaperSource(source).then(() => {
                wallpaperManager.loadWallpaper();
                eventBus.emit(EVENTS.WALLPAPER_SOURCE_CHANGED, source);
            });
        });
    }

    // 壁纸上传
    const wallpaperUploadBtn = document.getElementById('wallpaper-upload-btn');
    const wallpaperFile = document.getElementById('wallpaper-file');

    if (wallpaperUploadBtn && wallpaperFile) {
        wallpaperUploadBtn.addEventListener('click', () => {
            wallpaperFile.click();
        });

        wallpaperFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const compressedData = await wallpaperManager.compressImage(event.target.result);
                    if (compressedData) {
                        await dataManager.saveWallpaperData('wallpaperData', compressedData);
                        wallpaperManager.displayWallpaper(compressedData);
                        uiRenderer.showNotification('壁纸已更新');
                    } else {
                        uiRenderer.showNotification('壁纸大小超出限制');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 设置范围输入器变更事件
    setupRangeInputs();

    // 网格列数
    setupGridPresets();

    // 复选框事件
    setupCheckboxes();

    // 文字颜色选择
    setupColorPalette();

    // 语言选择
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            localStorage.setItem('language', lang);
            location.reload();
        });
    }
}

function initializeSettingsUI() {
    const settings = settingsManager.getSettingsForUI();

    // 图标设置
    const iconRadiusInput = document.getElementById('icon-radius');
    const iconOpacityInput = document.getElementById('icon-opacity');
    const iconSizeInput = document.getElementById('icon-size');

    if (iconRadiusInput) {
        iconRadiusInput.value = settings.iconRadius;
        document.getElementById('radius-value').textContent = settings.iconRadius + '%';
    }
    if (iconOpacityInput) {
        iconOpacityInput.value = settings.iconOpacity;
        document.getElementById('opacity-value').textContent = settings.iconOpacity + '%';
    }
    if (iconSizeInput) {
        iconSizeInput.value = settings.iconSize;
        const percent = Math.round(((settings.iconSize - 30) / 120) * 80 + 20);
        document.getElementById('size-value').textContent = percent + '%';
    }

    // 搜索框设置
    const searchWidthInput = document.getElementById('search-width');
    const searchHeightInput = document.getElementById('search-height');
    const searchRadiusInput = document.getElementById('search-radius');
    const searchOpacityInput = document.getElementById('search-opacity');
    const searchTopMarginInput = document.getElementById('search-top-margin');

    if (searchWidthInput) {
        searchWidthInput.value = settings.searchWidth;
        document.getElementById('search-width-value').textContent = settings.searchWidth + '%';
    }
    if (searchHeightInput) {
        searchHeightInput.value = settings.searchHeight;
        document.getElementById('search-height-value').textContent = settings.searchHeight + 'px';
    }
    if (searchRadiusInput) {
        searchRadiusInput.value = settings.searchRadius;
        document.getElementById('search-radius-value').textContent = settings.searchRadius + 'px';
    }
    if (searchOpacityInput) {
        searchOpacityInput.value = settings.searchOpacity;
        document.getElementById('search-opacity-value').textContent = settings.searchOpacity + '%';
    }
    if (searchTopMarginInput) {
        searchTopMarginInput.value = settings.searchTopMargin;
        document.getElementById('search-top-margin-value').textContent = settings.searchTopMargin + 'px';
    }

    // 壁纸设置
    const wallpaperSourceSelect = document.getElementById('wallpaper-source');
    const maskOpacityInput = document.getElementById('mask-opacity');
    const wallpaperBlurInput = document.getElementById('wallpaper-blur');

    if (wallpaperSourceSelect) {
        wallpaperSourceSelect.value = settings.wallpaperSource;
    }
    if (maskOpacityInput) {
        maskOpacityInput.value = settings.maskOpacity;
        document.getElementById('mask-opacity-value').textContent = settings.maskOpacity + '%';
    }
    if (wallpaperBlurInput) {
        wallpaperBlurInput.value = settings.wallpaperBlur;
        document.getElementById('wallpaper-blur-value').textContent = settings.wallpaperBlur + '%';
    }

    // 文字设置
    const textSizeInput = document.getElementById('text-size');
    const textShadowCheckbox = document.getElementById('text-shadow');

    if (textSizeInput) {
        textSizeInput.value = settings.textSize;
        document.getElementById('text-size-value').textContent = settings.textSize + 'px';
    }
    if (textShadowCheckbox) {
        textShadowCheckbox.checked = settings.textShadow;
    }

    // 其他复选框
    const showIconLabelCheckbox = document.getElementById('show-icon-label');
    const iconShadowCheckbox = document.getElementById('icon-shadow');
    const iconAnimationCheckbox = document.getElementById('icon-animation');
    const hideSearchBarCheckbox = document.getElementById('hide-search-bar');

    if (showIconLabelCheckbox) showIconLabelCheckbox.checked = settings.showIconLabel;
    if (iconShadowCheckbox) iconShadowCheckbox.checked = settings.iconShadow;
    if (iconAnimationCheckbox) iconAnimationCheckbox.checked = settings.iconAnimation;
    if (hideSearchBarCheckbox) hideSearchBarCheckbox.checked = settings.hideSearchBar;
}

function setupRangeInputs() {
    const rangeInputs = {
        'icon-radius': () => settingsManager.setIconRadius(parseInt(document.getElementById('icon-radius').value)),
        'icon-opacity': () => settingsManager.setIconOpacity(parseInt(document.getElementById('icon-opacity').value)),
        'icon-size': () => settingsManager.setIconSize(parseInt(document.getElementById('icon-size').value)),
        'search-width': () => settingsManager.setSearchWidth(parseInt(document.getElementById('search-width').value)),
        'search-height': () => settingsManager.setSearchHeight(parseInt(document.getElementById('search-height').value)),
        'search-radius': () => settingsManager.setSearchRadius(parseInt(document.getElementById('search-radius').value)),
        'search-opacity': () => settingsManager.setSearchOpacity(parseInt(document.getElementById('search-opacity').value)),
        'search-top-margin': () => settingsManager.setSearchTopMargin(parseInt(document.getElementById('search-top-margin').value)),
        'mask-opacity': () => settingsManager.setMaskOpacity(parseInt(document.getElementById('mask-opacity').value)),
        'wallpaper-blur': () => settingsManager.setWallpaperBlur(parseInt(document.getElementById('wallpaper-blur').value)),
        'text-size': () => settingsManager.setTextSize(parseInt(document.getElementById('text-size').value))
    };

    Object.entries(rangeInputs).forEach(([id, updateFn]) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', debounce(() => {
                updateFn();
                // 更新显示值
                const valueSpanId = id.replace('-', '-') + '-value';
                const valueSpan = document.getElementById(valueSpanId);
                if (valueSpan) {
                    const value = input.value;
                    if (id.includes('size')) {
                        valueSpan.textContent = value + 'px';
                    } else if (id.includes('opacity') || id.includes('radius') && id.includes('icon') || id.includes('wallpaper-blur')) {
                        valueSpan.textContent = value + (id.includes('radius') && id.includes('icon') ? '%' : id.includes('opacity') ? '%' : '%');
                    } else {
                        valueSpan.textContent = value + '%';
                    }
                }
            }, 300));
        }
    });
}

function setupGridPresets() {
    document.querySelectorAll('.grid-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const cols = btn.dataset.cols;
            if (cols === 'custom') {
                document.getElementById('custom-cols-item').classList.remove('hidden');
                const customColsInput = document.getElementById('custom-cols');
                if (customColsInput) {
                    const cols = parseInt(customColsInput.value);
                    settingsManager.setGridCols(cols);
                }
            } else {
                document.getElementById('custom-cols-item').classList.add('hidden');
                settingsManager.setGridCols(parseInt(cols));
            }
        });
    });

    const customColsInput = document.getElementById('custom-cols');
    if (customColsInput) {
        customColsInput.addEventListener('input', (e) => {
            const cols = parseInt(e.target.value);
            if (cols >= 2 && cols <= 10) {
                settingsManager.setGridCols(cols);
            }
        });
    }
}

function setupCheckboxes() {
    const checkboxMappings = {
        'show-icon-label': () => settingsManager.setShowIconLabel(document.getElementById('show-icon-label').checked),
        'icon-shadow': () => settingsManager.setIconShadow(document.getElementById('icon-shadow').checked),
        'icon-animation': () => settingsManager.setIconAnimation(document.getElementById('icon-animation').checked),
        'hide-search-bar': () => settingsManager.setHideSearchBar(document.getElementById('hide-search-bar').checked),
        'text-shadow': () => settingsManager.setTextShadow(document.getElementById('text-shadow').checked)
    };

    Object.entries(checkboxMappings).forEach(([id, updateFn]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', updateFn);
        }
    });
}

function setupColorPalette() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const color = btn.dataset.color;
            settingsManager.setTextColor(color);
        });
    });
}

// ==================== 事件监听 ====================

// 监听数据变更事件
eventBus.on(EVENTS.APPS_CHANGED, () => {
    console.log('[App] Apps data changed');
});

eventBus.on(EVENTS.SETTINGS_CHANGED, () => {
    console.log('[App] Settings changed');
});
