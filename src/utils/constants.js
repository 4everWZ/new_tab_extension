// ==================== 常量定义 ====================

// 搜索引擎图标
export const searchEngineIcons = {
    google: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%234285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/%3E%3Cpath fill="%2334A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/%3E%3Cpath fill="%23FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/%3E%3Cpath fill="%23EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/%3E%3C/svg%3E',
    bing: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect fill="%2300A4EF" x="1" y="1" width="10" height="10"/%3E%3Crect fill="%237FBA00" x="13" y="1" width="10" height="10"/%3E%3Crect fill="%23FFB900" x="1" y="13" width="10" height="10"/%3E%3Crect fill="%23F25022" x="13" y="13" width="10" height="10"/%3E%3C/svg%3E',
    baidu: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="11" fill="%23FF6B2B"/%3E%3Cpath fill="white" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2M8 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4 8c2.2 0 4-1.8 4-4h-8c0 2.2 1.8 4 4 4z"/%3E%3C/svg%3E'
};

// 搜索引擎配置
export const searchEngines = {
    google: {
        web: 'https://www.google.com/search?q={query}',
        images: 'https://www.google.com/search?q={query}&tbm=isch',
        news: 'https://news.google.com/search?q={query}',
        video: 'https://www.google.com/search?q={query}&tbm=vid',
        maps: 'https://www.google.com/maps/search/{query}'
    },
    bing: {
        web: 'https://www.bing.com/search?q={query}',
        images: 'https://www.bing.com/images/search?q={query}',
        news: 'https://www.bing.com/news/search?q={query}',
        video: 'https://www.bing.com/videos/search?q={query}',
        maps: 'https://www.bing.com/maps?q={query}'
    },
    baidu: {
        web: 'https://www.baidu.com/s?wd={query}',
        images: 'https://image.baidu.com/search/index?tn=baiduimage&word={query}',
        news: 'https://news.baidu.com/news?wd={query}',
        video: 'https://v.baidu.com/v?ct=301&s=25&ie=utf-8&word={query}',
        maps: 'https://api.map.baidu.com/place/search?query={query}'
    }
};

// 默认快捷方式
export const defaultApps = [
    { name: "Bilibili", url: "https://www.bilibili.com", color: "#fb7299", text: "B", iconType: "color" },
    { name: "GitHub", url: "https://github.com", color: "#24292e", text: "G", iconType: "color" },
    { name: "Stack Overflow", url: "https://stackoverflow.com", color: "#f48024", text: "SO", iconType: "color" },
    { name: "MDN", url: "https://developer.mozilla.org", color: "#000", text: "MDN", iconType: "color" },
];

// 默认设置
export const defaultSettings = {
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
    currentSearchEngine: 'google'
};

// 搜索引擎图标数据
export const searchEngineIconsData = {
    google: { color: '#4285F4', text: 'G' },
    bing: { color: '#00A4EF', text: 'B' },
    baidu: { color: '#FF6B2B', text: '百' }
};

// 分页大小
export const pageSize = 12;

// Bing 壁纸 fallback 列表
export const bingFallbackWallpapers = [
    'https://www.bing.com/th?id=OHR.MerlionPark_EN-US1969991689_1920x1080.jpg',
    'https://www.bing.com/th?id=OHR.ThailandLights_EN-US2050851255_1920x1080.jpg',
    'https://www.bing.com/th?id=OHR.IslandBay_EN-US1903389508_1920x1080.jpg',
    'https://www.bing.com/th?id=OHR.SaltFlats_EN-US1845236533_1920x1080.jpg',
    'https://www.bing.com/th?id=OHR.MooningPlanet_EN-US1751910315_1920x1080.jpg',
    'https://www.bing.com/th?id=OHR.PeacockinBloom_EN-US1934253670_1920x1080.jpg',
    'https://www.bing.com/th?id=OHR.PrairieWolves_EN-US1823879373_1920x1080.jpg'
];

// Google 壁纸 fallback 列表
export const googleFallbackWallpapers = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', // 山景
    'https://images.unsplash.com/photo-1506784983066-a8165c7a090d?w=1920&h=1080&fit=crop', // 海景
    'https://images.unsplash.com/photo-1506704720897-c6b0b8ef6dba?w=1920&h=1080&fit=crop', // 森林
    'https://images.unsplash.com/photo-1506519773649-6e0ee9d4cc6e?w=1920&h=1080&fit=crop', // 峡谷
    'https://images.unsplash.com/photo-1495597720989-cebdbdd97913?w=1920&h=1080&fit=crop', // 日落
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop', // 云景
    'https://images.unsplash.com/photo-1506780773649-6e0ee9d4cc6e?w=1920&h=1080&fit=crop', // 夜景
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop'  // 海浪
];
