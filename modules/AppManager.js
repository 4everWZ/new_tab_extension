/**
 * 应用管理模块 - 处理快捷方式应用的相关功能
 */

import dataManager from './DataManager.js';

class AppManager {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 12;
        this.editingItemIndex = null;
        this.draggedItem = null;
        this.draggedIndex = null;
    }

    /**
     * 设置分页大小
     */
    setPageSize(size) {
        this.pageSize = size;
        this.currentPage = 0;
    }

    /**
     * 获取总页数
     */
    getTotalPages() {
        const apps = dataManager.getApps();
        return Math.ceil(apps.length / this.pageSize);
    }

    /**
     * 设置当前页
     */
    setCurrentPage(page) {
        const totalPages = this.getTotalPages();
        if (page >= 0 && page < totalPages) {
            this.currentPage = page;
            return true;
        }
        return false;
    }

    /**
     * 获取当前页
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 获取当前页的应用
     */
    getCurrentPageApps() {
        const apps = dataManager.getApps();
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return apps.slice(startIndex, endIndex);
    }

    /**
     * 获取所有应用
     */
    getAllApps() {
        return dataManager.getApps();
    }

    /**
     * 获取应用总数
     */
    getTotalAppCount() {
        return dataManager.getApps().length;
    }

    /**
     * 添加应用
     */
    addApp(app) {
        return dataManager.addApp(app);
    }

    /**
     * 更新应用
     */
    updateApp(index, app) {
        return dataManager.updateApp(index, app);
    }

    /**
     * 删除应用
     */
    deleteApp(index) {
        return dataManager.deleteApp(index);
    }

    /**
     * 获取应用
     */
    getApp(index) {
        return dataManager.getApp(index);
    }

    /**
     * 搜索应用
     */
    searchApps(keyword) {
        const apps = dataManager.getApps();
        const lowerKeyword = keyword.toLowerCase();
        return apps.filter(app =>
            app.name.toLowerCase().includes(lowerKeyword) ||
            app.url.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * 进入编辑模式
     */
    enterEditMode(index) {
        this.editingItemIndex = index;
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        this.editingItemIndex = null;
    }

    /**
     * 是否在编辑模式
     */
    isInEditMode() {
        return this.editingItemIndex !== null;
    }

    /**
     * 获取编辑项索引
     */
    getEditingItemIndex() {
        return this.editingItemIndex;
    }

    /**
     * 设置拖拽项
     */
    setDraggedItem(item, index) {
        this.draggedItem = item;
        this.draggedIndex = index;
    }

    /**
     * 获取拖拽项
     */
    getDraggedItem() {
        return {
            item: this.draggedItem,
            index: this.draggedIndex
        };
    }

    /**
     * 清除拖拽项
     */
    clearDraggedItem() {
        this.draggedItem = null;
        this.draggedIndex = null;
    }

    /**
     * 交换应用位置
     */
    swapApps(index1, index2) {
        const apps = dataManager.getApps();
        if (index1 >= 0 && index1 < apps.length && index2 >= 0 && index2 < apps.length) {
            [apps[index1], apps[index2]] = [apps[index2], apps[index1]];
            return dataManager.saveApps();
        }
        return Promise.reject('Invalid indices');
    }

    /**
     * 批量删除应用
     */
    deleteMultipleApps(indices) {
        const apps = dataManager.getApps();
        // 从高到低删除，避免索引变化
        indices.sort((a, b) => b - a).forEach(index => {
            if (index >= 0 && index < apps.length) {
                apps.splice(index, 1);
            }
        });
        return dataManager.saveApps();
    }

    /**
     * 获取指定索引应用的全局索引（考虑分页）
     */
    getGlobalAppIndex(pageIndex) {
        return this.currentPage * this.pageSize + pageIndex;
    }

    /**
     * 获取应用的页码和页内索引
     */
    getAppPageInfo(globalIndex) {
        return {
            page: Math.floor(globalIndex / this.pageSize),
            pageIndex: globalIndex % this.pageSize
        };
    }
}

export default new AppManager();
