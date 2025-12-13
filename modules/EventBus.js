/**
 * 事件系统 - 用于模块间通信，实现解耦
 */

class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * 注册事件监听
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        // 返回卸载函数
        return () => this.off(eventName, callback);
    }

    /**
     * 只监听一次
     */
    once(eventName, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(eventName, wrapper);
        };
        this.on(eventName, wrapper);
    }

    /**
     * 移除事件监听
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    /**
     * 触发事件
     */
    emit(eventName, ...args) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`[EventBus] Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * 清除所有事件
     */
    clear() {
        this.events = {};
    }

    /**
     * 清除指定事件的所有监听
     */
    clearEvent(eventName) {
        delete this.events[eventName];
    }
}

// 导出单例
export default new EventBus();

/**
 * 预定义的事件常量
 */
export const EVENTS = {
    // 数据事件
    APPS_CHANGED: 'apps:changed',
    APP_ADDED: 'app:added',
    APP_UPDATED: 'app:updated',
    APP_DELETED: 'app:deleted',

    // 设置事件
    SETTINGS_CHANGED: 'settings:changed',
    WALLPAPER_SOURCE_CHANGED: 'settings:wallpaperSource:changed',

    // 壁纸事件
    WALLPAPER_LOADED: 'wallpaper:loaded',
    WALLPAPER_LOAD_FAILED: 'wallpaper:loadFailed',

    // 搜索事件
    SEARCH_ENGINE_CHANGED: 'search:engineChanged',
    SEARCH_TYPE_CHANGED: 'search:typeChanged',

    // UI 事件
    EDIT_MODE_ENTERED: 'ui:editModeEntered',
    EDIT_MODE_EXITED: 'ui:editModeExited',
    SIDEBAR_OPENED: 'ui:sidebarOpened',
    SIDEBAR_CLOSED: 'ui:sidebarClosed',

    // 页面事件
    PAGE_CHANGED: 'page:changed',

    // 通用事件
    READY: 'app:ready',
    ERROR: 'app:error'
};
