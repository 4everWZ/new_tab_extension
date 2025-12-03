const i18nStrings = {
    en: {
        web: 'Web',
        images: 'Images',
        news: 'News',
        video: 'Video',
        maps: 'Maps',
        add_shortcut: 'Add Shortcut',
        name: 'Name',
        url: 'URL',
        icon_type: 'Icon Type',
        text: 'Text',
        image: 'Image',
        icon_text: 'Icon Text',
        color: 'Color',
        upload_image: 'Upload Image',
        save: 'Save',
        clear: 'Clear',
        settings: 'Settings',
        wallpaper: 'Wallpaper',
        wallpaper_source: 'Wallpaper Source',
        wallpaper_blur: 'Wallpaper Blur',
        mask_opacity: 'Mask Opacity',
        local_upload: 'Local Upload',
        upload: 'Upload',
        layout: 'Layout',
        grid_cols: 'Grid Columns',
        custom: 'Custom',
        custom_cols: 'Custom Columns',
        icon: 'Icon',
        hide_icon_label: 'Hide Icon Label',
        icon_shadow: 'Icon Shadow',
        animation: 'Animation',
        icon_radius: 'Icon Radius',
        icon_opacity: 'Icon Opacity',
        icon_size: 'Icon Size',
        search_box: 'Search Box',
        hide_search: 'Hide Search Box',
        search_width: 'Search Width',
        search_radius: 'Search Radius',
        search_opacity: 'Search Opacity',
        font: 'Font',
        text_shadow: 'Text Shadow',
        text_size: 'Font Size',
        text_color: 'Font Color',
        language: 'Language',
        parse_url: 'Parse'
    },
    zh: {
        web: '网页',
        images: '图片',
        news: '新闻',
        video: '视频',
        maps: '地图',
        add_shortcut: '添加快捷方式',
        name: '名称',
        url: '网址',
        icon_type: '图标类型',
        text: '文字',
        image: '图片',
        icon_text: '图标文字',
        color: '颜色',
        upload_image: '上传图片',
        save: '保存',
        clear: '清空',
        settings: '设置',
        wallpaper: '壁纸',
        wallpaper_source: '壁纸来源',
        wallpaper_blur: '壁纸模糊',
        mask_opacity: '遮罩浓度',
        local_upload: '本地上传',
        upload: '上传',
        layout: '布局',
        grid_cols: '网格列数',
        custom: '自定义',
        custom_cols: '自定义列数',
        icon: '图标',
        hide_icon_label: '隐藏图标名称',
        icon_shadow: '图标阴影',
        animation: '启动动画',
        icon_radius: '图标圆角',
        icon_opacity: '图标不透明度',
        icon_size: '图标大小',
        search_box: '搜索框',
        hide_search: '隐藏搜索框',
        search_width: '搜索框宽度',
        search_radius: '搜索框圆角',
        search_opacity: '搜索框不透明度',
        font: '字体',
        text_shadow: '字体阴影',
        text_size: '字体大小',
        text_color: '字体颜色',
        language: '语言',
        parse_url: '解析'
    }
};

let currentLanguage = 'en';

function initI18n() {
    // 从 storage 读取语言设置
    chrome.storage.local.get(['language'], (result) => {
        if (result.language) {
            currentLanguage = result.language;
        }
        updatePageLanguage();
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    chrome.storage.local.set({ language: lang });
    updatePageLanguage();
}

function t(key) {
    return i18nStrings[currentLanguage][key] || i18nStrings['en'][key] || key;
}

function updatePageLanguage() {
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // 更新 input placeholder
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = currentLanguage === 'zh' ? '搜索...' : 'Search...';
    }

    const appName = document.getElementById('app-name');
    if (appName) {
        appName.placeholder = currentLanguage === 'zh' ? '网站名称' : 'Website name';
    }

    const appUrl = document.getElementById('app-url');
    if (appUrl) {
        appUrl.placeholder = 'https://example.com';
    }

    const appText = document.getElementById('app-text');
    if (appText) {
        appText.placeholder = 'B';
    }

    // 更新 select 选项的显示文本
    document.getElementById('language-select').value = currentLanguage;

    // 更新 search type select
    updateSearchTypeOptions();
}

function updateSearchTypeOptions() {
    const searchTypeSelect = document.getElementById('search-type-select');
    if (!searchTypeSelect) return;

    const options = {
        web: currentLanguage === 'zh' ? '网页' : 'Web',
        images: currentLanguage === 'zh' ? '图片' : 'Images',
        news: currentLanguage === 'zh' ? '新闻' : 'News',
        video: currentLanguage === 'zh' ? '视频' : 'Video',
        maps: currentLanguage === 'zh' ? '地图' : 'Maps'
    };

    Array.from(searchTypeSelect.options).forEach(option => {
        option.textContent = options[option.value] || option.value;
    });
}

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}
