// Promise-based wrappers around chrome.storage.local

export function storageGet(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => resolve(result || {}));
    });
}

export function storageSet(items) {
    return new Promise((resolve) => {
        chrome.storage.local.set(items, () => {
            if (chrome.runtime?.lastError) {
                console.error('[Storage] Set failed:', chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}
