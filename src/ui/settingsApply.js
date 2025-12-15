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

    // Update pageSize based on grid layout (gridCols * 2 rows)
    const rows = settings.gridRows || 2;
    const newPageSize = settings.gridCols * rows;
    if (ctx.state.pageSize !== newPageSize) {
        ctx.state.pageSize = newPageSize;
        // Reset currentPage if it exceeds new total pages
        const totalPages = Math.ceil(ctx.state.allApps.length / newPageSize);
        if (ctx.state.currentPage >= totalPages) {
            ctx.state.currentPage = Math.max(0, totalPages - 1);
        }
    }

    body.style.setProperty('--grid-cols', settings.gridCols);
    body.style.setProperty('--grid-rows', rows);
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
