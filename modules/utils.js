/**
 * 工具函数模块 - 通用工具和辅助函数
 */

/**
 * 获取网站 favicon
 */
export function getFaviconUrl(urlString) {
    try {
        const url = new URL(urlString);
        const hostname = url.hostname;
        // 返回多个favicon源的数组，按优先级排列
        return [
            `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
            `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
            `${url.protocol}//${hostname}/favicon.ico`
        ];
    } catch (e) {
        console.error('[getFaviconUrl] Error parsing URL:', e);
        return [];
    }
}

/**
 * 提取 URL 中的网站名称
 */
export function extractDomainFromUrl(urlString) {
    try {
        const url = new URL(urlString);
        return url.hostname.replace('www.', '');
    } catch (e) {
        console.error('[extractDomainFromUrl] Error parsing URL:', e);
        return '';
    }
}

/**
 * 验证 URL 格式
 */
export function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 添加协议到 URL
 */
export function addProtocolToUrl(url) {
    if (!url.match(/^https?:\/\//)) {
        return 'https://' + url;
    }
    return url;
}

/**
 * 防抖函数
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * 延迟函数
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机 ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * 颜色验证
 */
export function isValidColor(color) {
    const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return regex.test(color);
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (obj instanceof Object) {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
}

/**
 * 日志函数（可选的调试）
 */
export function log(module, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    if (data) {
        console.log(`[${timestamp}] [${module}] ${message}`, data);
    } else {
        console.log(`[${timestamp}] [${module}] ${message}`);
    }
}

/**
 * 错误日志
 */
export function logError(module, message, error = null) {
    const timestamp = new Date().toLocaleTimeString();
    if (error) {
        console.error(`[${timestamp}] [${module}] ${message}`, error);
    } else {
        console.error(`[${timestamp}] [${module}] ${message}`);
    }
}

/**
 * 检查是否为空
 */
export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}
