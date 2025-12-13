// ==================== UI 交互模块 ====================

export class UIManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.searchInput = document.getElementById('search-input');
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
        
        // 搜索框焦点时的处理
        if (this.searchInput) {
            this.searchInput.addEventListener('focus', () => {
                // 可选：在移动端上做特殊处理
            });
            
            this.searchInput.addEventListener('blur', () => {
                // 可选处理
            });
        }
    }

    // 切换侧边栏
    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('open');
            console.log('[UI] Sidebar toggled');
        }
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
        const uploadBtn = document.getElementById('wallpaper-upload-btn');
        const fileInput = document.getElementById('wallpaper-file');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    onUpload(file);
                }
            });
        }
    }

    // 处理壁纸删除
    setupWallpaperDelete(onDelete) {
        // 可根据需要实现
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
