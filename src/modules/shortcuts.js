// ==================== 快捷方式功能模块 ====================

import { defaultApps, pageSize } from '../utils/constants.js';
import { convertImageToDataUrl } from '../utils/image.js';
import StorageManager from './storage.js';

export class ShortcutManager {
    constructor() {
        // 应用容器（显示应用网格）
        this.appsContainer = document.getElementById('grid');
        
        // 添加快捷方式表单元素
        this.shortcutForm = document.getElementById('shortcut-form');
        this.appNameInput = document.getElementById('app-name');
        this.appUrlInput = document.getElementById('app-url');
        this.appTextInput = document.getElementById('app-text');
        this.appColorInput = document.getElementById('app-color');
        this.appImageInput = document.getElementById('app-image');
        this.imagePreview = document.getElementById('image-preview');
        this.parseUrlBtn = document.getElementById('parse-url-btn');
        
        // 图标类型选择
        this.iconTypeRadios = document.querySelectorAll('input[name="icon-type"]');
        this.textIconOptions = document.getElementById('text-icon-options');
        this.uploadIconOptions = document.getElementById('upload-icon-options');
        
        this.apps = [];
        this.uploadedImageData = null;
        this.currentPage = 0;
        
        if (!this.appsContainer) {
            console.warn('[Shortcuts] Apps container (#grid) not found');
        }
        if (!this.shortcutForm) {
            console.warn('[Shortcuts] Shortcut form not found');
        }
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
        this.setupAddAppForm();
    }

    // 渲染快捷方式
    renderApps() {
        if (!this.appsContainer) {
            console.warn('[Shortcuts] Apps container not found, cannot render');
            return;
        }
        
        this.appsContainer.innerHTML = '';
        
        this.apps.forEach((app, index) => {
            const appElement = document.createElement('div');
            appElement.className = 'app-item';
            appElement.draggable = true;
            
            const icon = this.getAppIconHtml(app);
            
            appElement.innerHTML = `
                <div class="app-icon">${icon}</div>
                <div class="app-name" title="${app.name}">${app.name}</div>
                <div class="app-actions">
                    <button class="app-edit-btn" data-index="${index}">✎</button>
                    <button class="app-delete-btn" data-index="${index}">×</button>
                </div>
            `;
            
            // 拖拽事件
            appElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index);
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
                this.reorderApps(fromIndex, index);
            });
            
            // 编辑事件 - 在表单中填充数据
            appElement.querySelector('.app-edit-btn').addEventListener('click', () => {
                const app = this.apps[index];
                document.getElementById('app-name').value = app.name;
                document.getElementById('app-url').value = app.url;
                
                if (app.icon && app.icon.startsWith('data:')) {
                    document.querySelector('input[name="icon-type"][value="upload"]').checked = true;
                    this.uploadedImageData = app.icon;
                    const imagePreview = document.getElementById('image-preview');
                    if (imagePreview) {
                        imagePreview.innerHTML = `<img src="${app.icon}" alt="preview" style="max-width: 100%; max-height: 100px; margin-top: 8px;">`;
                    }
                    this.textIconOptions.classList.add('hidden');
                    this.uploadIconOptions.classList.remove('hidden');
                } else {
                    document.querySelector('input[name="icon-type"][value="text"]').checked = true;
                    document.getElementById('app-color').value = app.color || '#0084ff';
                    document.getElementById('app-text').value = app.text || '';
                    this.textIconOptions.classList.remove('hidden');
                    this.uploadIconOptions.classList.add('hidden');
                }
                
                // 滚动到表单
                document.getElementById('add-panel').scrollIntoView({ behavior: 'smooth' });
            });
            
            // 删除事件
            appElement.querySelector('.app-delete-btn').addEventListener('click', () => {
                this.deleteApp(index);
            });
            
            // 点击打开
            appElement.querySelector('.app-icon').addEventListener('click', () => {
                window.open(app.url, '_blank');
            });
            
            this.appsContainer.appendChild(appElement);
        });
        
        console.log('[Shortcuts] Rendered', this.apps.length, 'apps');
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

    // 设置添加应用表单
    setupAddAppForm() {
        if (!this.shortcutForm) {
            console.warn('[Shortcuts] Shortcut form not found');
            return;
        }
        
        // 表单提交
        this.shortcutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveApp();
        });
        
        // 图标类型切换
        this.iconTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'text') {
                    this.textIconOptions.classList.remove('hidden');
                    this.uploadIconOptions.classList.add('hidden');
                } else {
                    this.textIconOptions.classList.add('hidden');
                    this.uploadIconOptions.classList.remove('hidden');
                }
            });
        });
        
        // 解析 URL 按钮
        if (this.parseUrlBtn) {
            this.parseUrlBtn.addEventListener('click', () => {
                this.parseUrl();
            });
        }
        
        // 图片上传
        if (this.appImageInput) {
            this.appImageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }
        
        console.log('[Shortcuts] Add app form setup completed');
    }

    // 处理图像上传
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const dataUrl = event.target.result;
                const imagePreview = document.getElementById('image-preview');
                if (imagePreview) {
                    imagePreview.innerHTML = `<img src="${dataUrl}" alt="preview" style="max-width: 100%; max-height: 100px; margin-top: 8px;">`;
                }
                
                // 保存base64数据以便后续使用
                this.uploadedImageData = dataUrl;
                console.log('[Shortcuts] Image uploaded successfully');
            } catch (error) {
                console.error('[Shortcuts] Failed to upload image:', error);
            }
        };
        reader.readAsDataURL(file);
    }

    // 解析 URL
    parseUrl() {
        const urlInput = document.getElementById('app-url');
        const nameInput = document.getElementById('app-name');
        
        if (!urlInput.value) {
            alert('Please enter URL first');
            return;
        }
        
        try {
            const url = new URL(urlInput.value.startsWith('http') ? urlInput.value : `https://${urlInput.value}`);
            const hostname = url.hostname.replace('www.', '');
            const name = hostname.split('.')[0];
            nameInput.value = name.charAt(0).toUpperCase() + name.slice(1);
            console.log('[Shortcuts] Parsed URL:', name);
        } catch (error) {
            alert('Invalid URL format');
            console.error('[Shortcuts] Failed to parse URL:', error);
        }
    }

    // 保存应用
    async saveApp() {
        const nameInput = document.getElementById('app-name');
        const urlInput = document.getElementById('app-url');
        const textInput = document.getElementById('app-text');
        const colorInput = document.getElementById('app-color');
        const iconTypeRadios = document.querySelectorAll('input[name="icon-type"]');
        
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        
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
        const iconType = Array.from(iconTypeRadios).find(r => r.checked).value;
        if (iconType === 'text') {
            app.color = colorInput.value;
            app.text = (textInput.value || name.charAt(0)).toUpperCase();
        } else if (iconType === 'upload' && this.uploadedImageData) {
            app.icon = this.uploadedImageData;
        }
        
        // 添加或编辑
        const existingIndex = this.apps.findIndex(a => a.name === app.name);
        if (existingIndex === -1) {
            this.apps.push(app);
        } else {
            this.apps[existingIndex] = app;
        }
        
        // 保存到存储
        const appsObj = {};
        this.apps.forEach((a, idx) => {
            appsObj[`app_${idx}`] = a;
        });
        await StorageManager.saveApps(appsObj);
        
        console.log('[Shortcuts] Saved app:', name);
        
        // 清空表单
        this.shortcutForm.reset();
        this.uploadedImageData = null;
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) imagePreview.innerHTML = '';
        
        this.renderApps();
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
}

export default ShortcutManager;
