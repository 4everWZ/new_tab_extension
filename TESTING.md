# Extension Testing Guide

## Manual Testing in Chrome

### Step 1: Load Extension in Developer Mode
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `new_tab_extension` folder

### Step 2: Test Core Features

#### 1. New Tab Opens
- Open a new tab (Ctrl+T or Cmd+T)
- Should see the custom new tab page with:
  - Search box at the top
  - Wallpaper in background
  - Application shortcuts in grid
  - Settings sidebar on the right

#### 2. Search Functionality
- Type a search query in the search box and press Enter
- Should open Google search results
- Click on the search engine icon/dropdown
- Should see options for Google, Bing, Baidu
- Click on a different search engine
- Try searching again - should use the selected engine

#### 3. Application Shortcuts
- Click "Add" in the sidebar
- Fill in:
  - **Name**: Any website name (e.g., "GitHub")
  - **URL**: Website URL (e.g., "https://github.com")
  - **Icon Type**: Text (default) or Image
  - If Text: Enter a letter and color
  - If Image: Upload an image file
- Click "Save"
- New shortcut should appear in the grid
- Click the shortcut to open the website in a new tab

#### 4. Settings
- Click "Settings" in the sidebar
- Adjust settings:
  - **Wallpaper Source**: Local, Bing, Google
  - **Mask Opacity**: Adjust transparency of wallpaper overlay
  - **Icon Radius**: Change app icon border radius
  - **Search Width**: Adjust search box width
  - **Text Size**: Change font size
  - **Language**: Select language (currently only Chinese available)
- Changes should apply immediately

#### 5. Wallpaper Management
- In Settings, change Wallpaper Source to "Local"
- Click "Upload Wallpaper"
- Select an image file
- Image should appear as background
- Click wallpaper refresh button (🔄) to change to Bing/Google wallpapers

#### 6. Edit & Delete Shortcuts
- Hover over any shortcut
- Click the edit button (✎) to modify
- Click the delete button (×) to remove

#### 7. Drag & Drop
- Click and drag shortcuts to reorder them
- Changes should be saved automatically

## Console Logs

Check the console for debug messages:
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Go to "Console" tab
3. You should see logs like:
   - `[App] Application initialized successfully`
   - `[Shortcuts] Loaded X apps from storage`
   - `[Settings] Settings loaded successfully`
   - `[Search] Search setup completed`

## Common Issues & Debugging

### "Cannot set properties of null" error
- Check that all HTML element IDs match what modules expect
- Verify HTML file is properly formatted
- Clear browser cache and reload extension

### Settings not saving
- Check Chrome storage is enabled
- Look for `chrome.storage` errors in console
- Try opening Settings again to verify persistence

### Shortcuts not displaying
- Check if grid container (#grid) exists in HTML
- Verify shortcuts are being loaded from storage
- Check console for `[Shortcuts]` log messages

### Search not working
- Verify search-input element exists
- Check if search engine dropdown is accessible
- Try a simple query and check console logs

## Performance Notes

- Initial load may take 1-2 seconds as modules initialize
- Wallpaper loading depends on internet connection
- Large wallpaper images (>5MB) are automatically compressed

## Next Steps

If all features work correctly:
1. The extension is ready for production
2. Package it for distribution
3. Submit to Chrome Web Store if desired
