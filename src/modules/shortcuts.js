// ==================== 快捷方式功能模块 ====================

import { defaultApps, pageSize } from '../utils/constants.js';
import { convertImageToDataUrl } from '../utils/image.js';
import StorageManager from './storage.js';

export class ShortcutManager {
    constructor() {
        this.appsContainer = document.getElementById('apps-container');
        this.addAppBtn = document.getElementById('add-app-btn');
        this.appModal = document.getElementById('app-modal');
        this.appNameInput = document.getElementById('app-name-input');
        this.appUrlInput = document.getElementById('app-url-input');
        this.appIconInput = document.getElementById('app-icon-input');
        this.appIconSelect = document.getElementById('app-icon-select');
        this.appIconColorInput = document.getElementById('app-icon-color-input');
        this.appIconTextInput = document.getElementById('app-icon-text-input');
        this.appIconPreview = document.getElementById('app-icon-preview');
        
        this.apps = [];
        this.editingAppKey = null;
        this.currentPage = 0;
    }

    // 初始化快捷方式
    async loadApps() {
        console.log('[Shortcuts] Loading apps...');
        
        const result = await StorageManager.loadAllData();
        
        // 使用保存的应用或默认应用
        if (result.apps && Object.keys(result.apps).length > 0) {
            this.apps = Object.values(result.apps);
            console.log('[Shortcuts] Loaded', this.apps.length, 'apps from storage');
        } else {
            this.apps = Object.values(defaultApps);
            await StorageManager.saveApps(defaultApps);
            console.log('[Shortcuts] Using default apps');
        }
        
        this.renderApps();
        this.setupAddAppButton();
    }

    // 渲染快捷方式
    renderApps() {
        this.appsContainer.innerHTML = '';
        
        const start = this.currentPage * pageSize;
        const end = start + pageSize;
        const appsToShow = this.apps.slice(start, end);
        
        appsToShow.forEach((app, index) => {
            const appElement = document.createElement('div');
            appElement.className = 'app-item';
            appElement.draggable = true;
            
            const icon = this.getAppIconHtml(app);
            const realIndex = start + index;
            
            appElement.innerHTML = `
                <div class="app-icon">${icon}</div>
                <div class="app-name" title="${app.name}">${app.name}</div>
                <div class="app-actions">
                    <button class="app-edit-btn" data-index="${realIndex}">✎</button>
                    <button class="app-delete-btn" data-index="${realIndex}">×</button>
                </div>
            `;
            
            // 拖拽事件
            appElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', realIndex);
            });
            
            appElement.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                appElement.classList.add('drag-over');
            });
            
            appElement.addEventListener('dragleave', () => {
                appElement.classList.remove('drag-over');
            });
            
            appElement.addEventListener('drop', (e) => {
                e.preventDefault();
                appElement.classList.remove('drag-over');
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                this.reorderApps(fromIndex, realIndex);
            });
            
            // 编辑和删除事件
            appElement.querySelector('.app-edit-btn').addEventListener('click', () => {
                this.editAppIcon(realIndex);
            });
            
            appElement.querySelector('.app-delete-btn').addEventListener('click', () => {
                this.deleteApp(realIndex);
            });
            
            // 点击打开
            appElement.querySelector('.app-icon').addEventListener('click', () => {
                window.open(app.url, '_blank');
            });
            
            this.appsContainer.appendChild(appElement);
        });
    }

    // 获取应用图标 HTML
    getAppIconHtml(app) {
        if (app.icon && app.icon.startsWith('data:')) {
            return `<img src="${app.icon}" alt="${app.name}">`;
        } else if (app.icon && app.icon.includes('<span')) {
            return app.icon;
        } else {
            return `<span class="text-icon" style="background-color: ${app.color || '#42b883'};">${app.text || app.name.charAt(0).toUpperCase()}</span>`;
        }
    }

    // 设置添加应用按钮
    setupAddAppButton() {
        this.addAppBtn.addEventListener('click', () => {
            this.editingAppKey = null;
            this.showAppModal();
        });
    }

    // 显示应用模态框
    showAppModal() {
        this.appNameInput.value = '';
        this.appUrlInput.value = '';
        this.appIconInput.value = '';
        this.appIconSelect.value = 'text';
        this.appIconColorInput.value = '#42b883';
        this.appIconTextInput.value = '';
        this.updateIconPreview();
        this.appModal.classList.add('show');
        
        if (!this.appModal.dataset.setupDone) {
            this.setupAppForm();
            this.appModal.dataset.setupDone = 'true';
        }
    }

    // 设置应用表单
    setupAppForm() {
        const saveBtn = document.getElementById('app-save-btn');
        const cancelBtn = document.getElementById('app-cancel-btn');
        
        saveBtn.addEventListener('click', () => this.saveApp());
        cancelBtn.addEventListener('click', () => this.closeAppModal());
        
        this.appIconSelect.addEventListener('change', (e) => {
            if (e.target.value === 'upload') {
                this.appIconInput.click();
            } else {
                this.updateIconPreview();
            }
        });
        
        this.appIconInput.addEventListener('change', (e) => {
            this.handleAppIconUpload(e);
        });
        
        this.appIconColorInput.addEventListener('change', () => {
            this.updateIconPreview();
        });
        
        this.appIconTextInput.addEventListener('input', () => {
            this.updateIconPreview();
        });
    }

    // 更新图标预览
    updateIconPreview() {
        const iconType = this.appIconSelect.value;
        
        if (iconType === 'text') {
            const color = this.appIconColorInput.value;
            const text = (this.appIconTextInput.value || this.appNameInput.value.charAt(0) || 'A').toUpperCase();
            this.appIconPreview.innerHTML = `<span class="text-icon" style="background-color: ${color};">${text}</span>`;
        } else if (iconType === 'upload' && this.appIconInput.value) {
            // 上传中...
        }
    }

    // 处理应用图标上传
    async handleAppIconUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const dataUrl = event.target.result;
                this.appIconSelect.value = 'uploaded';
                this.appIconSelect.dataset.uploadedDataUrl = dataUrl;
                
                const img = new Image();
                img.onload = () => {
                    this.appIconPreview.innerHTML = `<img src="${dataUrl}" alt="icon">`;
                };
                img.onerror = () => {
                    alert('Failed to load image');
                };
                img.src = dataUrl;
                
                console.log('[Shortcuts] Icon uploaded successfully');
            } catch (error) {
                console.error('[Shortcuts] Failed to upload icon:', error);
            }
        };
        reader.readAsDataURL(file);
    }

    // 编辑应用图标
    editAppIcon(index) {
        this.editingAppKey = index;
        const app = this.apps[index];
        
        this.appNameInput.value = app.name;
        this.appUrlInput.value = app.url;
        
        if (app.icon && app.icon.startsWith('data:')) {
            this.appIconSelect.value = 'uploaded';
            this.appIconSelect.dataset.uploadedDataUrl = app.icon;
            this.appIconPreview.innerHTML = `<img src="${app.icon}" alt="icon">`;
        } else {
            this.appIconSelect.value = 'text';
            this.appIconColorInput.value = app.color || '#42b883';
            this.appIconTextInput.value = app.text || '';
            this.updateIconPreview();
        }
        
        this.appModal.classList.add('show');
    }

    // 保存应用
    async saveApp() {
        const name = this.appNameInput.value.trim();
        const url = this.appUrlInput.value.trim();
        
        if (!name || !url) {
            alert('Please enter app name and URL');
            return;
        }
        
        // 验证 URL
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            alert('Invalid URL');
            return;
        }
        
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        
        const app = {
            name,
            url: finalUrl
        };
        
        // 处理图标
        if (this.appIconSelect.value === 'text') {
            app.color = this.appIconColorInput.value;
            app.text = (this.appIconTextInput.value || name.charAt(0)).toUpperCase();
        } else if (this.appIconSelect.value === 'uploaded' && this.appIconSelect.dataset.uploadedDataUrl) {
            app.icon = this.appIconSelect.dataset.uploadedDataUrl;
        }
        
        // 添加或编辑
        if (this.editingAppKey === null) {
            this.apps.push(app);
        } else {
            this.apps[this.editingAppKey] = app;
        }
        
        // 保存到存储
        const appsObj = {};
        this.apps.forEach((a, idx) => {
            appsObj[`app_${idx}`] = a;
        });
        await StorageManager.saveApps(appsObj);
        
        console.log('[Shortcuts] Saved app:', name);
        
        this.renderApps();
        this.closeAppModal();
    }

    // 删除应用
    async deleteApp(index) {
        if (confirm('Delete this shortcut?')) {
            this.apps.splice(index, 1);
            
            // 保存到存储
            const appsObj = {};
            this.apps.forEach((a, idx) => {
                appsObj[`app_${idx}`] = a;
            });
            await StorageManager.saveApps(appsObj);
            
            console.log('[Shortcuts] Deleted app at index:', index);
            this.renderApps();
        }
    }

    // 重新排序应用
    async reorderApps(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        const [app] = this.apps.splice(fromIndex, 1);
        this.apps.splice(toIndex, 0, app);
        
        // 保存到存储
        const appsObj = {};
        this.apps.forEach((a, idx) => {
            appsObj[`app_${idx}`] = a;
        });
        await StorageManager.saveApps(appsObj);
        
        console.log('[Shortcuts] Reordered apps');
        this.renderApps();
    }

    // 关闭应用模态框
    closeAppModal() {
        this.appModal.classList.remove('show');
        this.editingAppKey = null;
    }
}

export default ShortcutManager;
