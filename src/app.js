import { createInitialState } from './state.js';
import { getDom } from './dom.js';
import { storageGet, storageSet } from './utils/storage.js';
import { applySettings, applySettingsExceptMask } from './ui/settingsApply.js';
import { setupSidebar } from './features/sidebar.js';
import { restoreCustomEngineOptions, setupSearch, syncEngineActiveUI } from './features/search.js';
import { displayWallpaper, getWallpaperUrl, loadWallpaper, setupWallpaperRefresh } from './features/wallpaper.js';
import { render, setupShortcutForm } from './features/shortcuts.js';
import { initializeGridPresets, setupSettingsModalUIValues, setupSettingsPanel } from './features/settingsPanel.js';

async function loadData(ctx) {
    const result = await storageGet([
        'apps',
        'settings',
        'wallpaperData',
        'currentBingWallpaper',
        'currentGoogleWallpaper',
        'customSearchEngines',
        'customEngineIcons',
    ]);

    // Restore custom engines
    if (result.customSearchEngines) {
        Object.assign(ctx.state.searchEngines, result.customSearchEngines);
    }
    if (result.customEngineIcons) {
        Object.assign(ctx.state.searchEngineIconsData, result.customEngineIcons);
    }

    // Apps
    if (Array.isArray(result.apps) && result.apps.length > 0) {
        ctx.state.allApps = result.apps;

        // Migration: add iconType for old entries
        let needSave = false;
        ctx.state.allApps.forEach((app) => {
            if (!app.iconType) {
                app.iconType = app.img ? 'upload' : 'color';
                needSave = true;
            }
        });
        if (needSave) {
            await storageSet({ apps: ctx.state.allApps });
        }
    } else {
        ctx.state.allApps = JSON.parse(JSON.stringify(ctx.state.defaults.apps));
        await storageSet({ apps: ctx.state.allApps });
    }

    console.log(`[Shortcuts] Loaded ${ctx.state.allApps.length} apps from storage`);

    // Settings
    if (result.settings) {
        ctx.state.settings = { ...ctx.state.defaults.settings, ...result.settings };
    } else {
        ctx.state.settings = { ...ctx.state.defaults.settings };
        await storageSet({ settings: ctx.state.settings });
    }

    console.log('[Settings] Settings loaded successfully');

    // Search engine selection
    if (ctx.state.settings.currentSearchEngine) {
        ctx.state.currentSearchEngine = ctx.state.settings.currentSearchEngine;
    }

    // Apply critical CSS vars early (avoid flicker)
    const { body } = ctx.dom;
    body.style.setProperty('--mask-opacity', ctx.state.settings.maskOpacity / 100);
    body.style.setProperty('--wallpaper-blur', ctx.state.settings.wallpaperBlur || 0);
    body.style.setProperty('--search-width', ctx.state.settings.searchWidth + '%');
    body.style.setProperty('--search-height', (ctx.state.settings.searchHeight || 44) + 'px');
    body.style.setProperty('--search-radius', (ctx.state.settings.searchRadius || 50) + 'px');
    body.style.setProperty('--search-opacity', ctx.state.settings.searchOpacity / 100);

    applySettingsExceptMask(ctx);
    initializeGridPresets(ctx);
    setupSettingsModalUIValues(ctx);

    // Reveal UI only after persisted settings are applied (prevents FOUC).
    body.classList.add('app-ready');
    ctx.dom.container?.classList.add('ready');

    // Custom engine options in dropdown
    restoreCustomEngineOptions(ctx);
    syncEngineActiveUI(ctx);

    // Wallpaper
    const wallpaperUrl = getWallpaperUrl(ctx, result);
    console.log('[Wallpaper] wallpaperUrl:', wallpaperUrl ? wallpaperUrl.substring(0, 50) : 'null');
    console.log('[Wallpaper] settings.wallpaperSource:', ctx.state.settings.wallpaperSource);
    console.log('[Wallpaper] result.wallpaperData:', result.wallpaperData ? 'exists' : 'null');
    console.log('[Wallpaper] result.currentBingWallpaper:', result.currentBingWallpaper ? 'exists' : 'null');
    console.log('[Wallpaper] result.currentGoogleWallpaper:', result.currentGoogleWallpaper ? 'exists' : 'null');

    if (wallpaperUrl) {
        await displayWallpaper(ctx, wallpaperUrl);
        console.log('[Wallpaper] Set backgroundImage on body::before');
    } else {
        body.classList.remove('has-wallpaper');
        console.log('[Wallpaper] No wallpaper in storage, will load async');
        await loadWallpaper(ctx);
    }

    render(ctx);
}

export function initApp() {
    const state = createInitialState();
    const dom = getDom();

    const ctx = {
        state,
        dom,
        actions: {},
        _handlers: {},
    };

    ctx.actions.applySettings = () => applySettings(ctx);
    ctx.actions.applySettingsExceptMask = () => applySettingsExceptMask(ctx);

    ctx.actions.saveApps = () => {
        chrome.storage.local.set({ apps: ctx.state.allApps });
    };

    ctx.actions.saveSettings = async () => {
        await storageSet({ settings: ctx.state.settings });
        // Legacy behavior: saving settings also applies current settings.
        applySettings(ctx);
    };

    ctx.actions.render = () => render(ctx);

    // Feature setup (listeners)
    setupSearch(ctx);
    console.log('[Search] Search setup completed');
    setupWallpaperRefresh(ctx);
    setupSidebar(ctx);
    setupShortcutForm(ctx);
    setupSettingsPanel(ctx);

    // Load persisted state and render
    loadData(ctx);

    console.log('[App] Application initialized successfully');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
