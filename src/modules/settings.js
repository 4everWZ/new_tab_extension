// ==================== 设置功能模块 ====================

import { defaultSettings } from '../utils/constants.js';
import StorageManager from './storage.js';

export class SettingsManager {
    constructor() {
        // 侧边栏相关
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.sidebarCloseBtn = document.getElementById('sidebar-close-btn');
        this.settingsTab = document.getElementById('settings-tab');
        this.settingsPanel = document.getElementById('settings-panel');
        
        // 壁纸设置
        this.wallpaperSourceSelect = document.getElementById('wallpaper-source');
        this.wallpaperUploadBtn = document.getElementById('wallpaper-upload-btn');
        this.wallpaperFile = document.getElementById('wallpaper-file');
        this.maskOpacityInput = document.getElementById('mask-opacity');
        this.maskOpacityValue = document.getElementById('mask-opacity-value');
        this.wallpaperBlurInput = document.getElementById('wallpaper-blur');
        this.wallpaperBlurValue = document.getElementById('wallpaper-blur-value');
        
        // 网格设置
        this.gridPresets = document.querySelectorAll('.grid-preset');
        this.customColsItem = document.getElementById('custom-cols-item');
        this.customColsInput = document.getElementById('custom-cols');
        
        // 图标设置
        this.showIconLabelCheckbox = document.getElementById('show-icon-label');
        this.iconShadowCheckbox = document.getElementById('icon-shadow');
        this.iconAnimationCheckbox = document.getElementById('icon-animation');
        this.iconRadiusInput = document.getElementById('icon-radius');
        this.radiusValue = document.getElementById('radius-value');
        this.iconOpacityInput = document.getElementById('icon-opacity');
        this.opacityValue = document.getElementById('opacity-value');
        this.iconSizeInput = document.getElementById('icon-size');
        this.sizeValue = document.getElementById('size-value');
        
        // 搜索框设置
        this.hideSearchBarCheckbox = document.getElementById('hide-search-bar');
        this.searchWidthInput = document.getElementById('search-width');
        this.searchWidthValue = document.getElementById('search-width-value');
        this.searchHeightInput = document.getElementById('search-height');
        this.searchHeightValue = document.getElementById('search-height-value');
        this.searchRadiusInput = document.getElementById('search-radius');
        this.searchRadiusValue = document.getElementById('search-radius-value');
        this.searchOpacityInput = document.getElementById('search-opacity');
        this.searchOpacityValue = document.getElementById('search-opacity-value');
        this.searchTopMarginInput = document.getElementById('search-top-margin');
        this.searchTopMarginValue = document.getElementById('search-top-margin-value');
        
        // 字体设置
        this.textShadowCheckbox = document.getElementById('text-shadow');
        this.textSizeInput = document.getElementById('text-size');
        this.textSizeValue = document.getElementById('text-size-value');
        this.colorBtns = document.querySelectorAll('.color-btn');
        
        // 语言设置
        this.languageSelect = document.getElementById('language-select');
        
        // 壁纸刷新按钮
        this.wallpaperRefreshBtn = document.getElementById('wallpaper-refresh-btn');
        
        this.settings = { ...defaultSettings };
    }

    // 初始化设置
    async loadSettings() {
        console.log('[Settings] Loading settings...');
        
        const result = await StorageManager.loadAllData();
        
        if (result.settings) {
            this.settings = { ...defaultSettings, ...result.settings };
            console.log('[Settings] Loaded settings:', this.settings);
        } else {
            this.settings = { ...defaultSettings };
        }
        
        this.applySettings();
        this.setupSettingsUI();
    }

    // 应用设置
    applySettings() {
        // 应用主题
        if (this.settings.theme === 'dark') {
            document.documentElement.style.setProperty('--bg-color', '#1a1a1a');
            document.documentElement.style.setProperty('--text-color', '#ffffff');
            document.documentElement.style.setProperty('--input-bg', '#2a2a2a');
            document.documentElement.style.setProperty('--border-color', '#444');
        } else {
            document.documentElement.style.setProperty('--bg-color', '#ffffff');
            document.documentElement.style.setProperty('--text-color', '#333333');
            document.documentElement.style.setProperty('--input-bg', '#f9f9f9');
            document.documentElement.style.setProperty('--border-color', '#ddd');
        }
        
        // 应用网格列数
        const gridColumns = this.settings.appGridColumns || 4;
        document.documentElement.style.setProperty('--grid-columns', gridColumns);
        
        // 应用语言
        if (this.settings.language) {
            document.documentElement.lang = this.settings.language;
        }
        
        // 应用壁纸来源
        if (this.settings.wallpaperSource) {
            console.log('[Settings] Wallpaper source set to:', this.settings.wallpaperSource);
        }
        
        console.log('[Settings] Settings applied');
    }

    // 设置 UI 事件
    setupSettingsUI() {
        // 侧边栏切换
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.sidebar.classList.toggle('open');
            });
        }
        
        if (this.sidebarCloseBtn) {
            this.sidebarCloseBtn.addEventListener('click', () => {
                this.sidebar.classList.remove('open');
            });
        }
        
        // 设置选项卡
        if (this.settingsTab) {
            this.settingsTab.addEventListener('click', () => {
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
                this.settingsPanel.classList.add('active');
                this.settingsTab.classList.add('active');
            });
        }
        
        // 壁纸设置
        if (this.wallpaperSourceSelect) {
            this.wallpaperSourceSelect.addEventListener('change', (e) => {
                this.settings.wallpaperSource = e.target.value;
                this.applySettings();
            });
        }
        
        if (this.wallpaperUploadBtn && this.wallpaperFile) {
            this.wallpaperUploadBtn.addEventListener('click', () => {
                this.wallpaperFile.click();
            });
            
            this.wallpaperFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('[Settings] Wallpaper file selected:', file.name);
                }
            });
        }
        
        // 壁纸掩码透明度
        if (this.maskOpacityInput) {
            this.maskOpacityInput.addEventListener('change', (e) => {
                document.documentElement.style.setProperty('--mask-opacity', e.target.value / 100);
                if (this.maskOpacityValue) this.maskOpacityValue.textContent = e.target.value + '%';
            });
        }
        
        // 壁纸模糊
        if (this.wallpaperBlurInput) {
            this.wallpaperBlurInput.addEventListener('change', (e) => {
                document.documentElement.style.setProperty('--wallpaper-blur', e.target.value);
                if (this.wallpaperBlurValue) this.wallpaperBlurValue.textContent = e.target.value + '%';
            });
        }
        
        // 网格列数预设
        if (this.gridPresets.length > 0) {
            this.gridPresets.forEach(preset => {
                preset.addEventListener('click', (e) => {
                    const cols = e.target.dataset.cols;
                    
                    this.gridPresets.forEach(p => p.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (cols === 'custom') {
                        if (this.customColsItem) this.customColsItem.classList.remove('hidden');
                    } else {
                        if (this.customColsItem) this.customColsItem.classList.add('hidden');
                        this.settings.appGridColumns = parseInt(cols);
                        document.documentElement.style.setProperty('--grid-columns', cols);
                    }
                });
            });
        }
        
        // 自定义列数
        if (this.customColsInput) {
            this.customColsInput.addEventListener('change', (e) => {
                this.settings.appGridColumns = parseInt(e.target.value);
                document.documentElement.style.setProperty('--grid-columns', e.target.value);
            });
        }
        
        // 图标设置
        if (this.showIconLabelCheckbox) {
            this.showIconLabelCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.querySelectorAll('.app-name').forEach(el => el.classList.add('hidden'));
                } else {
                    document.querySelectorAll('.app-name').forEach(el => el.classList.remove('hidden'));
                }
            });
        }
        
        if (this.iconShadowCheckbox) {
            this.iconShadowCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.querySelectorAll('.app-icon').forEach(el => el.classList.add('with-shadow'));
                } else {
                    document.querySelectorAll('.app-icon').forEach(el => el.classList.remove('with-shadow'));
                }
            });
        }
        
        if (this.iconAnimationCheckbox) {
            this.iconAnimationCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.querySelectorAll('.app-icon').forEach(el => el.classList.add('with-animation'));
                } else {
                    document.querySelectorAll('.app-icon').forEach(el => el.classList.remove('with-animation'));
                }
            });
        }
        
        if (this.iconRadiusInput) {
            this.iconRadiusInput.addEventListener('change', (e) => {
                const value = e.target.value;
                document.documentElement.style.setProperty('--icon-radius', value + '%');
                if (this.radiusValue) this.radiusValue.textContent = value + '%';
            });
        }
        
        if (this.iconOpacityInput) {
            this.iconOpacityInput.addEventListener('change', (e) => {
                const value = e.target.value / 100;
                document.documentElement.style.setProperty('--icon-opacity', value);
                if (this.opacityValue) this.opacityValue.textContent = e.target.value + '%';
            });
        }
        
        if (this.iconSizeInput) {
            this.iconSizeInput.addEventListener('change', (e) => {
                const value = e.target.value;
                document.documentElement.style.setProperty('--icon-size', value + 'px');
                if (this.sizeValue) this.sizeValue.textContent = Math.round(value / 100 * 100) + '%';
            });
        }
        
        // 搜索框设置
        if (this.hideSearchBarCheckbox) {
            this.hideSearchBarCheckbox.addEventListener('change', (e) => {
                const searchBox = document.querySelector('.search-box');
                if (searchBox) {
                    if (e.target.checked) {
                        searchBox.classList.add('hidden');
                    } else {
                        searchBox.classList.remove('hidden');
                    }
                }
            });
        }
        
        if (this.searchWidthInput) {
            this.searchWidthInput.addEventListener('change', (e) => {
                document.documentElement.style.setProperty('--search-width', e.target.value + '%');
                if (this.searchWidthValue) this.searchWidthValue.textContent = e.target.value + '%';
            });
        }
        
        if (this.searchHeightInput) {
            this.searchHeightInput.addEventListener('change', (e) => {
                document.documentElement.style.setProperty('--search-height', e.target.value + 'px');
                if (this.searchHeightValue) this.searchHeightValue.textContent = e.target.value + 'px';
            });
        }
        
        if (this.searchRadiusInput) {
            this.searchRadiusInput.addEventListener('change', (e) => {
                document.documentElement.style.setProperty('--search-radius', e.target.value + 'px');
                if (this.searchRadiusValue) this.searchRadiusValue.textContent = e.target.value + 'px';
            });
        }
        
        if (this.searchOpacityInput) {
            this.searchOpacityInput.addEventListener('change', (e) => {
                document.documentElement.style.setProperty('--search-opacity', e.target.value / 100);
                if (this.searchOpacityValue) this.searchOpacityValue.textContent = e.target.value + '%';
            });
        }
        
        if (this.searchTopMarginInput) {
            this.searchTopMarginInput.addEventListener('change', (e) => {
                const searchBox = document.querySelector('.search-box-wrapper');
                if (searchBox) {
                    searchBox.style.marginTop = e.target.value + 'px';
                }
                if (this.searchTopMarginValue) this.searchTopMarginValue.textContent = e.target.value + 'px';
            });
        }
        
        // 文本设置
        if (this.textShadowCheckbox) {
            this.textShadowCheckbox.addEventListener('change', (e) => {
                const value = e.target.checked ? '0 2px 4px rgba(0, 0, 0, 0.4)' : 'none';
                document.documentElement.style.setProperty('--text-shadow-enabled', value);
            });
        }
        
        if (this.textSizeInput) {
            this.textSizeInput.addEventListener('change', (e) => {
                document.documentElement.style.setProperty('--text-size', e.target.value + 'px');
                if (this.textSizeValue) this.textSizeValue.textContent = e.target.value + 'px';
            });
        }
        
        // 文本颜色
        if (this.colorBtns.length > 0) {
            this.colorBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const color = e.target.dataset.color;
                    document.documentElement.style.setProperty('--text-color', color);
                    
                    this.colorBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                });
            });
        }
        
        // 语言设置
        if (this.languageSelect) {
            this.languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                document.documentElement.lang = e.target.value;
            });
        }
        
        // 壁纸刷新按钮
        if (this.wallpaperRefreshBtn) {
            this.wallpaperRefreshBtn.addEventListener('click', () => {
                console.log('[Settings] Refreshing wallpaper');
                window.location.reload();
            });
        }
        
        console.log('[Settings] UI setup completed');
    }

    // 保存设置
    async saveSettings() {
        await StorageManager.saveSettings(this.settings);
        console.log('[Settings] Settings saved:', this.settings);
    }

    // 重置设置
    async resetSettings() {
        this.settings = { ...defaultSettings };
        await StorageManager.saveSettings(this.settings);
        this.applySettings();
        console.log('[Settings] Settings reset to default');
    }
}

export default SettingsManager;
