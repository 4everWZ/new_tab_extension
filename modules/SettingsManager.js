/**
 * 设置管理模块 - 处理应用设置和配置
 */

import dataManager from './DataManager.js';

class SettingsManager {
    constructor() {
        this.settingsCallbacks = [];
    }

    /**
     * 更新单个设置
     */
    updateSetting(key, value) {
        return dataManager.updateSetting(key, value).then(() => {
            this.notifySettingsChanged(key, value);
        });
    }

    /**
     * 批量更新设置
     */
    updateSettings(updates) {
        return dataManager.updateSettings(updates).then(() => {
            Object.entries(updates).forEach(([key, value]) => {
                this.notifySettingsChanged(key, value);
            });
        });
    }

    /**
     * 获取设置
     */
    getSetting(key) {
        return dataManager.getSetting(key);
    }

    /**
     * 获取所有设置
     */
    getAllSettings() {
        return dataManager.getSettings();
    }

    /**
     * 设置网格列数
     */
    setGridCols(cols) {
        return this.updateSetting('gridCols', cols);
    }

    /**
     * 获取网格列数
     */
    getGridCols() {
        return this.getSetting('gridCols');
    }

    /**
     * 设置图标半径
     */
    setIconRadius(radius) {
        return this.updateSetting('iconRadius', radius);
    }

    /**
     * 设置图标不透明度
     */
    setIconOpacity(opacity) {
        return this.updateSetting('iconOpacity', opacity);
    }

    /**
     * 设置图标大小
     */
    setIconSize(size) {
        return this.updateSetting('iconSize', size);
    }

    /**
     * 设置图标阴影
     */
    setIconShadow(enabled) {
        return this.updateSetting('iconShadow', enabled);
    }

    /**
     * 设置图标动画
     */
    setIconAnimation(enabled) {
        return this.updateSetting('iconAnimation', enabled);
    }

    /**
     * 显示/隐藏图标标签
     */
    setShowIconLabel(show) {
        return this.updateSetting('showIconLabel', show);
    }

    /**
     * 设置搜索框宽度
     */
    setSearchWidth(width) {
        return this.updateSetting('searchWidth', width);
    }

    /**
     * 设置搜索框高度
     */
    setSearchHeight(height) {
        return this.updateSetting('searchHeight', height);
    }

    /**
     * 设置搜索框半径
     */
    setSearchRadius(radius) {
        return this.updateSetting('searchRadius', radius);
    }

    /**
     * 设置搜索框不透明度
     */
    setSearchOpacity(opacity) {
        return this.updateSetting('searchOpacity', opacity);
    }

    /**
     * 设置搜索框顶部边距
     */
    setSearchTopMargin(margin) {
        return this.updateSetting('searchTopMargin', margin);
    }

    /**
     * 隐藏/显示搜索栏
     */
    setHideSearchBar(hide) {
        return this.updateSetting('hideSearchBar', hide);
    }

    /**
     * 设置壁纸源
     */
    setWallpaperSource(source) {
        return this.updateSetting('wallpaperSource', source);
    }

    /**
     * 获取壁纸源
     */
    getWallpaperSource() {
        return this.getSetting('wallpaperSource');
    }

    /**
     * 设置遮罩不透明度
     */
    setMaskOpacity(opacity) {
        return this.updateSetting('maskOpacity', opacity);
    }

    /**
     * 获取遮罩不透明度
     */
    getMaskOpacity() {
        return this.getSetting('maskOpacity');
    }

    /**
     * 设置壁纸模糊度
     */
    setWallpaperBlur(blur) {
        return this.updateSetting('wallpaperBlur', blur);
    }

    /**
     * 获取壁纸模糊度
     */
    getWallpaperBlur() {
        return this.getSetting('wallpaperBlur');
    }

    /**
     * 设置文字阴影
     */
    setTextShadow(enabled) {
        return this.updateSetting('textShadow', enabled);
    }

    /**
     * 设置文字大小
     */
    setTextSize(size) {
        return this.updateSetting('textSize', size);
    }

    /**
     * 设置文字颜色
     */
    setTextColor(color) {
        return this.updateSetting('textColor', color);
    }

    /**
     * 获取文字颜色
     */
    getTextColor() {
        return this.getSetting('textColor');
    }

    /**
     * 注册设置变更回调
     */
    onChange(callback) {
        this.settingsCallbacks.push(callback);
    }

    /**
     * 通知设置变更
     */
    notifySettingsChanged(key, value) {
        this.settingsCallbacks.forEach(callback => {
            callback(key, value);
        });
    }

    /**
     * 获取所有设置用于 UI 初始化
     */
    getSettingsForUI() {
        const settings = this.getAllSettings();
        return {
            // 图标设置
            iconRadius: settings.iconRadius,
            iconOpacity: settings.iconOpacity,
            iconSize: settings.iconSize,
            iconShadow: settings.iconShadow,
            iconAnimation: settings.iconAnimation,
            showIconLabel: settings.showIconLabel,

            // 搜索框设置
            searchWidth: settings.searchWidth,
            searchHeight: settings.searchHeight,
            searchRadius: settings.searchRadius,
            searchOpacity: settings.searchOpacity,
            searchTopMargin: settings.searchTopMargin,
            hideSearchBar: settings.hideSearchBar,

            // 壁纸设置
            wallpaperSource: settings.wallpaperSource,
            maskOpacity: settings.maskOpacity,
            wallpaperBlur: settings.wallpaperBlur,

            // 文字设置
            textShadow: settings.textShadow,
            textSize: settings.textSize,
            textColor: settings.textColor,

            // 布局设置
            gridCols: settings.gridCols
        };
    }
}

export default new SettingsManager();
