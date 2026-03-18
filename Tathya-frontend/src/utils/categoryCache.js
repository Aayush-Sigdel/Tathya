// Category Cache Utility
const CACHE_KEY = 'tathya_categories_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

export const categoryCache = {
    // Get cached data if valid
    get: () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const parsedCache = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - parsedCache.timestamp > CACHE_DURATION) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            return parsedCache.data;
        } catch (error) {
            console.error('Error reading category cache:', error);
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    },

    // Set cache with current timestamp
    set: (data) => {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error setting category cache:', error);
        }
    },

    // Clear cache manually
    clear: () => {
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch (error) {
            console.error('Error clearing category cache:', error);
        }
    },

    // Check if cache exists and is valid
    isValid: () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return false;

            const parsedCache = JSON.parse(cached);
            const now = Date.now();

            return now - parsedCache.timestamp <= CACHE_DURATION;
        } catch (error) {
            return false;
        }
    },

    // Get cache age in seconds
    getAge: () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const parsedCache = JSON.parse(cached);
            const now = Date.now();

            return Math.floor((now - parsedCache.timestamp) / 1000);
        } catch (error) {
            return null;
        }
    },
};
