export function setupSidebar(ctx) {
    const { sidebar, sidebarToggleBtn, sidebarCloseBtn, addTab, settingsTab } = ctx.dom;

    sidebarToggleBtn?.addEventListener('click', () => {
        sidebar?.classList.add('open');
    });

    sidebarCloseBtn?.addEventListener('click', () => {
        sidebar?.classList.remove('open');
    });

    addTab?.addEventListener('click', () => switchTab(ctx, 'add'));
    settingsTab?.addEventListener('click', () => switchTab(ctx, 'settings'));
}

export function switchTab(ctx, tabName) {
    document.querySelectorAll('.sidebar-tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
    document.getElementById(`${tabName}-panel`)?.classList.add('active');
}
