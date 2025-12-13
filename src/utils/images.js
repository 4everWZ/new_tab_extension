// Image helpers extracted from legacy script.js

// Compress a dataURL image so it fits comfortably under chrome.storage.local quota.
export function compressImage(dataUrl, maxSize = 8 * 1024 * 1024) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;
            let quality = 0.85;
            let result = null;

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            result = canvas.toDataURL('image/jpeg', quality);

            console.log(`[Compress] Initial size: ${(result.length / 1024 / 1024).toFixed(2)}MB`);

            while (result.length > maxSize && quality > 0.3) {
                quality -= 0.1;
                result = canvas.toDataURL('image/jpeg', quality);
                console.log(`[Compress] After quality ${quality.toFixed(2)}: ${(result.length / 1024 / 1024).toFixed(2)}MB`);
            }

            while (result.length > maxSize && width > 800) {
                width = Math.floor(width * 0.8);
                height = Math.floor(height * 0.8);
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                result = canvas.toDataURL('image/jpeg', quality);
                console.log(`[Compress] After resize to ${width}x${height}: ${(result.length / 1024 / 1024).toFixed(2)}MB`);
            }

            const originalSize = (dataUrl.length / 1024 / 1024).toFixed(2);
            const compressedSize = (result.length / 1024 / 1024).toFixed(2);
            console.log(`[Compress] ✓ Image compressed: ${originalSize}MB → ${compressedSize}MB (${Math.round((compressedSize / originalSize) * 100)}%)`);
            resolve(result);
        };
        img.onerror = () => {
            console.error('[Compress] Failed to load image for compression');
            resolve(dataUrl);
        };
        img.src = dataUrl;
    });
}

// Detect whether an image contains transparent pixels.
export function checkImageTransparency(imageUrl) {
    try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        return new Promise((resolve) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let hasTransparency = false;
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] < 200) {
                        hasTransparency = true;
                        break;
                    }
                }

                resolve(hasTransparency);
            };

            img.onerror = () => resolve(false);
            img.src = imageUrl;
        });
    } catch {
        return Promise.resolve(false);
    }
}

// Convert an image URL to a PNG dataURL (best-effort). Includes timeouts.
export function convertImageToDataUrl(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const width = img.naturalWidth || img.width;
                const height = img.naturalHeight || img.height;
                if (!width || !height) {
                    console.warn('[convertImageToDataUrl] Invalid image dimensions:', { width, height });
                    resolve(imageUrl);
                    return;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/png');
                console.log('[convertImageToDataUrl] ✓ Converted to data URL, size:', (dataUrl.length / 1024).toFixed(2) + 'KB');
                resolve(dataUrl);
            } catch (e) {
                console.error('[convertImageToDataUrl] Conversion error:', e);
                resolve(imageUrl);
            }
        };

        img.onerror = () => {
            console.warn('[convertImageToDataUrl] Failed to load image:', imageUrl);
            resolve(imageUrl);
        };

        img.onabort = () => {
            console.warn('[convertImageToDataUrl] Image loading aborted:', imageUrl);
            resolve(imageUrl);
        };

        const timeout = setTimeout(() => {
            console.warn('[convertImageToDataUrl] Image loading timeout:', imageUrl);
            img.src = '';
            resolve(imageUrl);
        }, 5000);

        const originalOnload = img.onload;
        img.onload = function () {
            clearTimeout(timeout);
            originalOnload.call(this);
        };

        img.src = imageUrl;
    });
}
