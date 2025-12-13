import {
    DEFAULT_APPS,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SEARCH_ENGINES,
    DEFAULT_SEARCH_ENGINE_ICONS_DATA,
    DEFAULT_SETTINGS,
} from './constants.js';

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function createInitialState() {
    return {
        pageSize: DEFAULT_PAGE_SIZE,
        currentPage: 0,
        allApps: [],
        settings: { ...DEFAULT_SETTINGS },

        currentSearchType: 'web',
        currentSearchEngine: 'google',

        // mutable configs (support custom engines)
        searchEngines: deepClone(DEFAULT_SEARCH_ENGINES),
        searchEngineIconsData: { ...DEFAULT_SEARCH_ENGINE_ICONS_DATA },

        // edit/drag state
        isEditMode: false,
        editingItemIndex: null,
        draggedItem: null,
        draggedIndex: null,

        // defaults (for reset/migration)
        defaults: {
            apps: deepClone(DEFAULT_APPS),
            settings: { ...DEFAULT_SETTINGS },
        },
    };
}
