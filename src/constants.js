// Shared constants (kept aligned with legacy script.js)

export const DEFAULT_PAGE_SIZE = 12;

export const DEFAULT_APPS = [
    { name: 'Bilibili', url: 'https://www.bilibili.com', color: '#fb7299', text: 'B', iconType: 'color' },
    { name: 'GitHub', url: 'https://github.com', color: '#24292e', text: 'G', iconType: 'color' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', color: '#f48024', text: 'SO', iconType: 'color' },
    { name: 'MDN', url: 'https://developer.mozilla.org', color: '#000', text: 'MDN', iconType: 'color' },
];

export const DEFAULT_SETTINGS = {
    wallpaperSource: 'local',
    maskOpacity: 45,
    wallpaperBlur: 0,
    gridCols: 6,
    showIconLabel: false,
    iconShadow: true,
    iconAnimation: true,
    iconRadius: 50,
    iconOpacity: 100,
    iconSize: 90,
    hideSearchBar: false,
    searchWidth: 60,
    searchHeight: 44,
    searchRadius: 50,
    searchOpacity: 95,
    searchTopMargin: 0,
    textShadow: true,
    textSize: 14,
    textColor: '#ffffff',
    currentSearchEngine: 'google',
};

export const DEFAULT_SEARCH_ENGINES = {
    google: {
        web: 'https://www.google.com/search?q={query}',
        images: 'https://www.google.com/search?q={query}&tbm=isch',
        news: 'https://news.google.com/search?q={query}',
        video: 'https://www.google.com/search?q={query}&tbm=vid',
        maps: 'https://www.google.com/maps/search/{query}',
    },
    bing: {
        web: 'https://www.bing.com/search?q={query}',
        images: 'https://www.bing.com/images/search?q={query}',
        news: 'https://www.bing.com/news/search?q={query}',
        video: 'https://www.bing.com/videos/search?q={query}',
        maps: 'https://www.bing.com/maps?q={query}',
    },
    baidu: {
        web: 'https://www.baidu.com/s?wd={query}',
        images: 'https://image.baidu.com/search/index?tn=baiduimage&word={query}',
        news: 'https://news.baidu.com/news?wd={query}',
        video: 'https://v.baidu.com/v?ct=301&s=25&ie=utf-8&word={query}',
        maps: 'https://api.map.baidu.com/place/search?query={query}',
    },
};

export const DEFAULT_SEARCH_ENGINE_ICONS_DATA = {
    google: { color: '#4285F4', text: 'G' },
    bing: { color: '#00A4EF', text: 'B' },
    baidu: { color: '#FF6B2B', text: '百' },
};

export const BUILTIN_ENGINES = ['google', 'bing', 'baidu'];
