import { compressImage, dataURLToBlob } from '../utils/images.js';
import { loadWallpaper, displayWallpaper } from './wallpaper.js';
import { db, STORES_CONSTANTS } from '../utils/db.js';

const GRID_PRESET_VALUES = [3, 4, 5, 6, 7];

export function initializeGridPresets(ctx) {
    const { settings } = ctx.state;
    document.querySelectorAll('.grid-preset').forEach((btn) => {
        btn.classList.remove('active');
        if (btn.dataset.cols === 'custom') {
            if (!GRID_PRESET_VALUES.includes(settings.gridCols)) {
                btn.classList.add('active');
                document.getElementById('custom-cols-item')?.classList.remove('hidden');
                const customCols = document.getElementById('custom-cols');
                if (customCols) customCols.value = settings.gridCols;
            } else {
                document.getElementById('custom-cols-item')?.classList.add('hidden');
            }
        } else {
            const cols = parseInt(btn.dataset.cols);
            if (cols === settings.gridCols) {
                btn.classList.add('active');
                document.getElementById('custom-cols-item')?.classList.add('hidden');
            }
        }
    });
}

export function setupSettingsModalUIValues(ctx) {
    const { settings } = ctx.state;

    // Grid
    document.querySelectorAll('.grid-preset').forEach((btn) => {
        btn.classList.remove('active');
        if (btn.dataset.cols === 'custom') {
            if (!GRID_PRESET_VALUES.includes(settings.gridCols)) {
                btn.classList.add('active');
                document.getElementById('custom-cols-item')?.classList.remove('hidden');
                const customCols = document.getElementById('custom-cols');
                if (customCols) customCols.value = settings.gridCols;
            } else {
                document.getElementById('custom-cols-item')?.classList.add('hidden');
            }
        } else {
            const cols = parseInt(btn.dataset.cols);
            if (cols === settings.gridCols) {
                btn.classList.add('active');
            }
        }
    });

    // Icon
    const iconRadius = document.getElementById('icon-radius');
    const iconOpacity = document.getElementById('icon-opacity');
    const iconSize = document.getElementById('icon-size');
    if (iconRadius) iconRadius.value = settings.iconRadius;
    if (iconOpacity) iconOpacity.value = settings.iconOpacity;
    if (iconSize) iconSize.value = settings.iconSize;

    const percent = Math.round(((settings.iconSize - 30) / 120) * 80 + 20);
    const sizeValue = document.getElementById('size-value');
    const radiusValue = document.getElementById('radius-value');
    const opacityValue = document.getElementById('opacity-value');
    if (sizeValue) sizeValue.textContent = percent + '%';
    if (radiusValue) radiusValue.textContent = settings.iconRadius + '%';
    if (opacityValue) opacityValue.textContent = settings.iconOpacity + '%';

    // Search box
    const searchWidth = document.getElementById('search-width');
    const searchHeight = document.getElementById('search-height');
    const searchRadius = document.getElementById('search-radius');
    const searchOpacity = document.getElementById('search-opacity');
    const searchTopMargin = document.getElementById('search-top-margin');

    if (searchWidth) searchWidth.value = settings.searchWidth;
    if (searchHeight) searchHeight.value = settings.searchHeight || 44;
    if (searchRadius) searchRadius.value = settings.searchRadius;
    if (searchOpacity) searchOpacity.value = settings.searchOpacity;
    if (searchTopMargin) searchTopMargin.value = settings.searchTopMargin || 0;

    const searchWidthValue = document.getElementById('search-width-value');
    const searchRadiusValue = document.getElementById('search-radius-value');
    const searchHeightValue = document.getElementById('search-height-value');
    const searchOpacityValue = document.getElementById('search-opacity-value');
    const searchTopMarginValue = document.getElementById('search-top-margin-value');

    if (searchWidthValue) searchWidthValue.textContent = settings.searchWidth + '%';
    if (searchRadiusValue) searchRadiusValue.textContent = settings.searchRadius + 'px';
    if (searchHeightValue) searchHeightValue.textContent = (settings.searchHeight || 44) + 'px';
    if (searchOpacityValue) searchOpacityValue.textContent = settings.searchOpacity + '%';
    if (searchTopMarginValue) searchTopMarginValue.textContent = (settings.searchTopMargin || 0) + 'px';

    // Wallpaper
    const wallpaperSource = document.getElementById('wallpaper-source');
    if (wallpaperSource) wallpaperSource.value = settings.wallpaperSource;

    const maskOpacity = document.getElementById('mask-opacity');
    const maskOpacityValue = document.getElementById('mask-opacity-value');
    if (maskOpacity) maskOpacity.value = settings.maskOpacity;
    if (maskOpacityValue) maskOpacityValue.textContent = settings.maskOpacity + '%';

    const wallpaperBlur = document.getElementById('wallpaper-blur');
    const wallpaperBlurValue = document.getElementById('wallpaper-blur-value');
    if (wallpaperBlur) wallpaperBlur.value = settings.wallpaperBlur || 0;
    if (wallpaperBlurValue) wallpaperBlurValue.textContent = (settings.wallpaperBlur || 0) + '%';

    // Text
    const textSize = document.getElementById('text-size');
    const textSizeValue = document.getElementById('text-size-value');
    if (textSize) textSize.value = settings.textSize;
    if (textSizeValue) textSizeValue.textContent = settings.textSize + 'px';

    const textShadow = document.getElementById('text-shadow');
    if (textShadow) textShadow.checked = settings.textShadow;

    const showIconLabel = document.getElementById('show-icon-label');
    if (showIconLabel) showIconLabel.checked = settings.showIconLabel;

    const iconShadow = document.getElementById('icon-shadow');
    if (iconShadow) iconShadow.checked = settings.iconShadow;

    const iconAnimation = document.getElementById('icon-animation');
    if (iconAnimation) iconAnimation.checked = settings.iconAnimation;

    const hideSearchBar = document.getElementById('hide-search-bar');
    if (hideSearchBar) hideSearchBar.checked = settings.hideSearchBar;

    const openShortcutInNewTab = document.getElementById('open-shortcut-in-newtab');
    if (openShortcutInNewTab) openShortcutInNewTab.checked = !!settings.openShortcutInNewTab;

    const languageSelect = document.getElementById('language-select');
    if (languageSelect && window.currentLanguage) {
        languageSelect.value = window.currentLanguage;
    }

    // WebDAV
    const webdavUrl = document.getElementById('webdav-url');
    const webdavUser = document.getElementById('webdav-username');
    const webdavPass = document.getElementById('webdav-password');
    if (webdavUrl) webdavUrl.value = settings.webdavUrl || '';
    if (webdavUser) webdavUser.value = settings.webdavUsername || '';
    if (webdavPass) webdavPass.value = settings.webdavPassword || '';
}

export function setupSettingsPanel(ctx) {
    const { settings } = ctx.state;
    const { body } = ctx.dom;

    // Wallpaper source
    document.getElementById('wallpaper-source')?.addEventListener('change', async (e) => {
        settings.wallpaperSource = e.target.value;
        await ctx.actions.saveSettings();

        body.style.backgroundImage = 'none';
        body.classList.remove('has-wallpaper');
        await loadWallpaper(ctx);
    });

    // Upload wallpaper
    document.getElementById('wallpaper-upload-btn')?.addEventListener('click', () => {
        document.getElementById('wallpaper-file')?.click();
    });

    document.getElementById('wallpaper-file')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            let blobToSave = file;

            if (file.size > 5 * 1024 * 1024) {
                // Compress if too large
                const reader = new FileReader();
                const compressedDataUrl = await new Promise((resolve) => {
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsDataURL(file);
                });

                const compressed = await compressImage(compressedDataUrl);
                blobToSave = dataURLToBlob(compressed);
            }

            // Save Blob to IDB
            await db.set(STORES_CONSTANTS.WALLPAPERS, 'local', blobToSave);

            // Update Settings
            settings.wallpaperSource = 'local';
            const wallpaperSource = document.getElementById('wallpaper-source');
            if (wallpaperSource) wallpaperSource.value = 'local';

            await ctx.actions.saveSettings();

            // Display
            const objectUrl = URL.createObjectURL(blobToSave);
            displayWallpaper(ctx, objectUrl);
            // Note: objectURL needs to be revoked eventually, but for single wallpaper it's okay? 
            // Ideally displayWallpaper handles specific URL types.

            // Clear input
            e.target.value = '';

        } catch (err) {
            console.error('[Wallpaper] Upload failed:', err);
            alert('Upload failed: ' + err.message);
        }
    });

    // Mask opacity
    document.getElementById('mask-opacity')?.addEventListener('input', async (e) => {
        settings.maskOpacity = parseInt(e.target.value);
        const value = document.getElementById('mask-opacity-value');
        if (value) value.textContent = settings.maskOpacity + '%';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    // Wallpaper blur
    document.getElementById('wallpaper-blur')?.addEventListener('input', async (e) => {
        settings.wallpaperBlur = parseInt(e.target.value);
        const value = document.getElementById('wallpaper-blur-value');
        if (value) value.textContent = settings.wallpaperBlur + '%';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    // Grid presets
    document.querySelectorAll('.grid-preset').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            const colsRaw = e.target.dataset.cols;
            if (colsRaw === 'custom') {
                document.getElementById('custom-cols-item')?.classList.remove('hidden');
                return;
            }

            document.getElementById('custom-cols-item')?.classList.add('hidden');
            settings.gridCols = parseInt(colsRaw);
            // Parse rows from button label text like "2x4"; default to 2 if parse fails.
            const label = (e.target.textContent || '').trim();
            const rowPart = parseInt(label.split('x')[0]);
            settings.gridRows = Number.isFinite(rowPart) ? rowPart : (settings.gridRows || 2);
            document.querySelectorAll('.grid-preset').forEach((b) => b.classList.remove('active'));
            e.target.classList.add('active');

            await ctx.actions.saveSettings();
            ctx.actions.applySettings();
            ctx.actions.render();
        });
    });

    // Custom cols
    document.getElementById('custom-cols')?.addEventListener('change', async (e) => {
        const cols = parseInt(e.target.value);
        if (cols >= 2 && cols <= 10) {
            settings.gridCols = cols;
            document.querySelectorAll('.grid-preset').forEach((b) => b.classList.remove('active'));
            await ctx.actions.saveSettings();
            ctx.actions.applySettings();
            ctx.actions.render();
        }
    });

    document.getElementById('custom-cols')?.addEventListener('input', (e) => {
        const cols = parseInt(e.target.value);
        if (cols >= 2 && cols <= 10) {
            settings.gridCols = cols;
            ctx.actions.applySettings();
        }
    });

    // Shortcut open behavior
    document.getElementById('open-shortcut-in-newtab')?.addEventListener('change', async (e) => {
        settings.openShortcutInNewTab = e.target.checked;
        await ctx.actions.saveSettings();
        ctx.actions.render();
    });

    // Icon toggles
    document.getElementById('show-icon-label')?.addEventListener('change', async (e) => {
        settings.showIconLabel = e.target.checked;
        await ctx.actions.saveSettings();
        ctx.actions.render();
    });

    document.getElementById('icon-shadow')?.addEventListener('change', async (e) => {
        settings.iconShadow = e.target.checked;
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
        ctx.actions.render();
    });

    document.getElementById('icon-animation')?.addEventListener('change', async (e) => {
        settings.iconAnimation = e.target.checked;
        await ctx.actions.saveSettings();
        ctx.actions.render();
    });

    document.getElementById('icon-radius')?.addEventListener('input', async (e) => {
        settings.iconRadius = parseInt(e.target.value);
        const value = document.getElementById('radius-value');
        if (value) value.textContent = settings.iconRadius + '%';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.getElementById('icon-opacity')?.addEventListener('input', async (e) => {
        settings.iconOpacity = parseInt(e.target.value);
        const value = document.getElementById('opacity-value');
        if (value) value.textContent = settings.iconOpacity + '%';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.getElementById('icon-size')?.addEventListener('input', async (e) => {
        settings.iconSize = parseInt(e.target.value);
        const percent = Math.round(((settings.iconSize - 30) / 120) * 80 + 20);
        const value = document.getElementById('size-value');
        if (value) value.textContent = percent + '%';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    // Search box options
    document.getElementById('hide-search-bar')?.addEventListener('change', async (e) => {
        settings.hideSearchBar = e.target.checked;
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.getElementById('search-width')?.addEventListener('input', async (e) => {
        settings.searchWidth = parseInt(e.target.value);
        const value = document.getElementById('search-width-value');
        if (value) value.textContent = settings.searchWidth + '%';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.getElementById('search-radius')?.addEventListener('input', async (e) => {
        settings.searchRadius = parseInt(e.target.value);
        const value = document.getElementById('search-radius-value');
        if (value) value.textContent = settings.searchRadius + 'px';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.getElementById('search-height')?.addEventListener('input', async (e) => {
        settings.searchHeight = parseInt(e.target.value);
        const value = document.getElementById('search-height-value');
        if (value) value.textContent = settings.searchHeight + 'px';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.getElementById('search-opacity')?.addEventListener('input', async (e) => {
        settings.searchOpacity = parseInt(e.target.value);
        const value = document.getElementById('search-opacity-value');
        if (value) value.textContent = settings.searchOpacity + '%';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.getElementById('search-top-margin')?.addEventListener('input', async (e) => {
        settings.searchTopMargin = parseInt(e.target.value);
        const value = document.getElementById('search-top-margin-value');
        if (value) value.textContent = settings.searchTopMargin + 'px';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    // Text options
    document.getElementById('text-shadow')?.addEventListener('change', async (e) => {
        settings.textShadow = e.target.checked;
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
        ctx.actions.render();
    });

    document.getElementById('text-size')?.addEventListener('input', async (e) => {
        settings.textSize = parseInt(e.target.value);
        const value = document.getElementById('text-size-value');
        if (value) value.textContent = settings.textSize + 'px';
        await ctx.actions.saveSettings();
        ctx.actions.applySettings();
    });

    document.querySelectorAll('.color-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            const color = e.target.dataset.color;
            settings.textColor = color;
            document.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('active'));
            e.target.classList.add('active');
            await ctx.actions.saveSettings();
            ctx.actions.applySettings();
            ctx.actions.render();
        });
    });

    // Language
    document.getElementById('language-select')?.addEventListener('change', (e) => {
        window.setLanguage?.(e.target.value);
    });

    // WebDAV Settings
    const webdavInputs = ['webdav-url', 'webdav-username', 'webdav-password'];
    webdavInputs.forEach(id => {
        document.getElementById(id)?.addEventListener('change', async (e) => {
            const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace('Url', 'Url'); // webdav-url -> webdavUrl
            // Fix mapping: webdav-url -> webdavUrl, webdav-username -> webdavUsername
            let settingKey = '';
            if (id === 'webdav-url') settingKey = 'webdavUrl';
            else if (id === 'webdav-username') settingKey = 'webdavUsername';
            else if (id === 'webdav-password') settingKey = 'webdavPassword';

            settings[settingKey] = e.target.value.trim();
            await ctx.actions.saveSettings();
        });
    });

    document.getElementById('webdav-check-btn')?.addEventListener('click', async () => {
        const { checkWebDAVConnection } = await import('./sync.js');
        const statusEl = document.getElementById('sync-status');
        if (statusEl) statusEl.textContent = 'Checking connection...';
        try {
            const ok = await checkWebDAVConnection(ctx);
            if (statusEl) {
                statusEl.textContent = ok ? 'Connection Successful!' : 'Connection Failed!';
                statusEl.style.color = ok ? 'green' : 'red';
            }
        } catch (e) {
            if (statusEl) {
                statusEl.textContent = 'Error: ' + e.message;
                statusEl.style.color = 'red';
            }
        }
    });

    document.getElementById('sync-upload-btn')?.addEventListener('click', async () => {
        if (!confirm('This will overwrite remote data. Continue?')) return;
        const { syncUpload } = await import('./sync.js');
        try {
            await syncUpload(ctx);
        } catch (e) {
            alert('Upload failed: ' + e.message);
        }
    });

    document.getElementById('sync-download-btn')?.addEventListener('click', async () => {
        if (!confirm('This will overwrite local data. Continue?')) return;
        const { syncDownload } = await import('./sync.js');
        try {
            await syncDownload(ctx, 'overwrite');
        } catch (e) {
            alert('Download failed: ' + e.message);
        }
    });

    document.getElementById('sync-merge-btn')?.addEventListener('click', async () => {
        const { syncDownload } = await import('./sync.js');
        try {
            await syncDownload(ctx, 'merge');
        } catch (e) {
            alert('Merge failed: ' + e.message);
        }
    });
}
