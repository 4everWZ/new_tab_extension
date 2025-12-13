// ==================== 设置功能模块 ====================

import { defaultSettings, searchEngines } from '../utils/constants.js';
import StorageManager from './storage.js';

export class SettingsManager {
    constructor() {
        this.settingsModal = document.getElementById('settings-modal');
        this.wallpaperSourceSelect = document.getElementById('wallpaper-source');
        this.appGridColumnsInput = document.getElementById('app-grid-columns');
        this.themeSwitchCheckbox = document.getElementById('theme-switch');
        this.languageSelect = document.getElementById('language-select');
        this.settingsSaveBtn = document.getElementById('settings-save-btn');
        this.settingsCancelBtn = document.getElementById('settings-cancel-btn');
        this.settingsResetBtn = document.getElementById('settings-reset-btn');
        this.settingsBtn = document.getElementById('settings-btn');
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
        this.setupSettingsModal();
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

    // 设置设置模态框
    setupSettingsModal() {
        // 从设置中填充表单
        this.wallpaperSourceSelect.value = this.settings.wallpaperSource || 'bing';
        this.appGridColumnsInput.value = this.settings.appGridColumns || 4;
        this.themeSwitchCheckbox.checked = this.settings.theme === 'dark';
        this.languageSelect.value = this.settings.language || 'en';
        
        // 设置按钮事件
        this.settingsBtn.addEventListener('click', () => {
            this.showSettingsModal();
        });
        
        this.settingsSaveBtn.addEventListener('click', () => {
            this.saveSettings();
        });
        
        this.settingsCancelBtn.addEventListener('click', () => {
            this.closeSettingsModal();
        });
        
        this.settingsResetBtn.addEventListener('click', () => {
            if (confirm('Reset all settings to default?')) {
                this.resetSettings();
            }
        });
        
        // 壁纸刷新按钮
        if (this.wallpaperRefreshBtn) {
            this.wallpaperRefreshBtn.addEventListener('click', () => {
                console.log('[Settings] Refreshing wallpaper');
                window.location.reload();
            });
        }
        
        // 实时更新预览
        this.themeSwitchCheckbox.addEventListener('change', () => {
            const newTheme = this.themeSwitchCheckbox.checked ? 'dark' : 'light';
            const oldTheme = this.settings.theme;
            this.settings.theme = newTheme;
            this.applySettings();
        });
        
        this.appGridColumnsInput.addEventListener('change', () => {
            const columns = parseInt(this.appGridColumnsInput.value) || 4;
            this.settings.appGridColumns = columns;
            this.applySettings();
        });
    }

    // 显示设置模态框
    showSettingsModal() {
        this.settingsModal.classList.add('show');
        
        // 重新填充表单（以防用户没有保存就关闭）
        this.wallpaperSourceSelect.value = this.settings.wallpaperSource || 'bing';
        this.appGridColumnsInput.value = this.settings.appGridColumns || 4;
        this.themeSwitchCheckbox.checked = this.settings.theme === 'dark';
        this.languageSelect.value = this.settings.language || 'en';
    }

    // 保存设置
    async saveSettings() {
        this.settings.wallpaperSource = this.wallpaperSourceSelect.value;
        this.settings.appGridColumns = parseInt(this.appGridColumnsInput.value) || 4;
        this.settings.theme = this.themeSwitchCheckbox.checked ? 'dark' : 'light';
        this.settings.language = this.languageSelect.value;
        
        await StorageManager.saveSettings(this.settings);
        
        this.applySettings();
        
        console.log('[Settings] Settings saved:', this.settings);
        
        this.closeSettingsModal();
    }

    // 重置设置
    async resetSettings() {
        this.settings = { ...defaultSettings };
        
        await StorageManager.saveSettings(this.settings);
        
        this.applySettings();
        
        // 更新表单
        this.wallpaperSourceSelect.value = this.settings.wallpaperSource || 'bing';
        this.appGridColumnsInput.value = this.settings.appGridColumns || 4;
        this.themeSwitchCheckbox.checked = this.settings.theme === 'dark';
        this.languageSelect.value = this.settings.language || 'en';
        
        console.log('[Settings] Settings reset to default');
        
        alert('Settings reset to default');
    }

    // 关闭设置模态框
    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }
}

export default SettingsManager;
