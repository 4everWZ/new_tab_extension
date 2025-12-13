import { getFaviconUrl } from '../utils/favicon.js';
import { checkImageTransparency, convertImageToDataUrl } from '../utils/images.js';

function t(key) {
    return typeof window.t === 'function' ? window.t(key) : key;
}

export function setupShortcutForm(ctx) {
    const { shortcutForm, iconTypeRadios } = ctx.dom;

    // URL parse
    const urlInput = document.getElementById('app-url');
    const parseUrlBtn = document.getElementById('parse-url-btn');

    urlInput?.addEventListener('blur', () => {
        const url = urlInput.value.trim();
        if (url && parseUrlBtn) parseUrlBtn.click();
    });

    if (parseUrlBtn) {
        parseUrlBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = urlInput?.value.trim();
            if (!url) {
                alert('请输入有效的URL');
                return;
            }

            try {
                const urlObj = new URL(url);
                const hostname = urlObj.hostname;

                const nameInput = document.getElementById('app-name');
                if (nameInput && !nameInput.value.trim()) {
                    const domainName = hostname.replace('www.', '').split('.')[0];
                    nameInput.value = domainName.charAt(0).toUpperCase() + domainName.slice(1);
                }

                parseUrlBtn.disabled = true;
                parseUrlBtn.textContent = '加载中...';

                const faviconUrls = getFaviconUrl(url);
                if (faviconUrls.length === 0) {
                    parseUrlBtn.disabled = false;
                    parseUrlBtn.textContent = t('parse_url');
                    return;
                }

                // Switch to upload icon mode
                const uploadRadio = document.querySelector('input[name="icon-type"][value="upload"]');
                if (uploadRadio) uploadRadio.checked = true;
                document.getElementById('text-icon-options')?.classList.add('hidden');
                document.getElementById('upload-icon-options')?.classList.remove('hidden');

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
                        if (loaded) return;
                        loaded = true;

                        const preview = document.getElementById('image-preview');
                        preview.style.backgroundImage = `url(${faviconUrl})`;
                        preview.classList.add('show');
                        preview.dataset.imageData = faviconUrl;

                        parseUrlBtn.disabled = false;
                        parseUrlBtn.textContent = t('parse_url');
                    };

                    img.onerror = () => {
                        if (loaded) return;
                        loaded = true;
                        setTimeout(tryLoadFavicon, 100);
                    };

                    img.src = faviconUrl;
                    setTimeout(() => {
                        if (loaded) return;
                        loaded = true;
                        img.src = '';
                        tryLoadFavicon();
                    }, 3000);
                }

                tryLoadFavicon();
            } catch {
                alert('请输入有效的URL (例: https://example.com)');
            }
        });
    }

    // Switch icon type
    iconTypeRadios?.forEach((radio) => {
        radio.addEventListener('change', (e) => {
            const textOptions = document.getElementById('text-icon-options');
            const uploadOptions = document.getElementById('upload-icon-options');
            if (e.target.value === 'text') {
                textOptions?.classList.remove('hidden');
                uploadOptions?.classList.add('hidden');
            } else {
                textOptions?.classList.add('hidden');
                uploadOptions?.classList.remove('hidden');
            }
        });
    });

    // Image upload preview
    document.getElementById('app-image')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('image-preview');
            preview.style.backgroundImage = `url(${event.target.result})`;
            preview.classList.add('show');
            preview.dataset.imageData = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Submit
    shortcutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewShortcut(ctx);
    });

    // Reset
    shortcutForm?.addEventListener('reset', () => {
        setTimeout(() => {
            const preview = document.getElementById('image-preview');
            preview?.classList.remove('show');
            if (preview) preview.style.backgroundImage = '';
        }, 0);
    });
}

export function addNewShortcut(ctx) {
    const name = document.getElementById('app-name')?.value.trim();
    const url = document.getElementById('app-url')?.value.trim();
    const iconType = document.querySelector('input[name="icon-type"]:checked')?.value;

    if (!name || !url) return;

    const newApp = { name, url, iconType: 'color' };

    if (iconType === 'text') {
        newApp.text = document.getElementById('app-text')?.value.trim() || name[0];
        newApp.color = document.getElementById('app-color')?.value;
        ctx.state.allApps.push(newApp);
        ctx.actions.saveApps();
        ctx.dom.shortcutForm?.reset();
        document.getElementById('image-preview')?.classList.remove('show');
        render(ctx);
        return;
    }

    // upload/icon
    const preview = document.getElementById('image-preview');
    if (preview?.dataset?.imageData) {
        newApp.img = preview.dataset.imageData;
        newApp.iconType = 'upload';
        ctx.state.allApps.push(newApp);
        ctx.actions.saveApps();
        ctx.dom.shortcutForm?.reset();
        preview.classList.remove('show');
        render(ctx);
        return;
    }

    const faviconUrls = getFaviconUrl(url);
    if (faviconUrls.length === 0) {
        ctx.state.allApps.push(newApp);
        ctx.actions.saveApps();
        ctx.dom.shortcutForm?.reset();
        preview?.classList.remove('show');
        render(ctx);
        return;
    }

    let currentIndex = 0;

    function tryNextFavicon() {
        if (currentIndex >= faviconUrls.length) {
            ctx.state.allApps.push(newApp);
            ctx.actions.saveApps();
            ctx.dom.shortcutForm?.reset();
            preview?.classList.remove('show');
            render(ctx);
            return;
        }

        const faviconUrl = faviconUrls[currentIndex];
        currentIndex++;

        const img = new Image();
        let loaded = false;

        img.onload = () => {
            if (loaded) return;
            loaded = true;

            convertImageToDataUrl(faviconUrl).then((cachedUrl) => {
                newApp.img = cachedUrl;
                newApp.iconType = 'icon';

                checkImageTransparency(cachedUrl).then((hasTransparency) => {
                    newApp.isTransparent = hasTransparency;
                    ctx.state.allApps.push(newApp);
                    ctx.actions.saveApps();
                    ctx.dom.shortcutForm?.reset();
                    preview?.classList.remove('show');
                    render(ctx);
                });
            });
        };

        img.onerror = () => {
            if (loaded) return;
            loaded = true;
            setTimeout(tryNextFavicon, 100);
        };

        img.src = faviconUrl;
        setTimeout(() => {
            if (loaded) return;
            loaded = true;
            img.src = '';
            tryNextFavicon();
        }, 3000);
    }

    tryNextFavicon();
}

export function render(ctx) {
    renderGrid(ctx);
    renderPagination(ctx);
}

export function renderGrid(ctx) {
    const { grid } = ctx.dom;
    const { pageSize, currentPage, allApps, isEditMode } = ctx.state;

    grid.innerHTML = '';

    const start = currentPage * pageSize;
    const end = start + pageSize;
    const pageApps = allApps.slice(start, end);

    pageApps.forEach((app, index) => {
        const realIndex = start + index;
        const item = document.createElement('a');
        item.href = isEditMode ? 'javascript:void(0)' : app.url;
        item.className = 'app-item';
        if (isEditMode) item.classList.add('edit-mode');
        const openInNewTab = !!ctx.state.settings.openShortcutInNewTab;
        item.target = !isEditMode && openInNewTab ? '_blank' : '_self';
        if (!isEditMode && openInNewTab) item.rel = 'noopener noreferrer';
        item.dataset.index = realIndex;

        item.addEventListener('click', (e) => {
            if (ctx.state.isEditMode) e.preventDefault();
        });

        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            enterEditMode(ctx, realIndex);
        });

        if (isEditMode) {
            item.draggable = true;
            item.addEventListener('dragstart', (e) => handleDragStart(ctx, e));
            item.addEventListener('dragover', (e) => handleDragOver(ctx, e));
            item.addEventListener('dragleave', (e) => handleDragLeave(ctx, e));
            item.addEventListener('drop', (e) => handleDrop(ctx, e));
            item.addEventListener('dragend', (e) => handleDragEnd(ctx, e));
        }

        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';

        const icon = document.createElement('div');
        icon.className = 'app-icon';
        if (ctx.state.settings.iconShadow) icon.classList.add('with-shadow');
        if (ctx.state.settings.iconAnimation) icon.classList.add('with-animation');

        if (app.iconType === 'icon' && app.img) {
            icon.style.backgroundImage = `url(${app.img})`;
            if (!app.isTransparent) icon.style.backgroundColor = '#f0f0f0';
            icon.style.backgroundSize = 'cover';
            icon.style.backgroundPosition = 'center';

            if (!app.img.startsWith('data:')) {
                // legacy behavior kept
                const onerror = () => {
                    icon.style.backgroundImage = 'none';
                    icon.style.backgroundColor = app.color || '#ccc';
                    icon.innerText = app.text || app.name[0];
                    item.removeEventListener('error', onerror);
                };
                item.addEventListener('error', onerror);
            }
        } else if (app.iconType === 'upload' && app.img) {
            icon.style.backgroundImage = `url(${app.img})`;
            if (!app.isTransparent) icon.style.backgroundColor = app.color || '#ccc';
            icon.style.backgroundSize = 'cover';
            icon.style.backgroundPosition = 'center';
        } else if (app.iconType === 'color') {
            icon.style.backgroundColor = app.color || '#ccc';
            icon.innerText = app.text || app.name[0];
        } else {
            icon.style.backgroundColor = app.color || '#ccc';
            icon.innerText = app.text || app.name[0];
        }

        iconContainer.appendChild(icon);

        if (isEditMode) {
            const editIcon = document.createElement('div');
            editIcon.className = 'edit-icon';
            editIcon.innerHTML = `
                <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 10 38 L 14 34 L 34 14 L 38 10 L 38 10" stroke="#999999" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="6" y="34" width="6" height="10" fill="#AAAAAA" stroke="#999999" stroke-width="1"/>
                    <path d="M 34 14 L 38 10" stroke="#666666" stroke-width="3" stroke-linecap="round"/>
                </svg>
            `;
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                editAppIcon(ctx, realIndex);
            });
            iconContainer.appendChild(editIcon);

            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                deleteApp(ctx, realIndex);
            });
            iconContainer.appendChild(deleteBtn);
        }

        const name = document.createElement('span');
        name.className = 'app-name';
        if (ctx.state.settings.showIconLabel) name.classList.add('hidden');
        name.innerText = app.name;

        item.appendChild(iconContainer);
        item.appendChild(name);
        grid.appendChild(item);
    });
}

export function enterEditMode(ctx, index) {
    ctx.state.isEditMode = true;
    ctx.state.editingItemIndex = index;
    renderGrid(ctx);

    // Use stable handler references so they can be removed correctly.
    ctx._handlers ||= {};
    if (!ctx._handlers.exitEditModeOnClick) {
        ctx._handlers.exitEditModeOnClick = (e) => exitEditModeOnClick(ctx, e);
    }
    if (!ctx._handlers.exitEditModeOnContextMenu) {
        ctx._handlers.exitEditModeOnContextMenu = (e) => exitEditModeOnContextMenu(ctx, e);
    }

    document.addEventListener('click', ctx._handlers.exitEditModeOnClick, true);
    document.addEventListener('contextmenu', ctx._handlers.exitEditModeOnContextMenu, true);
}

function exitEditModeOnClick(ctx, e) {
    // If an overlay modal is open (e.g. icon editor), don't exit edit mode.
    if (e.target?.closest?.('.modal-overlay')) return;
    const itemClicked = e.target.closest('.app-item');
    if (itemClicked && ctx.dom.grid.contains(itemClicked)) return;
    exitEditMode(ctx);
}

function exitEditModeOnContextMenu(ctx, e) {
    // If an overlay modal is open (e.g. icon editor), don't exit edit mode.
    if (e.target?.closest?.('.modal-overlay')) return;
    const itemClicked = e.target.closest('.app-item');
    if (itemClicked && ctx.dom.grid.contains(itemClicked)) return;
    exitEditMode(ctx);
}

export function exitEditMode(ctx) {
    ctx.state.isEditMode = false;
    ctx.state.editingItemIndex = null;
    if (ctx._handlers?.exitEditModeOnClick) {
        document.removeEventListener('click', ctx._handlers.exitEditModeOnClick, true);
    }
    if (ctx._handlers?.exitEditModeOnContextMenu) {
        document.removeEventListener('contextmenu', ctx._handlers.exitEditModeOnContextMenu, true);
    }
    renderGrid(ctx);
}

export function editAppIcon(ctx, index) {
    const app = ctx.state.allApps[index];
    const currentIconType = app.iconType || 'color';
    const currentIconStyle = app.iconStyle || '';

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

    let iconOptionsHTML = `
        <div class="icon-option" data-type="color" style="padding: 12px; border: 2px solid ${currentIconType === 'color' ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${currentIconType === 'color' ? '#f0f7ff' : '#fff'};">
            <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${ctx.state.settings.iconRadius || 50}%; background: ${app.color || '#fb7299'}; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${app.text || app.name[0]}
            </div>
            <div style="font-size: 12px; color: #666;">纯色图标</div>
        </div>
    `;

    let availableIconCount = 0;

    if (currentIconType === 'icon' && app.img) {
        const isSelected = currentIconType === 'icon';
        const bgColor = app.isTransparent ? 'transparent' : '#f0f0f0';
        iconOptionsHTML += `
            <div class="icon-option" data-type="icon" data-style="icon1" data-url="${app.img}" style="padding: 12px; border: 2px solid ${isSelected ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${isSelected ? '#f0f7ff' : '#fff'};">
                <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${ctx.state.settings.iconRadius || 50}%; background-image: url(${app.img}); background-color: ${bgColor}; background-size: cover; background-position: center; margin: 0 auto 8px; border: 1px solid #eee;"></div>
                <div style="font-size: 12px; color: #666;">图标A</div>
            </div>
        `;
        availableIconCount = 1;
    } else {
        const faviconUrls = getFaviconUrl(app.url);
        for (let i = 0; i < Math.min(faviconUrls.length, 2); i++) {
            const iconStyle = i === 0 ? 'icon1' : 'icon2';
            const isSelected = currentIconType === 'icon' && currentIconStyle === iconStyle;
            iconOptionsHTML += `
                <div class="icon-option" data-type="icon" data-style="${iconStyle}" data-url="${faviconUrls[i]}" style="padding: 12px; border: 2px solid ${isSelected ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${isSelected ? '#f0f7ff' : '#fff'};">
                    <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${ctx.state.settings.iconRadius || 50}%; background-image: url(${faviconUrls[i]}); background-size: cover; background-position: center; margin: 0 auto 8px; border: 1px solid #eee;"></div>
                    <div style="font-size: 12px; color: #666;">图标${String.fromCharCode(65 + i)}</div>
                </div>
            `;
            availableIconCount++;
        }
    }

    iconOptionsHTML += `
        <div class="icon-option" data-type="upload" style="padding: 12px; border: 2px solid ${currentIconType === 'upload' ? '#4285F4' : '#ddd'}; border-radius: 8px; text-align: center; cursor: pointer; background: ${currentIconType === 'upload' ? '#f0f7ff' : '#fff'};">
            <div style="width: 60px; height: 60px; aspect-ratio: 1; border-radius: ${ctx.state.settings.iconRadius || 50}%; background: #f0f0f0; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 24px;">📤</div>
            <div style="font-size: 12px; color: #666;">本地图标</div>
        </div>
    `;

    modalContent.innerHTML = `
        <h2 style="margin: 0 0 20px; font-size: 18px; color: #333;">编辑图标</h2>

        <div style="margin-bottom: 20px;">
            <div style="width: 100px; height: 100px; aspect-ratio: 1; border-radius: ${ctx.state.settings.iconRadius || 50}%; background: ${currentIconType === 'icon' && app.isTransparent ? 'transparent' : (app.color || '#ccc')}; margin: 0 auto 16px; background-image: url(${app.img || ''}); background-size: cover; background-position: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 32px;" id="icon-preview">
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

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

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
    // Keep current selection as default so clicking "Save" without changes
    // doesn't reset the icon.
    let selectedFaviconUrl = currentIconType === 'icon' ? (app.img || '') : '';

    iconOptions.forEach((option) => {
        option.addEventListener('click', () => {
            iconOptions.forEach((o) => {
                o.style.borderColor = '#ddd';
                o.style.background = '#fff';
            });
            option.style.borderColor = '#4285F4';
            option.style.background = '#f0f7ff';

            selectedIconType = option.dataset.type;
            selectedIconStyle = option.dataset.style || '';
            selectedFaviconUrl = option.dataset.url || '';

            colorInputGroup.style.display = selectedIconType === 'color' ? 'block' : 'none';
            imgInputGroup.style.display = selectedIconType === 'upload' ? 'block' : 'none';

            updateIconPreview();
        });
    });

    colorInput?.addEventListener('change', updateIconPreview);
    colorInput?.addEventListener('input', updateIconPreview);
    textInput?.addEventListener('input', updateIconPreview);
    imgInput?.addEventListener('input', updateIconPreview);

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

            if (selectedFaviconUrl === app.img && app.isTransparent !== undefined) {
                iconPreview.style.backgroundColor = app.isTransparent ? 'transparent' : '#f0f0f0';
            } else if (selectedFaviconUrl) {
                iconPreview.style.backgroundColor = '#f0f0f0';
                checkImageTransparency(selectedFaviconUrl).then((hasTransparency) => {
                    if (hasTransparency) iconPreview.style.backgroundColor = 'transparent';
                });
            }
        }
    }

    cancelBtn?.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    saveBtn?.addEventListener('click', async () => {
        const target = ctx.state.allApps[index];
        target.url = urlInput.value.trim() || app.url;
        target.name = nameInput.value.trim() || app.name;
        target.iconType = selectedIconType;
        target.iconStyle = selectedIconStyle;

        if (selectedIconType === 'color') {
            target.text = textInput.value || app.text || app.name[0];
            target.color = colorInput.value;
            target.img = '';
            target.isTransparent = undefined;
            ctx.actions.saveApps();
            renderGrid(ctx);
            document.body.removeChild(modal);
            return;
        }

        if (selectedIconType === 'upload') {
            const raw = imgInput.value.trim() || '';
            target.text = '';
            target.color = '';

            if (!raw) {
                target.img = '';
                target.isTransparent = undefined;
                ctx.actions.saveApps();
                renderGrid(ctx);
                document.body.removeChild(modal);
                return;
            }

            // Prefer caching as data URL when possible.
            const cached = raw.startsWith('data:') ? raw : await convertImageToDataUrl(raw);
            target.img = cached;
            target.isTransparent = await checkImageTransparency(cached);
            ctx.actions.saveApps();
            renderGrid(ctx);
            document.body.removeChild(modal);
            return;
        }

        if (selectedIconType === 'icon') {
            // If user didn't click a different option, keep current icon.
            const chosen = selectedFaviconUrl || app.img || '';
            target.text = '';
            target.color = '';

            if (!chosen) {
                // Nothing to save; keep whatever is currently persisted.
                ctx.actions.saveApps();
                renderGrid(ctx);
                document.body.removeChild(modal);
                return;
            }

            // Cache to data URL to avoid network failures.
            const cached = chosen.startsWith('data:') ? chosen : await convertImageToDataUrl(chosen);
            target.img = cached;

            // Reuse stored transparency if it's the same image and known.
            if (chosen === app.img && app.isTransparent !== undefined) {
                target.isTransparent = app.isTransparent;
            } else {
                target.isTransparent = await checkImageTransparency(cached);
            }

            ctx.actions.saveApps();
            renderGrid(ctx);
            document.body.removeChild(modal);
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    urlInput?.focus();
}

export function deleteApp(ctx, index) {
    const appToDelete = ctx.state.allApps[index];

    if (appToDelete?.img && appToDelete.img.startsWith('data:')) {
        appToDelete.img = null;
    }

    ctx.state.allApps.splice(index, 1);
    ctx.actions.saveApps();

    const totalPages = Math.ceil(ctx.state.allApps.length / ctx.state.pageSize);
    if (ctx.state.currentPage >= totalPages) {
        ctx.state.currentPage = Math.max(0, totalPages - 1);
    }

    renderGrid(ctx);
    renderPagination(ctx);
}

export function renderPagination(ctx) {
    const { pagination } = ctx.dom;
    const { allApps, pageSize, currentPage } = ctx.state;

    pagination.innerHTML = '';

    const totalPages = Math.ceil(allApps.length / pageSize);
    if (totalPages <= 1) return;

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (i === currentPage) dot.classList.add('active');
        dot.addEventListener('click', () => {
            ctx.state.currentPage = i;
            render(ctx);
        });
        pagination.appendChild(dot);
    }
}

function handleDragStart(ctx, e) {
    const el = e.currentTarget;
    ctx.state.draggedItem = el;
    ctx.state.draggedIndex = parseInt(el.dataset.index);

    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', el.innerHTML);
}

function handleDragOver(ctx, e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const el = e.currentTarget;
    if (el !== ctx.state.draggedItem) el.classList.add('drag-over');
    return false;
}

function handleDragLeave(ctx, e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(ctx, e) {
    e.stopPropagation();

    const el = e.currentTarget;
    el.classList.remove('drag-over');

    if (ctx.state.draggedItem !== el) {
        const dropIndex = parseInt(el.dataset.index);

        const temp = ctx.state.allApps[ctx.state.draggedIndex];
        ctx.state.allApps[ctx.state.draggedIndex] = ctx.state.allApps[dropIndex];
        ctx.state.allApps[dropIndex] = temp;

        ctx.actions.saveApps();
        renderGrid(ctx);
        renderPagination(ctx);
    }

    return false;
}

function handleDragEnd(ctx, e) {
    e.currentTarget.classList.remove('dragging');

    document.querySelectorAll('.app-item').forEach((item) => item.classList.remove('drag-over'));

    ctx.state.draggedItem = null;
    ctx.state.draggedIndex = null;
}
