// 搜索引擎图标
const searchEngineIcons = {
    google: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%234285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/%3E%3Cpath fill="%2334A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/%3E%3Cpath fill="%23FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/%3E%3Cpath fill="%23EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/%3E%3C/svg%3E',
    bing: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect fill="%2300A4EF" x="1" y="1" width="10" height="10"/%3E%3Crect fill="%237FBA00" x="13" y="1" width="10" height="10"/%3E%3Crect fill="%23FFB900" x="1" y="13" width="10" height="10"/%3E%3Crect fill="%23F25022" x="13" y="13" width="10" height="10"/%3E%3C/svg%3E',
    baidu: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="11" fill="%23FF6B2B"/%3E%3Cpath fill="white" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2M8 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4 8c2.2 0 4-1.8 4-4h-8c0 2.2 1.8 4 4 4z"/%3E%3C/svg%3E'
};

// 获取网站 favicon
function getFaviconUrl(urlString) {
    try {
        const url = new URL(urlString);
        const hostname = url.hostname;
        // 返回多个favicon源的数组，按优先级排列
        return [
            `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
            `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
            `${url.protocol}//${hostname}/favicon.ico`
        ];
    } catch (e) {
        return [];
    }
}

// 搜索引擎和搜索类型配置
const searchEngines = {
    google: {
        web: 'https://www.google.com/search?q={query}',
        images: 'https://www.google.com/search?q={query}&tbm=isch',
        news: 'https://news.google.com/search?q={query}',
        video: 'https://www.google.com/search?q={query}&tbm=vid',
        maps: 'https://www.google.com/maps/search/{query}'
    },
    bing: {
        web: 'https://www.bing.com/search?q={query}',
        images: 'https://www.bing.com/images/search?q={query}',
        news: 'https://www.bing.com/news/search?q={query}',
        video: 'https://www.bing.com/videos/search?q={query}',
        maps: 'https://www.bing.com/maps?q={query}'
    },
    baidu: {
        web: 'https://www.baidu.com/s?wd={query}',
        images: 'https://image.baidu.com/search/index?tn=baiduimage&word={query}',
        news: 'https://news.baidu.com/news?wd={query}',
        video: 'https://v.baidu.com/v?ct=301&s=25&ie=utf-8&word={query}',
        maps: 'https://api.map.baidu.com/place/search?query={query}'
    }
};

// 默认快捷方式
const defaultApps = [
    { name: "Bilibili", url: "https://www.bilibili.com", color: "#fb7299", text: "B", iconType: "color" },
    { name: "GitHub", url: "https://github.com", color: "#24292e", text: "G", iconType: "color" },
    { name: "Stack Overflow", url: "https://stackoverflow.com", color: "#f48024", text: "SO", iconType: "color" },
    { name: "MDN", url: "https://developer.mozilla.org", color: "#000", text: "MDN", iconType: "color" },
];

// 默认设置
const defaultSettings = {
    wallpaperSource: 'local',
    maskOpacity: 45,
    wallpaperBlur: 0,
    gridCols: 6,
    showIconLabel: false,
    iconShadow: true,
    iconAnimation: true,
    iconRadius: 50,
    iconOpacity: 100,
    iconSize: 90,
    hideSearchBar: false,
    searchWidth: 60,
    searchHeight: 44,
    searchRadius: 50,
    searchOpacity: 95,
    searchTopMargin: 0,
    textShadow: true,
    textSize: 14,
    textColor: '#ffffff',
    currentSearchEngine: 'google'
};

// 全局变量
const pageSize = 12;
let currentPage = 0;
let allApps = [];
let settings = { ...defaultSettings };
let currentSearchType = 'web';

// 编辑模式
let isEditMode = false;
let editingItemIndex = null;
let draggedItem = null;
let draggedIndex = null;

// DOM 元素
const body = document.getElementById('body');
const grid = document.getElementById('grid');
const sidebar = document.getElementById('sidebar');
const searchInput = document.getElementById('search-input');
const searchEngineSelector = document.querySelector('.search-engine-selector');
const searchEngineDropdownMenu = document.getElementById('search-engine-dropdown-menu');
const searchTypes = document.querySelectorAll('.search-type-btn');
const searchBox = document.querySelector('.search-box');
const searchEngineIcon = document.getElementById('search-engine-icon');
let currentSearchEngine = 'google';
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const shortcutForm = document.getElementById('shortcut-form');
const iconTypeRadios = document.querySelectorAll('input[name="icon-type"]');
const wallpaperRefreshBtn = document.getElementById('wallpaper-refresh-btn');
const addTab = document.getElementById('add-tab');
const settingsTab = document.getElementById('settings-tab');
const addPanel = document.getElementById('add-panel');
const settingsPanel = document.getElementById('settings-panel');

// ==================== 壁纸辅助函数 ====================
function getWallpaperUrl(storageResult) {
    // 根据设置的壁纸源返回存储中的壁纸URL
    if (settings.wallpaperSource === 'local' && storageResult.wallpaperData) {
        return storageResult.wallpaperData;
    }
    if (settings.wallpaperSource === 'bing' && storageResult.currentBingWallpaper) {
        return storageResult.currentBingWallpaper;
    }
    if (settings.wallpaperSource === 'google' && storageResult.currentGoogleWallpaper) {
        return storageResult.currentGoogleWallpaper;
    }
    return null;
}

// 检测图像是否有透明背景（用于初始化时保存图标属性）
function checkImageTransparency(imageUrl) {
    try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        return new Promise((resolve) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // 检查是否有透明像素（alpha < 255）
                let hasTransparency = false;
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] < 200) { // alpha 小于 200 视为透明
                        hasTransparency = true;
                        break;
                    }
                }
                
                resolve(hasTransparency);
            };
            
            img.onerror = () => {
                // 如果加载失败，假设没有透明背景
                resolve(false);
            };
            
            img.src = imageUrl;
        });
    } catch (e) {
        // 如果出错，假设没有透明背景
        return Promise.resolve(false);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    setupSidebar();
    setupModal();
    setupSettingsModal();
    loadData();
});

// ==================== 数据存储 ====================

function loadData() {
    chrome.storage.local.get(['apps', 'settings', 'wallpaperData', 'currentBingWallpaper', 'currentGoogleWallpaper'], (result) => {
        // 加载数据
        if (result.apps && result.apps.length > 0) {
            allApps = result.apps;
            // 数据迁移：为旧应用添加 iconType 属性
            let needSave = false;
            allApps.forEach(app => {
                if (!app.iconType) {
                    app.iconType = app.img ? 'upload' : 'color';
                    needSave = true;
                }
            });
            if (needSave) {
                saveAppsToStorage();
            }
        } else {
            allApps = JSON.parse(JSON.stringify(defaultApps));
            saveAppsToStorage();
        }
        
        if (result.settings) {
            settings = { ...defaultSettings, ...result.settings };
        } else {
            settings = { ...defaultSettings };
            saveSettingsToStorage();
        }
        
        // 恢复搜索引擎选择
        if (settings.currentSearchEngine) {
            currentSearchEngine = settings.currentSearchEngine;
            updateSearchEngineIcon();
        }
        
        // 立即设置所有样式 - 包括遮罩、网格、搜索框等
        // 重要：在任何渲染之前完成所有样式设置
        body.style.setProperty('--mask-opacity', settings.maskOpacity / 100);
        body.style.setProperty('--wallpaper-blur', settings.wallpaperBlur || 0);
        body.style.setProperty('--search-width', settings.searchWidth + '%');
        body.style.setProperty('--search-height', (settings.searchHeight || 44) + 'px');
        body.style.setProperty('--search-radius', (settings.searchRadius || 50) + 'px');
        body.style.setProperty('--search-opacity', settings.searchOpacity / 100);
        
        // 应用其他设置（但不设置遮罩，避免重复）
        applySettingsExceptMask();
        initializeGridPresets();
        setupSettingsModalUIValues();
        
        // 立即加载壁纸
        const wallpaperUrl = getWallpaperUrl(result);
        console.log('[Wallpaper] wallpaperUrl:', wallpaperUrl ? wallpaperUrl.substring(0, 50) : 'null');
        console.log('[Wallpaper] settings.wallpaperSource:', settings.wallpaperSource);
        console.log('[Wallpaper] result.wallpaperData:', result.wallpaperData ? 'exists' : 'null');
        console.log('[Wallpaper] result.currentBingWallpaper:', result.currentBingWallpaper ? 'exists' : 'null');
        console.log('[Wallpaper] result.currentGoogleWallpaper:', result.currentGoogleWallpaper ? 'exists' : 'null');
        
        if (wallpaperUrl) {
            // 设置壁纸到 body::before 伪元素
            const style = document.createElement('style');
            style.textContent = `body::before { background-image: url("${wallpaperUrl}") !important; }`;
            document.head.appendChild(style);
            body.classList.add('has-wallpaper');
            console.log('[Wallpaper] Set backgroundImage on body::before');
        } else {
            body.classList.remove('has-wallpaper');
            console.log('[Wallpaper] No wallpaper in storage, will load async');
            // 如果没有壁纸，异步加载网络壁纸
            loadWallpaper();
        }
        
        // 所有准备就绪后，显示容器并渲染
        document.querySelector('.container').classList.add('ready');
        
        // 设置搜索引擎的 active 状态
        document.querySelectorAll('.dropdown-option').forEach(option => {
            if (option.dataset.engine === currentSearchEngine) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // 确保图标也与保存值同步
        updateSearchEngineIcon();

        render();
    });
}

function initializeGridPresets() {
    document.querySelectorAll('.grid-preset').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.cols === 'custom') {
            // Custom button active if gridCols not in preset values
            const presetValues = [3, 4, 5, 6, 8, 10];
            if (!presetValues.includes(settings.gridCols)) {
                btn.classList.add('active');
                document.getElementById('custom-cols-item').classList.remove('hidden');
                document.getElementById('custom-cols').value = settings.gridCols;
            } else {
                document.getElementById('custom-cols-item').classList.add('hidden');
            }
        } else {
            const cols = parseInt(btn.dataset.cols);
            if (cols === settings.gridCols) {
                btn.classList.add('active');
                document.getElementById('custom-cols-item').classList.add('hidden');
            }
        }
    });
}

function saveAppsToStorage() {
    chrome.storage.local.set({ apps: allApps });
}

function saveSettingsToStorage() {
    chrome.storage.local.set({ settings });
    // 只更新需要动态变化的样式
    applySettings();
}

// ==================== 侧边栏功能 ====================

function setupSidebar() {
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    sidebarCloseBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // 标签页切换
    addTab.addEventListener('click', () => {
        switchTab('add');
    });

    settingsTab.addEventListener('click', () => {
        switchTab('settings');
    });
}

function switchTab(tabName) {
    // 更新标签
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // 更新面板
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-panel`).classList.add('active');
}

// ==================== 壁纸功能 ====================

// 统一的壁纸显示函数
function displayWallpaper(imageUrl, saveKey = null) {
    // 设置壁纸到 body::before 伪元素
    const style = document.createElement('style');
    style.textContent = `body::before { background-image: url("${imageUrl}") !important; }`;
    document.head.appendChild(style);
    body.classList.add('has-wallpaper');
    if (saveKey) {
        const saveObj = {};
        saveObj[saveKey] = imageUrl;
        chrome.storage.local.set(saveObj);
    }
    console.log('[Wallpaper] Wallpaper displayed, saved key:', saveKey);
}

function loadWallpaper() {
    console.log('[Wallpaper] Loading wallpaper source:', settings.wallpaperSource);
    
    if (settings.wallpaperSource === 'local') {
        // 本地壁纸：获取最新上传的壁纸
        console.log('[Wallpaper] Loading local wallpaper...');
        chrome.storage.local.get(['wallpaperData'], (result) => {
            if (result.wallpaperData) {
                displayWallpaper(result.wallpaperData, 'wallpaperData');
                console.log('[Wallpaper] Local wallpaper loaded and saved');
            } else {
                console.log('[Wallpaper] No local wallpaper found');
            }
        });
        wallpaperRefreshBtn.classList.remove('show');
    } else if (settings.wallpaperSource === 'bing') {
        // Bing壁纸：显示刷新按钮并自动加载
        console.log('[Wallpaper] Bing wallpaper mode - showing refresh button and loading');
        wallpaperRefreshBtn.classList.add('show');
        // 自动加载一张Bing壁纸
        fetchBingWallpaper();
    } else if (settings.wallpaperSource === 'google') {
        // Google壁纸：显示刷新按钮并自动加载
        console.log('[Wallpaper] Google wallpaper mode - showing refresh button and loading');
        wallpaperRefreshBtn.classList.add('show');
        // 自动加载一张Google壁纸
        fetchGoogleWallpaper();
    }
}

function fetchBingWallpaper() {
    console.log('[Wallpaper - Bing] Bing API has CORS restrictions, using fallback wallpapers');
    
    const bingFallbackWallpapers = [
        'https://www.bing.com/th?id=OHR.MerlionPark_EN-US1969991689_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.ThailandLights_EN-US2050851255_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.IslandBay_EN-US1903389508_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.SaltFlats_EN-US1845236533_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.MooningPlanet_EN-US1751910315_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.PeacockinBloom_EN-US1934253670_1920x1080.jpg',
        'https://www.bing.com/th?id=OHR.PrairieWolves_EN-US1823879373_1920x1080.jpg'
    ];
    
    const randomIdx = Math.floor(Math.random() * bingFallbackWallpapers.length);
    const imageUrl = bingFallbackWallpapers[randomIdx];
    
    console.log('[Wallpaper - Bing] Selected fallback image index:', randomIdx);
    
    const img = new Image();
    let loaded = false;
    
    img.onload = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Bing] Image loaded successfully');
            displayWallpaper(imageUrl, 'currentBingWallpaper');
        }
    };
    
    img.onerror = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Bing] Fallback image failed to load, using stored wallpaper');
            useFallbackWallpaper();
        }
    };
    
    img.src = imageUrl;
    
    // 设置超时3秒，如果还没加载就使用fallback
    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Bing] Image load timeout, using stored wallpaper');
            useFallbackWallpaper();
        }
    }, 3000);
}

function fetchGoogleWallpaper() {
    // 只使用景观图片，不包含人物
    const wallpaperUrls = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', // 山景
        'https://images.unsplash.com/photo-1506784983066-a8165c7a090d?w=1920&h=1080&fit=crop', // 海景
        'https://images.unsplash.com/photo-1506704720897-c6b0b8ef6dba?w=1920&h=1080&fit=crop', // 森林
        'https://images.unsplash.com/photo-1506519773649-6e0ee9d4cc6e?w=1920&h=1080&fit=crop', // 峡谷
        'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&h=1080&fit=crop', // 日落
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop', // 云景
        'https://images.unsplash.com/photo-1506780773649-6e0ee9d4cc6e?w=1920&h=1080&fit=crop', // 夜景
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop'  // 海浪
    ];
    
    const randomIndex = Math.floor(Math.random() * wallpaperUrls.length);
    const imageUrl = wallpaperUrls[randomIndex];
    
    console.log('[Wallpaper - Google] Total URLs available:', wallpaperUrls.length);
    console.log('[Wallpaper - Google] Selected image index:', randomIndex);
    
    // 检查图片是否可以加载
    const img = new Image();
    let loaded = false;
    
    img.onload = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Image loaded successfully');
            displayWallpaper(imageUrl, 'currentGoogleWallpaper');
        }
    };
    
    img.onerror = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Image failed to load, trying next...');
            // 尝试加载下一张
            tryNextImage(wallpaperUrls, randomIndex + 1);
        }
    };
    
    console.log('[Wallpaper - Google] Starting image load...');
    img.src = imageUrl;
    
    // 设置超时2秒，如果还没加载就尝试下一张
    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Image load timeout, trying next...');
            img.src = ''; // 停止加载
            tryNextImage(wallpaperUrls, randomIndex + 1);
        }
    }, 2000);
}

function tryNextImage(urls, startIndex) {
    if (startIndex >= urls.length) {
        console.log('[Wallpaper - Google] All images failed, using fallback');
        useFallbackWallpaper();
        return;
    }
    
    const imageUrl = urls[startIndex];
    const img = new Image();
    let loaded = false;
    
    img.onload = () => {
        if (!loaded) {
            loaded = true;
            console.log('[Wallpaper - Google] Fallback image loaded successfully, index:', startIndex);
            displayWallpaper(imageUrl, 'currentGoogleWallpaper');
        }
    };
    
    img.onerror = () => {
        if (!loaded) {
            loaded = true;
            tryNextImage(urls, startIndex + 1);
        }
    };
    
    img.src = imageUrl;
    
    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            img.src = '';
            tryNextImage(urls, startIndex + 1);
        }
    }, 2000);
}

function useFallbackWallpaper() {
    // 优先尝试使用最后成功加载的壁纸，否则使用纯色背景
    chrome.storage.local.get(['lastBingWallpaper', 'lastGoogleWallpaper'], (result) => {
        if (result.lastBingWallpaper) {
            body.style.backgroundImage = `url("${result.lastBingWallpaper}")`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundRepeat = 'no-repeat';
            body.classList.add('has-wallpaper');
        } else if (result.lastGoogleWallpaper) {
            body.style.backgroundImage = `url("${result.lastGoogleWallpaper}")`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundRepeat = 'no-repeat';
            body.classList.add('has-wallpaper');
        } else {
            // 使用纯色背景或默认图片
            body.style.backgroundImage = 'none';
            body.classList.remove('has-wallpaper');
        }
    });
}

// ==================== 搜索功能 ====================

function setupSearch() {
    // 搜索引擎图标
    updateSearchEngineIcon();

    // 下拉菜单切换
    searchEngineSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        searchEngineSelector.classList.toggle('active');
        searchEngineDropdownMenu.classList.toggle('show');
    });

    // 搜索引擎选项点击
    document.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const engine = option.dataset.engine;
            currentSearchEngine = engine;
            settings.currentSearchEngine = engine;
            
            // 更新active状态
            document.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            updateSearchEngineIcon();
            searchEngineSelector.classList.remove('active');
            searchEngineDropdownMenu.classList.remove('show');
            
            // 保存设置
            saveSettingsToStorage();
            
            // 获取焦点到搜索框
            searchInput.focus();
        });
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box-wrapper')) {
            searchEngineSelector.classList.remove('active');
            searchEngineDropdownMenu.classList.remove('show');
        }
    });

    // 搜索类型选项卡
    searchTypes.forEach(btn => {
        btn.addEventListener('click', () => {
            searchTypes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSearchType = btn.dataset.type;
        });
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const engine = currentSearchEngine;
            const searchType = currentSearchType;
            const query = searchInput.value.trim();
            
            if (query) {
                let url = searchEngines[engine][searchType];
                // 替换{query}占位符
                url = url.replace('{query}', encodeURIComponent(query));
                window.location.href = url;
            }
        }
    });

    wallpaperRefreshBtn.addEventListener('click', () => {
        if (settings.wallpaperSource === 'bing') {
            fetchBingWallpaper();
        } else if (settings.wallpaperSource === 'google') {
            fetchGoogleWallpaper();
        }
    });

    // 添加搜索引擎功能
    const dropdownAdd = document.querySelector('.dropdown-add');
    if (dropdownAdd) {
        dropdownAdd.addEventListener('click', () => {
            const name = prompt('输入搜索引擎名称 (如: DuckDuckGo)');
            if (!name) return;
            
            const url = prompt('输入搜索URL (使用 {query} 作为占位符)\n例: https://duckduckgo.com/?q={query}');
            if (!url || !url.includes('{query}')) {
                alert('URL 必须包含 {query} 占位符');
                return;
            }
            
            // 添加到搜索引擎配置
            const engineKey = name.toLowerCase().replace(/\s+/g, '');
            searchEngines[engineKey] = {
                web: url
            };
            
            // 创建新选项
            const newOption = document.createElement('div');
            newOption.className = 'dropdown-option';
            newOption.dataset.engine = engineKey;
            newOption.innerHTML = `
                <svg class="dropdown-icon" viewBox="0 0 24 24">
                    <text x="12" y="16" text-anchor="middle" font-size="14" font-family="Arial" fill="#999">${name[0].toUpperCase()}</text>
                </svg>
                <span>${name}</span>
            `;
            
            // 插入到分隔线之前
            const divider = document.querySelector('.dropdown-divider');
            divider.parentNode.insertBefore(newOption, divider);
            
            // 为新选项添加点击事件
            newOption.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSearchEngine = engineKey;
                settings.currentSearchEngine = engineKey;
                
                // 更新active状态
                document.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('active'));
                newOption.classList.add('active');
                
                updateSearchEngineIcon();
                searchEngineSelector.classList.remove('active');
                searchEngineDropdownMenu.classList.remove('show');
                
                // 保存设置
                saveSettingsToStorage();
                
                searchInput.focus();
            });
            
            // 关闭菜单
            searchEngineSelector.classList.remove('active');
            searchEngineDropdownMenu.classList.remove('show');
        });
    }
}

// 搜索引擎SVG图标定义
const searchEngineIconsData = {
    google: { color: '#4285F4', text: 'G' },
    bing: { color: '#00A4EF', text: 'B' },
    baidu: { color: '#FF6B2B', text: '百' }
};

function updateSearchEngineIcon() {
    const engine = currentSearchEngine;
    const iconData = searchEngineIconsData[engine];
    
    if (iconData) {
        const searchEngineIcon = document.getElementById('search-engine-icon');
        searchEngineIcon.innerHTML = `
            <svg class="icon-svg" viewBox="1 1 22 22" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
                <circle cx="12" cy="12" r="11" fill="${iconData.color}"/>
                <text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="bold" font-family="Arial, sans-serif" fill="white">${iconData.text}</text>
            </svg>
        `;
    }
}

// ==================== 快捷方式 Modal ====================

function setupModal() {
    // URL解析功能
    const urlInput = document.getElementById('app-url');
    const parseUrlBtn = document.getElementById('parse-url-btn');
    
    // 自动解析URL（在输入框失焦时）
    urlInput.addEventListener('blur', () => {
        const url = urlInput.value.trim();
        if (url && parseUrlBtn) {
            parseUrlBtn.click();
        }
    });
    
    if (parseUrlBtn) {
        parseUrlBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const urlInput = document.getElementById('app-url');
            const url = urlInput.value.trim();
            
            if (!url) {
                alert('请输入有效的URL');
                return;
            }
            
            try {
                // 尝试解析URL
                const urlObj = new URL(url);
                const hostname = urlObj.hostname;
                
                // 自动填充名称（如果为空）
                const nameInput = document.getElementById('app-name');
                if (!nameInput.value.trim()) {
                    // 从hostname提取名称，去掉www
                    const domainName = hostname.replace('www.', '').split('.')[0];
                    nameInput.value = domainName.charAt(0).toUpperCase() + domainName.slice(1);
                }
                
                // 自动尝试加载favicon
                parseUrlBtn.disabled = true;
                parseUrlBtn.textContent = '加载中...';
                
                const faviconUrls = getFaviconUrl(url);
                if (faviconUrls.length === 0) {
                    parseUrlBtn.disabled = false;
                    parseUrlBtn.textContent = t('parse_url');
                    return;
                }
                
                // 切换到图片icon模式
                document.querySelector('input[name="icon-type"][value="upload"]').checked = true;
                document.getElementById('text-icon-options').classList.add('hidden');
                document.getElementById('upload-icon-options').classList.remove('hidden');
                
                // 依次尝试加载favicon
                let currentIndex = 0;
                
                function tryLoadFavicon() {
                    if (currentIndex >= faviconUrls.length) {
                        parseUrlBtn.disabled = false;
                        parseUrlBtn.textContent = t('parse_url');
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
                            // 成功加载，显示在预览中
                            const preview = document.getElementById('image-preview');
                            preview.style.backgroundImage = `url(${faviconUrl})`;
                            preview.classList.add('show');
                            preview.dataset.imageData = faviconUrl;
                            
                            parseUrlBtn.disabled = false;
                            parseUrlBtn.textContent = t('parse_url');
                        }
                    };
                    
                    img.onerror = () => {
                        if (!loaded) {
                            loaded = true;
                            // 这个源失败，尝试下一个
                            setTimeout(tryLoadFavicon, 100);
                        }
                    };
                    
                    img.src = faviconUrl;
                    // 3秒超时
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
        });
    }

    // 切换 icon 类型
    iconTypeRadios.forEach(radio => {
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

    // 图片上传预览
    document.getElementById('app-image').addEventListener('change', (e) => {
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

    // 表单提交
    shortcutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewShortcut();
    });

    // 重置表单
    shortcutForm.addEventListener('reset', (e) => {
        setTimeout(() => {
            document.getElementById('image-preview').classList.remove('show');
            document.getElementById('image-preview').style.backgroundImage = '';
        }, 0);
    });
}

function addNewShortcut() {
    const name = document.getElementById('app-name').value.trim();
    const url = document.getElementById('app-url').value.trim();
    const iconType = document.querySelector('input[name="icon-type"]:checked').value;

    if (!name || !url) return;

    const newApp = { name, url, iconType: 'color' };

    if (iconType === 'text') {
        newApp.text = document.getElementById('app-text').value.trim() || name[0];
        newApp.color = document.getElementById('app-color').value;
        allApps.push(newApp);
        saveAppsToStorage();
        shortcutForm.reset();
        document.getElementById('image-preview').classList.remove('show');
        render();
    } else {
        const preview = document.getElementById('image-preview');
        
        // 优先使用用户上传的图片
        if (preview.dataset.imageData) {
            newApp.img = preview.dataset.imageData;
            newApp.iconType = 'upload';
            allApps.push(newApp);
            saveAppsToStorage();
            shortcutForm.reset();
            preview.classList.remove('show');
            render();
            return;
        }
        
        // 尝试加载favicon
        const faviconUrls = getFaviconUrl(url);
        if (faviconUrls.length === 0) {
            allApps.push(newApp);
            saveAppsToStorage();
            shortcutForm.reset();
            preview.classList.remove('show');
            render();
            return;
        }

        // 依次尝试多个favicon源
        let currentIndex = 0;
        
        function tryNextFavicon() {
            if (currentIndex >= faviconUrls.length) {
                // 所有favicon源都失败了，保存不带图标的快捷方式
                allApps.push(newApp);
                saveAppsToStorage();
                shortcutForm.reset();
                preview.classList.remove('show');
                render();
                return;
            }

            const faviconUrl = faviconUrls[currentIndex];
            currentIndex++;
            
            const img = new Image();
            let loaded = false;
            
            img.onload = () => {
                if (!loaded) {
                    loaded = true;
                    newApp.img = faviconUrl;
                    newApp.iconType = 'icon';
                    
                    // 立即检测favicon的透明背景
                    checkImageTransparency(faviconUrl).then(hasTransparency => {
                        newApp.isTransparent = hasTransparency;
                        allApps.push(newApp);
                        saveAppsToStorage();
                        shortcutForm.reset();
                        preview.classList.remove('show');
                        render();
                    });
                }
            };
            
            img.onerror = () => {
                if (!loaded) {
                    loaded = true;
                    // 这个源失败，尝试下一个
                    setTimeout(tryNextFavicon, 100);
                }
            };
            
            // 设置超时3秒，如果还没加载完成就尝试下一个
            img.src = faviconUrl;
            setTimeout(() => {
                if (!loaded) {
                    loaded = true;
                    img.src = ''; // 停止加载
                    tryNextFavicon();
                }
            }, 3000);
        }
        
        tryNextFavicon();
    }
}

// ==================== 设置 Modal ====================

function setupSettingsModalUIValues() {
    // 初始化所有滑块和输入框的值和显示（在loadData回调中调用）
    
    // 网格列数初始化
    const presetValues = [3, 4, 5, 6, 8, 10];
    document.querySelectorAll('.grid-preset').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.cols === 'custom') {
            if (!presetValues.includes(settings.gridCols)) {
                btn.classList.add('active');
                document.getElementById('custom-cols-item').classList.remove('hidden');
                document.getElementById('custom-cols').value = settings.gridCols;
            } else {
                document.getElementById('custom-cols-item').classList.add('hidden');
            }
        } else {
            const cols = parseInt(btn.dataset.cols);
            if (cols === settings.gridCols) {
                btn.classList.add('active');
            }
        }
    });
    
    // 图标设置
    document.getElementById('icon-radius').value = settings.iconRadius;
    document.getElementById('icon-opacity').value = settings.iconOpacity;
    document.getElementById('icon-size').value = settings.iconSize;
    const percent = Math.round(((settings.iconSize - 30) / 120) * 80 + 20);
    document.getElementById('size-value').textContent = percent + '%';
    document.getElementById('radius-value').textContent = settings.iconRadius + '%';
    document.getElementById('opacity-value').textContent = settings.iconOpacity + '%';
    
    // 搜索框设置
    document.getElementById('search-width').value = settings.searchWidth;
    document.getElementById('search-height').value = settings.searchHeight || 44;
    document.getElementById('search-radius').value = settings.searchRadius;
    document.getElementById('search-opacity').value = settings.searchOpacity;
    document.getElementById('search-top-margin').value = settings.searchTopMargin || 0;
    document.getElementById('search-width-value').textContent = settings.searchWidth + '%';
    document.getElementById('search-radius-value').textContent = settings.searchRadius + 'px';
    document.getElementById('search-height-value').textContent = (settings.searchHeight || 44) + 'px';
    document.getElementById('search-opacity-value').textContent = settings.searchOpacity + '%';
    document.getElementById('search-top-margin-value').textContent = (settings.searchTopMargin || 0) + 'px';
    
    // 壁纸设置
    document.getElementById('wallpaper-source').value = settings.wallpaperSource;
    document.getElementById('mask-opacity').value = settings.maskOpacity;
    document.getElementById('mask-opacity-value').textContent = settings.maskOpacity + '%';
    document.getElementById('wallpaper-blur').value = settings.wallpaperBlur || 0;
    document.getElementById('wallpaper-blur-value').textContent = (settings.wallpaperBlur || 0) + '%';
    
    // 文字设置
    document.getElementById('text-size').value = settings.textSize;
    document.getElementById('text-size-value').textContent = settings.textSize + 'px';
    document.getElementById('text-shadow').checked = settings.textShadow;
    document.getElementById('show-icon-label').checked = settings.showIconLabel;
    document.getElementById('icon-shadow').checked = settings.iconShadow;
    document.getElementById('icon-animation').checked = settings.iconAnimation;
    document.getElementById('hide-search-bar').checked = settings.hideSearchBar;
    
    // 壁纸源
    document.getElementById('wallpaper-source').value = settings.wallpaperSource;
}

function setupSettingsModal() {
    // 壁纸来源变更
    document.getElementById('wallpaper-source').addEventListener('change', (e) => {
        settings.wallpaperSource = e.target.value;
        saveSettingsToStorage();
        // 清除旧壁纸，立即加载新壁纸
        body.style.backgroundImage = 'none';
        body.classList.remove('has-wallpaper');
        loadWallpaper();
    });

    // 壁纸上传
    document.getElementById('wallpaper-upload-btn').addEventListener('click', () => {
        document.getElementById('wallpaper-file').click();
    });

    document.getElementById('wallpaper-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('[Wallpaper] File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
            const reader = new FileReader();
            reader.onload = (event) => {
                const wallpaperData = event.target.result;
                console.log('[Wallpaper] File read successfully, data length:', wallpaperData.length);
                
                // 立即显示壁纸（同步操作）
                displayWallpaper(wallpaperData, 'wallpaperData');
                
                // 更新设置
                settings.wallpaperSource = 'local';
                document.getElementById('wallpaper-source').value = 'local';
                saveSettingsToStorage();
                console.log('[Wallpaper] Wallpaper displayed and settings saved');
                
                // 重置文件输入框，允许重新上传同一文件
                e.target.value = '';
            };
            reader.onerror = (error) => {
                console.error('[Wallpaper] File read error:', error);
            };
            reader.readAsDataURL(file);
        } else {
            console.log('[Wallpaper] No file selected');
        }
    });

    // 遮罩浓度
    document.getElementById('mask-opacity').addEventListener('input', (e) => {
        settings.maskOpacity = parseInt(e.target.value);
        document.getElementById('mask-opacity-value').textContent = settings.maskOpacity + '%';
        saveSettingsToStorage();
        applySettings();
    });

    // 壁纸模糊度
    document.getElementById('wallpaper-blur').addEventListener('input', (e) => {
        settings.wallpaperBlur = parseInt(e.target.value);
        document.getElementById('wallpaper-blur-value').textContent = settings.wallpaperBlur + '%';
        saveSettingsToStorage();
        applySettings();
    });

    // 网格列数
    document.querySelectorAll('.grid-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cols = parseInt(e.target.dataset.cols);
            if (e.target.dataset.cols === 'custom') {
                document.getElementById('custom-cols-item').classList.remove('hidden');
            } else {
                document.getElementById('custom-cols-item').classList.add('hidden');
                settings.gridCols = cols;
                document.querySelectorAll('.grid-preset').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                saveSettingsToStorage();
                applySettings();
                render();
            }
        });
    });

    document.getElementById('custom-cols').addEventListener('change', (e) => {
        const cols = parseInt(e.target.value);
        if (cols >= 2 && cols <= 10) {
            settings.gridCols = cols;
            document.querySelectorAll('.grid-preset').forEach(b => b.classList.remove('active'));
            saveSettingsToStorage();
            applySettings();
            render();
        }
    });

    document.getElementById('custom-cols').addEventListener('input', (e) => {
        const cols = parseInt(e.target.value);
        if (cols >= 2 && cols <= 10) {
            settings.gridCols = cols;
            applySettings();
        }
    });

    // 图标选项
    document.getElementById('show-icon-label').addEventListener('change', (e) => {
        settings.showIconLabel = e.target.checked;
        saveSettingsToStorage();
        render();
    });

    document.getElementById('icon-shadow').addEventListener('change', (e) => {
        settings.iconShadow = e.target.checked;
        saveSettingsToStorage();
        applySettings();
        render();
    });

    document.getElementById('icon-animation').addEventListener('change', (e) => {
        settings.iconAnimation = e.target.checked;
        saveSettingsToStorage();
        render();
    });

    document.getElementById('icon-radius').addEventListener('input', (e) => {
        settings.iconRadius = parseInt(e.target.value);
        document.getElementById('radius-value').textContent = settings.iconRadius + '%';
        saveSettingsToStorage();
        applySettings();
    });

    document.getElementById('icon-opacity').addEventListener('input', (e) => {
        settings.iconOpacity = parseInt(e.target.value);
        document.getElementById('opacity-value').textContent = settings.iconOpacity + '%';
        saveSettingsToStorage();
        applySettings();
    });

    document.getElementById('icon-size').addEventListener('input', (e) => {
        settings.iconSize = parseInt(e.target.value);
        // 显示为百分比（30-150px映射为20%-100%）
        const percent = Math.round(((settings.iconSize - 30) / 120) * 80 + 20);
        document.getElementById('size-value').textContent = percent + '%';
        saveSettingsToStorage();
        applySettings();
    });

    // 搜索框选项
    document.getElementById('hide-search-bar').addEventListener('change', (e) => {
        settings.hideSearchBar = e.target.checked;
        saveSettingsToStorage();
        applySettings();
    });

    document.getElementById('search-width').addEventListener('input', (e) => {
        settings.searchWidth = parseInt(e.target.value);
        document.getElementById('search-width-value').textContent = settings.searchWidth + '%';
        saveSettingsToStorage();
        applySettings();
    });

    document.getElementById('search-radius').addEventListener('input', (e) => {
        settings.searchRadius = parseInt(e.target.value);
        document.getElementById('search-radius-value').textContent = settings.searchRadius + 'px';
        saveSettingsToStorage();
        applySettings();
    });

    document.getElementById('search-height').addEventListener('input', (e) => {
        settings.searchHeight = parseInt(e.target.value);
        document.getElementById('search-height-value').textContent = settings.searchHeight + 'px';
        saveSettingsToStorage();
        applySettings();
    });

    document.getElementById('search-opacity').addEventListener('input', (e) => {
        settings.searchOpacity = parseInt(e.target.value);
        document.getElementById('search-opacity-value').textContent = settings.searchOpacity + '%';
        saveSettingsToStorage();
        applySettings();
    });

    document.getElementById('search-top-margin').addEventListener('input', (e) => {
        settings.searchTopMargin = parseInt(e.target.value);
        document.getElementById('search-top-margin-value').textContent = settings.searchTopMargin + 'px';
        saveSettingsToStorage();
        applySettings();
    });

    // 字体选项
    document.getElementById('text-shadow').addEventListener('change', (e) => {
        settings.textShadow = e.target.checked;
        saveSettingsToStorage();
        applySettings();
        render();
    });

    document.getElementById('text-size').addEventListener('input', (e) => {
        settings.textSize = parseInt(e.target.value);
        document.getElementById('text-size-value').textContent = settings.textSize + 'px';
        saveSettingsToStorage();
        applySettings();
    });

    // 字体颜色
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const color = e.target.dataset.color;
            settings.textColor = color;
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            saveSettingsToStorage();
            applySettings();
            render();
        });
    });

    // 语言选择
    document.getElementById('language-select').addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

// ==================== 应用设置 ====================

function applySettings() {
    // 壁纸遮罩和模糊 - 仅在用户改变设置时生效
    body.style.setProperty('--mask-opacity', settings.maskOpacity / 100);
    body.style.setProperty('--wallpaper-blur', settings.wallpaperBlur || 0);
    applySettingsExceptMask();
}

function applySettingsExceptMask() {
    // 不设置遮罩的其他设置
    // 用于初始化时避免重复设置遮罩
    
    // 网格列数 - 直接设置样式以触发过渡动画
    body.style.setProperty('--grid-cols', settings.gridCols);
    const gridElement = document.getElementById('grid');
    if (gridElement) {
        gridElement.style.gridTemplateColumns = `repeat(${settings.gridCols}, auto)`;
    }

    // 图标样式
    body.style.setProperty('--icon-size', settings.iconSize + 'px');
    body.style.setProperty('--icon-radius', (settings.iconRadius / 100) * 22);
    body.style.setProperty('--icon-opacity', settings.iconOpacity / 100);

    // 搜索框样式
    if (settings.hideSearchBar) {
        searchBox.classList.add('hidden');
    } else {
        searchBox.classList.remove('hidden');
    }
    body.style.setProperty('--search-width', settings.searchWidth + '%');
    body.style.setProperty('--search-height', (settings.searchHeight || 44) + 'px');
    body.style.setProperty('--search-radius', (settings.searchRadius || 50) + 'px');
    body.style.setProperty('--search-opacity', settings.searchOpacity / 100);

    // 文字样式
    const textShadow = settings.textShadow ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none';
    body.style.setProperty('--text-shadow-enabled', textShadow);
    body.style.setProperty('--text-size', settings.textSize + 'px');
    body.style.setProperty('--text-color', settings.textColor);
}

// ==================== 渲染页面 ====================

function render() {
    renderGrid();
    renderPagination();
}

function renderGrid() {
    grid.innerHTML = '';
    
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const pageApps = allApps.slice(start, end);

    pageApps.forEach((app, index) => {
        const realIndex = start + index;
        const item = document.createElement('a');
        item.href = isEditMode ? 'javascript:void(0)' : app.url;
        item.className = 'app-item';
        if (isEditMode) {
            item.classList.add('edit-mode');
        }
        item.target = '_self';
        item.dataset.index = realIndex;

        // 点击处理
        item.addEventListener('click', (e) => {
            if (isEditMode) {
                e.preventDefault();
            }
        });

        // 右键进入编辑模式
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            enterEditMode(realIndex);
        });

        // 编辑模式下的拖拽
        if (isEditMode) {
            item.draggable = true;
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        }

        // 创建图标容器
        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';

        // 创建图标
        const icon = document.createElement('div');
        icon.className = 'app-icon';
        if (settings.iconShadow) {
            icon.classList.add('with-shadow');
        }
        if (settings.iconAnimation) {
            icon.classList.add('with-animation');
        }

        if (app.iconType === 'icon' && app.img) {
            // 网络图标 - icon1 或 icon2
            icon.style.backgroundImage = `url(${app.img})`;
            // 根据保存的透明度标记添加背景色
            if (!app.isTransparent) {
                icon.style.backgroundColor = '#f0f0f0';
            }
            icon.style.backgroundSize = 'cover';
            icon.style.backgroundPosition = 'center';
        } else if (app.iconType === 'upload' && app.img) {
            // 上传的本地图标
            icon.style.backgroundImage = `url(${app.img})`;
            // 如果没有透明背景，添加颜色背景
            if (!app.isTransparent) {
                icon.style.backgroundColor = app.color || '#ccc';
            }
            icon.style.backgroundSize = 'cover';
            icon.style.backgroundPosition = 'center';
        } else if (app.iconType === 'color') {
            // 纯色图标 - 文字+颜色
            icon.style.backgroundColor = app.color || '#ccc';
            icon.innerText = app.text || app.name[0];
        } else {
            // 备用：显示文字
            icon.style.backgroundColor = app.color || '#ccc';
            icon.innerText = app.text || app.name[0];
        }

        iconContainer.appendChild(icon);

        // 在编辑模式下添加删除按钮和编辑图标
        if (isEditMode) {
            // 编辑图标 - hover 时显示，使用SVG灰色铅笔
            const editIcon = document.createElement('div');
            editIcon.className = 'edit-icon';
            editIcon.innerHTML = `
                <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <!-- 铅笔笔身 -->
                    <path d="M 10 38 L 14 34 L 34 14 L 38 10 L 38 10" stroke="#999999" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <!-- 铅笔橡皮 -->
                    <rect x="6" y="34" width="6" height="10" fill="#AAAAAA" stroke="#999999" stroke-width="1"/>
                    <!-- 铅笔芯 -->
                    <path d="M 34 14 L 38 10" stroke="#666666" stroke-width="3" stroke-linecap="round"/>
                </svg>
            `;
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                editAppIcon(realIndex);
            });
            iconContainer.appendChild(editIcon);

            // 删除按钮 - 始终显示
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                deleteApp(realIndex);
            });
            iconContainer.appendChild(deleteBtn);
        }

        // 创建名称
        const name = document.createElement('span');
        name.className = 'app-name';
        if (settings.showIconLabel) {
            name.classList.add('hidden');
        }
        name.innerText = app.name;


        item.appendChild(iconContainer);
        item.appendChild(name);
        grid.appendChild(item);
    });
}

// 进入编辑模式
function enterEditMode(index) {
    isEditMode = true;
    editingItemIndex = index;
    renderGrid();
    
    // 添加全局点击和右键事件监听，点击/右键空白处退出编辑模式
    document.addEventListener('click', exitEditModeOnClick, true);
    document.addEventListener('contextmenu', exitEditModeOnContextMenu, true);
}

// 点击空白处退出编辑模式
function exitEditModeOnClick(e) {
    // 如果点击的是grid内的item，不退出
    const itemClicked = e.target.closest('.app-item');
    if (itemClicked && grid.contains(itemClicked)) {
        return;
    }
    // 点击其他地方则退出编辑模式
    exitEditMode();
}

// 右键空白处退出编辑模式
function exitEditModeOnContextMenu(e) {
    // 如果右键的是grid内的item，不退出（item有自己的contextmenu处理）
    const itemClicked = e.target.closest('.app-item');
    if (itemClicked && grid.contains(itemClicked)) {
        return;
    }
    // 右键其他地方则退出编辑模式
    exitEditMode();
}

// 退出编辑模式
function exitEditMode() {
    isEditMode = false;
    editingItemIndex = null;
    document.removeEventListener('click', exitEditModeOnClick, true);
    document.removeEventListener('contextmenu', exitEditModeOnContextMenu, true);
    renderGrid();
}

// 编辑图标
function editAppIcon(index) {
    const app = allApps[index];
    const currentIconType = app.iconType || 'color';
    const currentIconStyle = app.iconStyle || '';
    
    // 创建编辑对话框
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        overflow-y: auto;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease-out;
        margin: 20px auto;
    `;

    // 初始化图标选项HTML
    let iconOptionsHTML = `
        <div class="icon-option" data-type="color" style="padding: 12px; border: 2px solid ${currentIconType === 'color' ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${currentIconType === 'color' ? '#f0f7ff' : '#fff'};">
            <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${settings.iconRadius || 50}%; background: ${app.color || '#fb7299'}; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${app.text || app.name[0]}
            </div>
            <div style="font-size: 12px; color: #666;">纯色图标</div>
        </div>
    `;
    
    // 获取网络图标选项
    let availableIconCount = 0;
    
    // 如果当前是网络图标，显示已保存的图标
    if (currentIconType === 'icon' && app.img) {
        const isSelected = currentIconType === 'icon';
        // 判断是否有透明背景来决定是否显示背景色
        const bgColor = app.isTransparent ? 'transparent' : '#f0f0f0';
        iconOptionsHTML += `
            <div class="icon-option" data-type="icon" data-style="icon1" data-url="${app.img}" style="padding: 12px; border: 2px solid ${isSelected ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${isSelected ? '#f0f7ff' : '#fff'};">
                <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${settings.iconRadius || 50}%; background-image: url(${app.img}); background-color: ${bgColor}; background-size: cover; background-position: center; margin: 0 auto 8px; border: 1px solid #eee;"></div>
                <div style="font-size: 12px; color: #666;">图标A</div>
            </div>
        `;
        availableIconCount = 1;
    } else {
        // 否则从URL重新解析favicon作为可选项
        const faviconUrls = getFaviconUrl(app.url);
        
        // 只显示最多2个网络图标
        for (let i = 0; i < Math.min(faviconUrls.length, 2); i++) {
            const iconStyle = i === 0 ? 'icon1' : 'icon2';
            const isSelected = currentIconType === 'icon' && currentIconStyle === iconStyle;
            // 新解析的favicon先不添加背景色，待用户选择后再检测
            iconOptionsHTML += `
                <div class="icon-option" data-type="icon" data-style="${iconStyle}" data-url="${faviconUrls[i]}" style="padding: 12px; border: 2px solid ${isSelected ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${isSelected ? '#f0f7ff' : '#fff'};">
                    <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${settings.iconRadius || 50}%; background-image: url(${faviconUrls[i]}); background-size: cover; background-position: center; margin: 0 auto 8px; border: 1px solid #eee;"></div>
                    <div style="font-size: 12px; color: #666;">图标${String.fromCharCode(65 + i)}</div>
                </div>
            `;
            availableIconCount++;
        }
    }
    
    // 上传选项
    iconOptionsHTML += `
        <div class="icon-option" data-type="upload" style="padding: 12px; border: 2px solid ${currentIconType === 'upload' ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${currentIconType === 'upload' ? '#f0f7ff' : '#fff'};">
            <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${settings.iconRadius || 50}%; background: #f0f0f0; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 24px;">📤</div>
            <div style="font-size: 12px; color: #666;">本地图标</div>
        </div>
    `;

    modalContent.innerHTML = `
        <h2 style="margin: 0 0 20px; font-size: 18px; color: #333;">编辑图标</h2>
        
        <div style="margin-bottom: 20px;">
            <div style="width: 100px; height: 100px; aspect-ratio: 1; border-radius: ${settings.iconRadius || 50}%; background: ${currentIconType === 'icon' && app.isTransparent ? 'transparent' : (app.color || '#ccc')}; margin: 0 auto 16px; background-image: url(${app.img || ''}); background-size: cover; background-position: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 32px;" id="icon-preview">
                ${currentIconType === 'color' ? (app.text || app.name[0]) : ''}
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 12px; color: #333; font-size: 14px; font-weight: 500;">选择图标</label>
            <div id="icon-options-grid" style="display: grid; grid-template-columns: repeat(${Math.min(availableIconCount + 2, 4)}, 1fr); gap: 12px;">
                ${iconOptionsHTML}
            </div>
        </div>
        
        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">网站URL</label>
            <input type="text" id="edit-url" value="${app.url}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 14px;">
        </div>
        
        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">名称</label>
            <input type="text" id="edit-name" value="${app.name}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 14px;">
        </div>
        
        <div id="color-input-group" style="margin-bottom: 16px; ${currentIconType === 'color' ? '' : 'display: none;'}">
            <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">纯色文字</label>
            <input type="text" id="edit-text" value="${app.text || app.name[0]}" maxlength="4" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 14px; margin-bottom: 8px;">
            <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">颜色</label>
            <input type="color" id="edit-color" value="${app.color || '#fb7299'}" style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">
        </div>
        
        <div id="img-input-group" style="margin-bottom: 16px; ${currentIconType === 'upload' ? '' : 'display: none;'}">
            <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">图标URL</label>
            <input type="text" id="edit-img" value="${app.img || ''}" placeholder="https://..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 14px;">
        </div>
        
        <div style="display: flex; gap: 12px;">
            <button id="modal-cancel" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: #f5f5f5; cursor: pointer; font-size: 14px;">取消</button>
            <button id="modal-save" style="flex: 1; padding: 10px; border: none; border-radius: 6px; background: #4285F4; color: white; cursor: pointer; font-size: 14px;">保存</button>
        </div>
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 事件处理
    const urlInput = modalContent.querySelector('#edit-url');
    const nameInput = modalContent.querySelector('#edit-name');
    const textInput = modalContent.querySelector('#edit-text');
    const colorInput = modalContent.querySelector('#edit-color');
    const imgInput = modalContent.querySelector('#edit-img');
    const cancelBtn = modalContent.querySelector('#modal-cancel');
    const saveBtn = modalContent.querySelector('#modal-save');
    const iconOptions = modalContent.querySelectorAll('.icon-option');
    const colorInputGroup = modalContent.querySelector('#color-input-group');
    const imgInputGroup = modalContent.querySelector('#img-input-group');
    const iconPreview = modalContent.querySelector('#icon-preview');

    let selectedIconType = currentIconType;
    let selectedIconStyle = currentIconStyle;
    let selectedFaviconUrl = '';

    // 图标选项点击处理
    iconOptions.forEach(option => {
        option.addEventListener('click', () => {
            iconOptions.forEach(o => {
                o.style.borderColor = '#ddd';
                o.style.background = '#fff';
            });
            option.style.borderColor = '#4285F4';
            option.style.background = '#f0f7ff';
            
            selectedIconType = option.dataset.type;
            selectedIconStyle = option.dataset.style || '';
            selectedFaviconUrl = option.dataset.url || '';
            
            // 显示/隐藏对应的输入框
            colorInputGroup.style.display = selectedIconType === 'color' ? 'block' : 'none';
            imgInputGroup.style.display = selectedIconType === 'upload' ? 'block' : 'none';
            
            // 更新预览
            updateIconPreview();
        });
    });

    // 颜色和文字变化预览
    colorInput.addEventListener('change', updateIconPreview);
    colorInput.addEventListener('input', updateIconPreview);
    textInput.addEventListener('input', updateIconPreview);
    imgInput.addEventListener('input', updateIconPreview);

    function updateIconPreview() {
        iconPreview.style.color = 'white';
        iconPreview.style.fontSize = '32px';
        iconPreview.style.fontWeight = 'bold';
        
        if (selectedIconType === 'color') {
            iconPreview.style.backgroundImage = 'none';
            iconPreview.style.background = colorInput.value;
            iconPreview.innerText = textInput.value || app.text || app.name[0];
        } else if (selectedIconType === 'upload') {
            iconPreview.style.backgroundImage = `url(${imgInput.value || ''})`;
            iconPreview.style.backgroundColor = '#f0f0f0';
            iconPreview.innerText = '';
        } else if (selectedIconType === 'icon') {
            iconPreview.style.backgroundImage = `url(${selectedFaviconUrl})`;
            iconPreview.style.backgroundSize = 'cover';
            iconPreview.style.backgroundPosition = 'center';
            iconPreview.innerText = '';
            
            // 如果是已保存的图标，使用已有的透明度信息
            if (selectedFaviconUrl === app.img && app.isTransparent !== undefined) {
                iconPreview.style.backgroundColor = app.isTransparent ? 'transparent' : '#f0f0f0';
            } else if (selectedFaviconUrl) {
                // 新选择的favicon，动态检测透明度
                iconPreview.style.backgroundColor = '#f0f0f0'; // 先显示默认背景
                checkImageTransparency(selectedFaviconUrl).then(hasTransparency => {
                    if (hasTransparency) {
                        iconPreview.style.backgroundColor = 'transparent';
                    }
                });
            }
        }
    }

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    saveBtn.addEventListener('click', () => {
        allApps[index].url = urlInput.value.trim() || app.url;
        allApps[index].name = nameInput.value.trim() || app.name;
        allApps[index].iconType = selectedIconType;
        allApps[index].iconStyle = selectedIconStyle;
        
        if (selectedIconType === 'color') {
            allApps[index].text = textInput.value || app.text || app.name[0];
            allApps[index].color = colorInput.value;
            allApps[index].img = '';
            allApps[index].isTransparent = undefined;
            saveAppsToStorage();
            renderGrid();
            document.body.removeChild(modal);
        } else if (selectedIconType === 'upload') {
            allApps[index].img = imgInput.value.trim() || '';
            allApps[index].text = '';
            allApps[index].color = '';
            // 检测上传的图像透明度
            if (allApps[index].img) {
                checkImageTransparency(allApps[index].img).then(hasTransparency => {
                    allApps[index].isTransparent = hasTransparency;
                    saveAppsToStorage();
                    renderGrid();
                });
            } else {
                allApps[index].isTransparent = undefined;
                saveAppsToStorage();
                renderGrid();
            }
            document.body.removeChild(modal);
        } else if (selectedIconType === 'icon') {
            allApps[index].img = selectedFaviconUrl;
            allApps[index].text = '';
            allApps[index].color = '';
            
            // 如果是已保存的图标URL，直接使用已有的透明度信息
            if (selectedFaviconUrl === app.img && app.isTransparent !== undefined) {
                allApps[index].isTransparent = app.isTransparent;
                saveAppsToStorage();
                renderGrid();
                document.body.removeChild(modal);
            } else if (selectedFaviconUrl) {
                // 新选择的网络图标，需要检测透明度
                checkImageTransparency(selectedFaviconUrl).then(hasTransparency => {
                    allApps[index].isTransparent = hasTransparency;
                    saveAppsToStorage();
                    renderGrid();
                });
                document.body.removeChild(modal);
            } else {
                allApps[index].isTransparent = undefined;
                saveAppsToStorage();
                renderGrid();
                document.body.removeChild(modal);
            }
        }
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // 自动聚焦第一个输入框
    urlInput.focus();
}

// 删除应用
function deleteApp(index) {
    allApps.splice(index, 1);
    saveAppsToStorage();
    
    // 如果当前页没有应用了，返回上一页
    const totalPages = Math.ceil(allApps.length / pageSize);
    if (currentPage >= totalPages) {
        currentPage = Math.max(0, totalPages - 1);
    }
    
    renderGrid();
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(allApps.length / pageSize);
    
    if (totalPages <= 1) return;

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (i === currentPage) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            currentPage = i;
            render();
        });
        pagination.appendChild(dot);
    }
}

// ==================== 右键菜单 ====================

function showContextMenu(e, appIndex) {
    // 创建右键菜单
    const contextMenu = document.createElement('div');
    contextMenu.style.cssText = `
        position: fixed;
        top: ${e.clientY}px;
        left: ${e.clientX}px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        min-width: 140px;
        overflow: hidden;
        animation: menuIn 0.15s ease-out;
    `;
    
    const deleteItem = document.createElement('div');
    deleteItem.style.cssText = `
        padding: 12px 16px;
        cursor: pointer;
        color: #ff4444;
        font-size: 14px;
        transition: background 0.15s;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    deleteItem.innerHTML = '🗑️ 删除';
    deleteItem.addEventListener('mouseover', () => {
        deleteItem.style.background = '#f5f5f5';
    });
    deleteItem.addEventListener('mouseout', () => {
        deleteItem.style.background = '';
    });
}

// ==================== 拖拽功能 ====================

function handleDragStart(e) {
    draggedItem = this;
    draggedIndex = parseInt(this.dataset.index);
    
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    // 添加视觉反馈
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
    
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    this.classList.remove('drag-over');
    
    if (draggedItem !== this) {
        const dropIndex = parseInt(this.dataset.index);
        
        // 交换数组中的位置
        const temp = allApps[draggedIndex];
        allApps[draggedIndex] = allApps[dropIndex];
        allApps[dropIndex] = temp;
        
        // 保存到存储
        saveAppsToStorage();
        
        // 重新渲染（保持编辑模式）
        renderGrid();
        renderPagination();
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // 移除所有拖拽样式
    document.querySelectorAll('.app-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    draggedItem = null;
    draggedIndex = null;
}
