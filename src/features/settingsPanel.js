import { compressImage } from '../utils/images.js';
import { loadWallpaper, displayWallpaper } from './wallpaper.js';

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

    document.getElementById('wallpaper-file')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            let wallpaperData = event.target.result;
            const originalSize = wallpaperData.length;

            if (originalSize > 5 * 1024 * 1024) {
                console.log('[Wallpaper] Compressing image from', (originalSize / 1024 / 1024).toFixed(2) + 'MB');
                wallpaperData = await compressImage(wallpaperData);
                console.log('[Wallpaper] Compressed to', (wallpaperData.length / 1024 / 1024).toFixed(2) + 'MB');
            }

            settings.wallpaperSource = 'local';
            const wallpaperSource = document.getElementById('wallpaper-source');
            if (wallpaperSource) wallpaperSource.value = 'local';

            chrome.storage.local.set(
                {
                    settings: settings,
                    wallpaperData: wallpaperData,
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error('[Wallpaper] Save failed:', chrome.runtime.lastError.message);
                        alert('壁纸保存失败：' + chrome.runtime.lastError.message);
                    } else {
                        displayWallpaper(ctx, wallpaperData);
                    }
                },
            );

            e.target.value = '';
        };
        reader.readAsDataURL(file);
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
}
