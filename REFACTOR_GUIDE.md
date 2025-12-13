# New Tab Extension - 重构指南

## 概述

此项目已经从单一的 `script.js` 重构为模块化架构，以提高代码的可维护性、可扩展性和可测试性。

## 新的项目结构

```
new_tab_extension/
├── modules/
│   ├── config.js              # 配置和常量
│   ├── DataManager.js         # 数据管理（存储、读取）
│   ├── AppManager.js          # 应用/快捷方式管理
│   ├── SearchManager.js       # 搜索引擎管理
│   ├── SettingsManager.js     # 设置管理
│   ├── WallpaperManager.js    # 壁纸管理
│   ├── UIRenderer.js          # UI 渲染
│   ├── EventBus.js            # 事件系统（解耦）
│   └── utils.js               # 通用工具函数
├── script-refactored.js       # 主脚本（使用模块）
├── i18n.js                    # 国际化
├── newtab.html                # HTML 文件
├── style.css                  # 样式
└── manifest.json              # 插件配置
```

## 模块说明

### 1. **config.js** - 配置模块
集中管理所有常量、配置和枚举值。

**主要导出：**
- `SEARCH_ENGINES` - 搜索引擎配置
- `DEFAULT_APPS` - 默认应用列表
- `DEFAULT_SETTINGS` - 默认设置
- `CONSTANTS` - 应用常量（存储键、模式等）
- 各种资源 URL 列表

**优点：**
- 易于修改配置
- 集中管理魔法数字和字符串
- 便于国际化和主题化

### 2. **DataManager.js** - 数据管理模块
处理所有持久化数据操作。

**主要功能：**
```javascript
// 应用管理
loadData()           // 加载所有数据
addApp(app)         // 添加应用
updateApp(index)    // 更新应用
deleteApp(index)    // 删除应用
getApps()           // 获取所有应用

// 设置管理
updateSetting(key, value)    // 更新单个设置
updateSettings(updates)      // 批量更新设置
getSetting(key)              // 获取单个设置
getSettings()                // 获取所有设置

// 存储管理
saveWallpaperData(key, data)  // 保存壁纸
getStorageData(key)           // 获取存储数据
```

**事件回调：**
```javascript
onDataChanged(callback)      // 数据变更时触发
onSettingsChanged(callback)  // 设置变更时触发
```

### 3. **AppManager.js** - 应用管理模块
处理应用列表、分页和编辑状态。

**主要功能：**
```javascript
// 分页管理
setPageSize(size)         // 设置每页大小
getTotalPages()           // 获取总页数
setCurrentPage(page)      // 设置当前页
getCurrentPageApps()      // 获取当前页应用

// 应用操作
addApp(app)              // 添加应用
updateApp(index, app)    // 更新应用
deleteApp(index)         // 删除应用
searchApps(keyword)      // 搜索应用

// 编辑状态
enterEditMode(index)     // 进入编辑模式
exitEditMode()          // 退出编辑模式
isInEditMode()          // 检查是否编辑模式

// 拖拽功能
setDraggedItem()        // 设置拖拽项
getDraggedItem()        // 获取拖拽项
swapApps(i1, i2)       // 交换应用位置
```

### 4. **SearchManager.js** - 搜索管理模块
管理搜索引擎和搜索功能。

**主要功能：**
```javascript
// 搜索引擎管理
setSearchEngine(engine)       // 设置当前搜索引擎
getSearchEngine()             // 获取当前搜索引擎
getAllSearchEngines()         // 获取所有搜索引擎

// 搜索类型
setSearchType(type)           // 设置搜索类型
getSearchType()               // 获取搜索类型
getSearchTypes()              // 获取可用搜索类型

// 搜索操作
search(query)                 // 执行搜索
getSearchUrl(query)           // 获取搜索 URL

// 自定义搜索引擎
addCustomSearchEngine(name, template, icon)    // 添加自定义引擎
deleteCustomSearchEngine(name)                 // 删除自定义引擎
canDeleteEngine(engine)                        // 检查是否可删除
```

### 5. **SettingsManager.js** - 设置管理模块
处理应用设置和配置。

**主要功能：**
```javascript
// 设置操作
updateSetting(key, value)      // 更新单个设置
updateSettings(updates)        // 批量更新
getSetting(key)                // 获取单个设置
getAllSettings()               // 获取所有设置

// 快捷方法（图标设置）
setIconRadius(radius)
setIconOpacity(opacity)
setIconSize(size)
setIconShadow(enabled)
setIconAnimation(enabled)

// 快捷方法（搜索框设置）
setSearchWidth(width)
setSearchHeight(height)
setSearchRadius(radius)
setSearchOpacity(opacity)

// 快捷方法（壁纸设置）
setWallpaperSource(source)
setMaskOpacity(opacity)
setWallpaperBlur(blur)

// 快捷方法（文字设置）
setTextSize(size)
setTextColor(color)
setTextShadow(enabled)

// 事件
onChange(callback)  // 注册设置变更回调
```

### 6. **WallpaperManager.js** - 壁纸管理模块
处理壁纸相关的所有功能。

**主要功能：**
```javascript
// 壁纸操作
loadWallpaper()              // 加载壁纸
displayWallpaper(url, key)   // 显示壁纸
refreshWallpaper()           // 刷新壁纸

// 壁纸源
fetchBingWallpaper()         // 获取 Bing 壁纸
fetchGoogleWallpaper()       // 获取 Google 壁纸
useFallbackWallpaper()       // 使用备用壁纸

// 图片处理
compressImage(dataUrl)       // 压缩图片
checkImageTransparency(url)  // 检查透明度
convertImageToDataUrl(url)   // 转换为 data URL
```

### 7. **UIRenderer.js** - UI 渲染模块
处理所有 UI 相关的渲染和操作。

**主要功能：**
```javascript
// DOM 管理
initializeDOMElements()      // 初始化 DOM 引用
getElement(key)              // 获取单个元素
getAllElements()             // 获取所有元素

// 渲染
renderGrid()                 // 渲染应用网格
renderPagination()           // 渲染分页
applySettings()              // 应用设置样式

// 元素创建
createAppElement(app, index) // 创建应用元素

// 事件处理
handleAppClick()
handleAppContextMenu()
handleDragStart()
handleDragOver()
handleDrop()

// UI 辅助
showNotification(message)    // 显示通知
updateSearchEngineIcon()     // 更新搜索引擎图标

// 事件管理
registerEventListener()      // 注册事件
removeAllEventListeners()    // 移除所有事件
cleanup()                    // 清理资源
```

### 8. **EventBus.js** - 事件系统
实现发布-订阅模式，用于模块间通信。

**主要功能：**
```javascript
// 事件操作
on(eventName, callback)           // 注册事件监听
once(eventName, callback)         // 一次性监听
off(eventName, callback)          // 移除监听
emit(eventName, ...args)          // 触发事件

// 管理
clear()                           // 清除所有事件
clearEvent(eventName)             // 清除指定事件
```

**预定义事件：**
```javascript
EVENTS.APPS_CHANGED              // 应用列表变更
EVENTS.APP_ADDED                 // 应用已添加
EVENTS.APP_UPDATED               // 应用已更新
EVENTS.APP_DELETED               // 应用已删除

EVENTS.SETTINGS_CHANGED          // 设置变更
EVENTS.WALLPAPER_SOURCE_CHANGED  // 壁纸源变更

EVENTS.WALLPAPER_LOADED          // 壁纸加载完成
EVENTS.WALLPAPER_LOAD_FAILED     // 壁纸加载失败

EVENTS.SEARCH_ENGINE_CHANGED     // 搜索引擎变更
EVENTS.SEARCH_TYPE_CHANGED       // 搜索类型变更

EVENTS.EDIT_MODE_ENTERED         // 进入编辑模式
EVENTS.EDIT_MODE_EXITED          // 退出编辑模式

EVENTS.READY                     // 应用就绪
EVENTS.ERROR                     // 应用错误
```

### 9. **utils.js** - 工具函数模块
提供通用的工具函数。

**主要函数：**
```javascript
// URL 操作
getFaviconUrl(url)           // 获取 favicon URL
extractDomainFromUrl(url)    // 提取域名
isValidUrl(url)              // 验证 URL
addProtocolToUrl(url)        // 添加协议

// 函数式编程
debounce(func, delay)        // 防抖
throttle(func, limit)        // 节流
delay(ms)                    // 延迟

// 数据操作
generateId()                 // 生成 ID
deepClone(obj)              // 深拷贝
isEmpty(value)              // 检查是否为空

// 验证
isValidColor(color)         // 验证颜色

// 日志
log(module, message)        // 普通日志
logError(module, message)   // 错误日志
```

## 模块间通信

### 1. **直接调用**
```javascript
import appManager from './modules/AppManager.js';

// 直接调用方法
appManager.addApp({ name: 'Example', url: 'https://example.com' });
```

### 2. **事件驱动**
```javascript
import eventBus, { EVENTS } from './modules/EventBus.js';

// 监听事件
eventBus.on(EVENTS.APPS_CHANGED, (apps) => {
    console.log('Apps changed:', apps);
});

// 触发事件
eventBus.emit(EVENTS.APPS_CHANGED, newApps);
```

### 3. **回调模式**
```javascript
import dataManager from './modules/DataManager.js';

dataManager.onDataChanged((apps) => {
    // 数据变更时处理
});

dataManager.onSettingsChanged((settings) => {
    // 设置变更时处理
});
```

## 使用示例

### 添加新应用
```javascript
import appManager from './modules/AppManager.js';

const newApp = {
    name: 'My Website',
    url: 'https://example.com',
    text: 'M',
    color: '#0066cc',
    iconType: 'text'
};

appManager.addApp(newApp);
```

### 修改设置
```javascript
import settingsManager from './modules/SettingsManager.js';

// 单个修改
settingsManager.setIconSize(100);

// 批量修改
settingsManager.updateSettings({
    iconSize: 100,
    gridCols: 6,
    maskOpacity: 50
});
```

### 执行搜索
```javascript
import searchManager from './modules/SearchManager.js';

searchManager.setSearchEngine('google');
searchManager.setSearchType('web');
searchManager.search('hello world');
```

### 监听事件
```javascript
import eventBus, { EVENTS } from './modules/EventBus.js';

eventBus.on(EVENTS.APPS_CHANGED, (apps) => {
    console.log('应用已变更:', apps);
});

// 只监听一次
eventBus.once(EVENTS.READY, () => {
    console.log('应用已就绪');
});
```

## 迁移指南

### 从旧代码迁移
1. 所有全局变量已移至相应的管理模块
2. DOM 操作已集中在 `UIRenderer` 中
3. 配置已集中在 `config.js` 中
4. 事件现在通过 `EventBus` 处理

### 向后兼容
- 旧的 `script.js` 仍然存在
- 可以在测试期间同时运行两个版本
- 使用 `script-refactored.js` 逐步替换

## 改进点

✅ **更好的可维护性**
- 代码分散在不同的模块中，每个模块只负责一个功能

✅ **更高的可扩展性**
- 易于添加新功能而不影响现有代码
- 模块化设计便于插件开发

✅ **更容易测试**
- 每个模块都可以独立测试
- 事件系统便于 mock 和 stub

✅ **更好的性能**
- 模块按需加载
- 事件系统避免了循环依赖

✅ **代码重用**
- 工具函数和管理器可以在其他项目中使用

## 最佳实践

1. **不要在模块之间创建循环依赖**
   - 使用 EventBus 解耦

2. **将所有 UI 操作放在 UIRenderer 中**
   - 保持业务逻辑和 UI 分离

3. **使用 EventBus 进行模块间通信**
   - 避免直接的模块间引用

4. **将配置放在 config.js 中**
   - 便于修改和国际化

5. **使用 DataManager 处理存储**
   - 避免直接调用 chrome.storage API

## 故障排除

### 模块加载失败
- 确保使用 `<script type="module">` 标签
- 检查模块路径是否正确
- 在浏览器控制台查看错误信息

### 数据不同步
- 确保使用 DataManager 的方法修改数据
- 检查是否正确注册了回调

### 事件未触发
- 确保模块正确导入了 EventBus
- 检查事件名称是否拼写正确

## 下一步

- [ ] 编写单元测试
- [ ] 添加 TypeScript 类型定义
- [ ] 实现国际化支持
- [ ] 添加更多主题选项
- [ ] 优化壁纸加载性能
