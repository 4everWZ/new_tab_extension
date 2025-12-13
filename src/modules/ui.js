// ==================== UI 交互模块 ====================

export class UIManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.appTab = document.getElementById('app-tab');
        this.wallpaperTab = document.getElementById('wallpaper-tab');
        this.appContent = document.getElementById('app-content');
        this.wallpaperContent = document.getElementById('wallpaper-content');
        this.wallpaperUploadInput = document.getElementById('wallpaper-upload-input');
        this.uploadWallpaperBtn = document.getElementById('upload-wallpaper-btn');
        this.deleteWallpaperBtn = document.getElementById('delete-wallpaper-btn');
        this.searchInput = document.getElementById('search-input');
        this.mainSearch = document.getElementById('main-search');
    }

    // 初始化 UI
    setupUI() {
        console.log('[UI] Setting up UI...');
        
        // 侧边栏切换
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // 标签页切换
        if (this.appTab && this.wallpaperTab) {
            this.appTab.addEventListener('click', () => {
                this.switchTab('app');
            });
            
            this.wallpaperTab.addEventListener('click', () => {
                this.switchTab('wallpaper');
            });
        }
        
        // 搜索框焦点时隐藏按钮文本（移动端优化）
        if (this.searchInput) {
            this.searchInput.addEventListener('focus', () => {
                if (this.mainSearch) {
                    this.mainSearch.classList.add('focused');
                }
            });
            
            this.searchInput.addEventListener('blur', () => {
                if (this.mainSearch) {
                    this.mainSearch.classList.remove('focused');
                }
            });
        }
    }

    // 切换侧边栏
    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('collapsed');
            console.log('[UI] Sidebar toggled');
        }
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新标签页样式
        if (tabName === 'app') {
            if (this.appTab) this.appTab.classList.add('active');
            if (this.wallpaperTab) this.wallpaperTab.classList.remove('active');
            if (this.appContent) this.appContent.classList.add('active');
            if (this.wallpaperContent) this.wallpaperContent.classList.remove('active');
        } else if (tabName === 'wallpaper') {
            if (this.appTab) this.appTab.classList.remove('active');
            if (this.wallpaperTab) this.wallpaperTab.classList.add('active');
            if (this.appContent) this.appContent.classList.remove('active');
            if (this.wallpaperContent) this.wallpaperContent.classList.add('active');
        }
        
        console.log('[UI] Switched to', tabName, 'tab');
    }

    // 显示通知
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // 显示加载状态
    showLoading(element, show = true) {
        if (show) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }

    // 处理壁纸上传
    setupWallpaperUpload(onUpload) {
        if (this.uploadWallpaperBtn && this.wallpaperUploadInput) {
            this.uploadWallpaperBtn.addEventListener('click', () => {
                this.wallpaperUploadInput.click();
            });
            
            this.wallpaperUploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    onUpload(file);
                }
            });
        }
    }

    // 处理壁纸删除
    setupWallpaperDelete(onDelete) {
        if (this.deleteWallpaperBtn) {
            this.deleteWallpaperBtn.addEventListener('click', () => {
                if (confirm('Delete current wallpaper?')) {
                    onDelete();
                }
            });
        }
    }

    // 关闭所有模态框（点击外部时）
    setupModalClosing() {
        document.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    // 快捷键处理
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K 或 Cmd+K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }
            
            // ESC 关闭模态框
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.show');
                modals.forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });
    }

    // 响应式设计处理
    setupResponsive() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMediaChange = (e) => {
            if (e.matches) {
                // 移动端
                if (this.sidebar) {
                    this.sidebar.classList.add('mobile');
                }
            } else {
                // 桌面端
                if (this.sidebar) {
                    this.sidebar.classList.remove('mobile');
                    this.sidebar.classList.remove('collapsed');
                }
            }
        };
        
        mediaQuery.addListener(handleMediaChange);
        handleMediaChange(mediaQuery);
    }

    // 高DPI 屏幕支持
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            document.documentElement.style.setProperty('--dpr', dpr);
            console.log('[UI] High DPI detected:', dpr);
        }
    }
}

export default UIManager;
