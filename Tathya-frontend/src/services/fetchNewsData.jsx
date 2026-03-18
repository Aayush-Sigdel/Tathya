import { useState, useEffect } from 'react';
import { categoryCache } from '../utils/categoryCache';

// Base API URL
const API_BASE_URL = 'http://localhost:8080/newsGroup';

/**
 * Custom hook for fetching news data
 * Only fetches when the component mounts (preview UI opens)
 */

// Hook for getting single news group by ID
export const useNewsGroup = (id) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchNewsGroup = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE_URL}/get?id=${id}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error('Failed to fetch news group:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsGroup();
    }, [id]); // Only runs when ID changes

    return { data, loading, error };
};

// Hook for dynamically fetching categories with caching
export const useAllCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchAllCategories = async (useCache = true) => {
            try {
                setLoading(true);
                setError(null);

                // Check cache first if useCache is true
                if (useCache) {
                    const cachedData = categoryCache.get();
                    if (cachedData && cachedData.categories) {
                        setCategories(cachedData.categories);
                        setLastUpdated(new Date(cachedData.timestamp));
                        setLoading(false);
                        return;
                    }
                }

                console.log('Fetching categories from API...');

                // Fetch from API
                const response = await fetch(
                    `${API_BASE_URL}/getAllLatest?count=40`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const newsGroups = await response.json();
                const categorySet = new Set();

                // Extract unique categories from all news articles
                newsGroups.forEach((group) => {
                    group.news?.forEach((article) => {
                        if (article.category) {
                            categorySet.add(article.category);
                        }
                    });
                });

                const uniqueCategories = Array.from(categorySet).sort();
                const finalCategories = ['All', ...uniqueCategories];

                setCategories(finalCategories);
                setLastUpdated(new Date());

                // Cache the result (will be combined with counts later)
                const existingCache = categoryCache.get() || {};
                categoryCache.set({
                    ...existingCache,
                    categories: finalCategories,
                    timestamp: Date.now(),
                });
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError(err.message);

                // Try to use cached data even if stale
                const cachedData = categoryCache.get();
                if (cachedData && cachedData.categories) {
                    setCategories(cachedData.categories);
                } else {
                    // Final fallback to default categories
                    setCategories([
                        'All',
                        'Politics',
                        'Business',
                        'Technology',
                        'Environment',
                        'National',
                        'Economy',
                        'Sports',
                        'Health',
                        'Education',
                        'International',
                    ]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllCategories();
    }, []);

    const refetch = () => {
        fetchAllCategories(false); // Force fetch without cache
    };

    return { categories, loading, error, lastUpdated, refetch };
};

// Hook for getting category counts with caching
export const useCategoryCounts = (categories) => {
    const [categoryCounts, setCategoryCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (!categories || categories.length === 0) return;

        const fetchCategoryCounts = async (useCache = true) => {
            try {
                setLoading(true);
                setError(null);

                // Check cache first if useCache is true
                if (useCache) {
                    const cachedData = categoryCache.get();
                    if (cachedData && cachedData.categoryCounts) {
                        setCategoryCounts(cachedData.categoryCounts);
                        setLastUpdated(new Date(cachedData.timestamp));
                        setLoading(false);
                        return;
                    }
                }

                console.log('Fetching category counts from API...');

                const counts = {};

                // Fetch news for each category to get the count
                const fetchPromises = categories
                    .filter((cat) => cat !== 'All')
                    .map(async (category) => {
                        try {
                            const response = await fetch(
                                `${API_BASE_URL}/getNewsGroupByCategory?category=${encodeURIComponent(
                                    category
                                )}&count=100`
                            );
                            if (response.ok) {
                                const data = await response.json();
                                counts[category] = Array.isArray(data)
                                    ? data.length
                                    : 0;
                            } else {
                                counts[category] = 0;
                            }
                        } catch (error) {
                            console.error(`Error fetching ${category}:`, error);
                            counts[category] = 0;
                        }
                    });

                await Promise.all(fetchPromises);

                // Calculate total for 'All' category
                counts.All = Object.values(counts).reduce(
                    (sum, count) => sum + count,
                    0
                );

                setCategoryCounts(counts);
                setLastUpdated(new Date());

                // Cache the result
                const existingCache = categoryCache.get() || {};
                categoryCache.set({
                    ...existingCache,
                    categoryCounts: counts,
                    timestamp: Date.now(),
                });
            } catch (error) {
                console.error('Error fetching category counts:', error);
                setError(error.message);

                // Try to use cached data even if stale
                const cachedData = categoryCache.get();
                if (cachedData && cachedData.categoryCounts) {
                    setCategoryCounts(cachedData.categoryCounts);
                } else {
                    // Set default counts if API fails
                    const defaultCounts = {};
                    categories.forEach((cat) => {
                        defaultCounts[cat] = 0;
                    });
                    setCategoryCounts(defaultCounts);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryCounts();
    }, [categories]);

    const refetch = () => {
        if (categories && categories.length > 0) {
            fetchCategoryCounts(false); // Force fetch without cache
        }
    };

    return { categoryCounts, loading, error, lastUpdated, refetch };
};

// Hook for getting latest news
export const useLatestNews = (count = 10) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestNews = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${API_BASE_URL}/getAllLatest?count=${count}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Failed to fetch latest news:', err);
                setError(err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestNews();
    }, []); // EMPTY dependency → runs only once when component mounts

    const refetch = () => {
        setLoading(true);
        fetchLatestNews();
    };

    return { data, loading, error, refetch };
};

// Hook for getting relevant news
export const useRelevantNews = (count = 10) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRelevantNews = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${API_BASE_URL}/getAllRelevant?count=${count}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Failed to fetch relevant news:', err);
                setError(err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRelevantNews();
    }, []); // EMPTY dependency → runs only once when component mounts

    const refetch = () => {
        setLoading(true);
        fetchRelevantNews();
    };

    return { data, loading, error, refetch };
};

// Hook for getting blindspot news
export const useBlindspotNews = (count = 5) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlindspotNews = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${API_BASE_URL}/getAllBlindSpots?count=${count}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Failed to fetch blindspot news:', err);
                setError(err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBlindspotNews();
    }, []); // EMPTY dependency → runs only once when component mounts

    const refetch = () => {
        setLoading(true);
        fetchBlindspotNews();
    };

    return { data, loading, error, refetch };
};

// Hook for getting news by category
export const useNewsByCategory = (category, count = 10) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!category || category === 'All') {
            // If category is 'All', fetch latest news instead
            const fetchAllNews = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const response = await fetch(
                        `${API_BASE_URL}/getAllLatest?count=${count}`
                    );

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }

                    const result = await response.json();
                    setData(Array.isArray(result) ? result : []);
                } catch (err) {
                    console.error('Failed to fetch all news:', err);
                    setError(err.message);
                    setData([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchAllNews();
            return;
        }

        const fetchNewsByCategory = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${API_BASE_URL}/getNewsGroupByCategory?category=${encodeURIComponent(
                        category
                    )}&count=${count}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Failed to fetch news by category:', err);
                setError(err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsByCategory();
    }, [category, count]); // Runs when category or count changes

    const refetch = () => {
        setLoading(true);
        if (!category || category === 'All') {
            // Re-fetch all news
            fetch(`${API_BASE_URL}/getAllLatest?count=${count}`)
                .then((response) => response.json())
                .then((result) => setData(Array.isArray(result) ? result : []))
                .catch((err) => {
                    setError(err.message);
                    setData([]);
                })
                .finally(() => setLoading(false));
        } else {
            // Re-fetch category news
            fetch(
                `${API_BASE_URL}/getNewsGroupByCategory?category=${encodeURIComponent(
                    category
                )}&count=${count}`
            )
                .then((response) => response.json())
                .then((result) => setData(Array.isArray(result) ? result : []))
                .catch((err) => {
                    setError(err.message);
                    setData([]);
                })
                .finally(() => setLoading(false));
        }
    };

    return { data, loading, error, refetch };
};

// Direct API functions with cache management
export const newsAPI = {
    // Get single news group
    getNewsGroup: async (id) => {
        const response = await fetch(`${API_BASE_URL}/get?id=${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    // Get latest news
    getLatestNews: async (count = 10) => {
        const response = await fetch(
            `${API_BASE_URL}/getAllLatest?count=${count}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    // Get relevant news
    getRelevantNews: async (count = 10) => {
        const response = await fetch(
            `${API_BASE_URL}/getAllRelevant?count=${count}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    // Get blindspot news
    getBlindspotNews: async (count = 5) => {
        const response = await fetch(
            `${API_BASE_URL}/getAllBlindSpots?count=${count}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    // Get news by category
    getNewsByCategory: async (category, count = 10) => {
        const response = await fetch(
            `${API_BASE_URL}/getNewsGroupByCategory?category=${encodeURIComponent(
                category
            )}&count=${count}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    // Get all available categories with caching
    getAllCategories: async (useCache = true) => {
        if (useCache) {
            const cachedData = categoryCache.get();
            if (cachedData && cachedData.categories) {
                return cachedData.categories;
            }
        }

        const response = await fetch(`${API_BASE_URL}/getAllLatest?count=40`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newsGroups = await response.json();
        const categorySet = new Set();

        newsGroups.forEach((group) => {
            group.news?.forEach((article) => {
                if (article.category) {
                    categorySet.add(article.category);
                }
            });
        });

        const categories = ['All', ...Array.from(categorySet).sort()];

        // Cache the result
        const existingCache = categoryCache.get() || {};
        categoryCache.set({
            ...existingCache,
            categories,
            timestamp: Date.now(),
        });

        return categories;
    },

    // Clear category cache
    clearCategoryCache: () => {
        categoryCache.clear();
    },
};

// Example usage for existing components:

// For Latest Stories Component
export default function LatestStoriesExample() {
    const { data: stories, loading, error, refetch } = useLatestNews(2);

    if (loading) return <div>Loading latest stories...</div>;
    if (error)
        return (
            <div>
                Error: {error} <button onClick={refetch}>Retry</button>
            </div>
        );

    return (
        <div>
            {stories.map((story) => (
                <div key={story.groupId}>
                    <h3>{story.news?.[0]?.title}</h3>
                    <p>{story.sources?.length || 0} sources</p>
                </div>
            ))}
        </div>
    );
}

// For Right Content Component
export function RightContentExample() {
    const { data: relevantNews, loading, error } = useRelevantNews(3);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Failed to load related news</div>;

    return (
        <div>
            <h2>Related News</h2>
            {relevantNews.map((news) => (
                <div key={news.groupId}>
                    <h4>{news.news?.[0]?.title}</h4>
                    <span>{news.viewCount} views</span>
                </div>
            ))}
        </div>
    );
}

// For Left Content Component
export function LeftContentExample() {
    const { data: topNews, loading, error } = useRelevantNews(5);

    if (loading) return <div>Loading top stories...</div>;
    if (error) return <div>Failed to load top news</div>;

    return (
        <div>
            <h2>Top News Stories</h2>
            {topNews.map((story, index) => (
                <div key={story.groupId}>
                    <span>{index + 1}.</span>
                    <h4>{story.news?.[0]?.title}</h4>
                    <span>{story.viewCount} views</span>
                </div>
            ))}
        </div>
    );
}

// For Blindspot Component
export function BlindspotExample() {
    const { data: blindspots, loading, error, refetch } = useBlindspotNews(1);

    if (loading) return <div>Finding blindspots...</div>;
    if (error)
        return (
            <div>
                Unable to load blindspots{' '}
                <button onClick={refetch}>Try Again</button>
            </div>
        );

    return (
        <div>
            <h1>Media Blindspots</h1>
            {blindspots.map((story) => (
                <article key={story.id}>
                    <h2>{story.title}</h2>
                    <p>{story.lead}</p>
                    <span>{story.category}</span>
                </article>
            ))}
        </div>
    );
}
