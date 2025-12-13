export function applySettings(ctx) {
    const { settings } = ctx.state;
    const { body } = ctx.dom;

    body.style.setProperty('--mask-opacity', settings.maskOpacity / 100);
    body.style.setProperty('--wallpaper-blur', settings.wallpaperBlur || 0);
    applySettingsExceptMask(ctx);
}

export function applySettingsExceptMask(ctx) {
    const { settings } = ctx.state;
    const { body, searchBox } = ctx.dom;

    body.style.setProperty('--grid-cols', settings.gridCols);
    const gridElement = document.getElementById('grid');
    if (gridElement) {
        gridElement.style.gridTemplateColumns = `repeat(${settings.gridCols}, auto)`;
    }

    body.style.setProperty('--icon-size', settings.iconSize + 'px');
    body.style.setProperty('--icon-radius', (settings.iconRadius / 100) * 22);
    body.style.setProperty('--icon-opacity', settings.iconOpacity / 100);

    if (settings.hideSearchBar) {
        searchBox?.classList.add('hidden');
    } else {
        searchBox?.classList.remove('hidden');
    }

    body.style.setProperty('--search-width', settings.searchWidth + '%');
    body.style.setProperty('--search-height', (settings.searchHeight || 44) + 'px');
    body.style.setProperty('--search-radius', (settings.searchRadius || 50) + 'px');
    body.style.setProperty('--search-opacity', settings.searchOpacity / 100);

    const textShadow = settings.textShadow ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none';
    body.style.setProperty('--text-shadow-enabled', textShadow);
    body.style.setProperty('--text-size', settings.textSize + 'px');
    body.style.setProperty('--text-color', settings.textColor);
}
