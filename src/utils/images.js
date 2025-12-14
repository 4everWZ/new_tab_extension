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

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
        reader.readAsDataURL(blob);
    });
}

function isCacheableRemoteImageUrl(imageUrl) {
    try {
        const url = new URL(imageUrl);
        if (url.protocol !== 'https:') return false;
        const host = url.hostname;
        return host === 'icons.duckduckgo.com' || host.endsWith('.gstatic.com') || host.endsWith('.google.com') || host === 'www.google.com';
    } catch {
        return false;
    }
}

// Fetch an image and return it as a data URL.
// For cross-origin sources, this relies on the MV3 DNR ruleset to add ACAO headers.
export async function fetchImageToDataUrl(imageUrl, { timeoutMs = 8000, maxBytes = 2 * 1024 * 1024 } = {}) {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    if (imageUrl.startsWith('data:')) return imageUrl;

    // Avoid noisy failures and extra permissions: only cache from known favicon providers.
    if (!isCacheableRemoteImageUrl(imageUrl)) return null;

    // Fetch (original design). With DNR rules that add ACAO, this should not trigger CORS errors.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const resp = await fetch(imageUrl, {
            signal: controller.signal,
            cache: 'force-cache',
            redirect: 'follow',
            credentials: 'omit',
        });
        if (resp?.ok) {
            const blob = await resp.blob();
            if (maxBytes && blob.size > maxBytes) return null;
            const dataUrl = await blobToDataUrl(blob);
            return typeof dataUrl === 'string' && dataUrl.startsWith('data:') ? dataUrl : null;
        }
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }

    return null;
}

// Detect whether an image contains transparent pixels.
export function checkImageTransparency(imageUrl) {
    return (async () => {
        try {
            if (!imageUrl?.startsWith('data:') && !isCacheableRemoteImageUrl(imageUrl)) return false;
            const safeUrl = imageUrl?.startsWith('data:')
                ? imageUrl
                : await fetchImageToDataUrl(imageUrl, { timeoutMs: 8000, maxBytes: 2 * 1024 * 1024 });

            if (!safeUrl || !safeUrl.startsWith('data:')) return false;

            const img = new Image();
            return await new Promise((resolve) => {
                img.onload = () => {
                    try {
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
                    } catch {
                        resolve(false);
                    }
                };
                img.onerror = () => resolve(false);
                img.src = safeUrl;
            });
        } catch {
            return false;
        }
    })();
}

// Convert an image URL to a PNG dataURL (best-effort). Includes timeouts.
export function convertImageToDataUrl(imageUrl) {
    return (async () => {
        if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;
        if (imageUrl.startsWith('data:')) return imageUrl;

        if (!isCacheableRemoteImageUrl(imageUrl)) return imageUrl;

        // Prefer fetch-based conversion.
        const fetched = await fetchImageToDataUrl(imageUrl, { timeoutMs: 8000, maxBytes: 2 * 1024 * 1024 });
        if (fetched) return fetched;

        // Fallback: try HTMLImageElement+canvas (may be blocked/tainted without CORS).
        return await new Promise((resolve) => {
            const img = new Image();
            let done = false;
            const finish = (value) => {
                if (done) return;
                done = true;
                resolve(value);
            };

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const width = img.naturalWidth || img.width;
                    const height = img.naturalHeight || img.height;
                    if (!width || !height) return finish(imageUrl);
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/png');
                    finish(dataUrl);
                } catch {
                    finish(imageUrl);
                }
            };

            img.onerror = () => finish(imageUrl);
            img.onabort = () => finish(imageUrl);

            const timeout = setTimeout(() => {
                img.src = '';
                finish(imageUrl);
            }, 5000);

            const originalOnload = img.onload;
            img.onload = function () {
                clearTimeout(timeout);
                originalOnload.call(this);
            };

            img.src = imageUrl;
        });
    })();
}
