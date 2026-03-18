import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import styles from './RightContent.module.css';
import { useRelevantNews } from '../../services/fetchNewsData';

const RightContent = () => {
    // Fetch 10 news articles instead of 3
    const { data: newsGroups, loading, error, refetch } = useRelevantNews(10);

    // Helper function to process API data
    const processApiData = (newsGroups) => {
        if (!newsGroups || !Array.isArray(newsGroups)) {
            return [];
        }

        return newsGroups.map((group) => {
            const primaryArticle = group.news?.[0] || {};

            return {
                id: group.groupId || group.id,
                title: primaryArticle.title || 'Untitled',
                image:
                    primaryArticle.imageUrl || 'https://placehold.co/300x200',
                category: (primaryArticle.category || 'NEWS').toUpperCase(),
                views: formatViewCount(group.viewCount || 0),
                originalData: group, // Keep reference to original data
            };
        });
    };

    // Helper function to format view count
    const formatViewCount = (count) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}m`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    // Helper function to randomly select 3 items from array
    const getRandomItems = (items, count = 3) => {
        if (!items || items.length === 0) {
            return [];
        }

        if (items.length <= count) {
            return items;
        }

        // Create a copy of the array to avoid mutating the original
        const shuffled = [...items];

        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, count);
    };

    // Process all news data
    const allProcessedNews = useMemo(() => {
        return processApiData(newsGroups);
    }, [newsGroups]);

    // Randomly select 3 news items from the 10 fetched
    // useMemo with a dependency on the data ensures we get new random selection
    // when the data changes, but maintains consistency during re-renders
    const selectedNews = useMemo(() => {
        return getRandomItems(allProcessedNews, 3);
    }, [allProcessedNews]);

    // Loading state
    if (loading) {
        return (
            <div className={styles['right-content-container']}>
                <div className={styles['header-container']}>
                    <h2 className={styles['section-title']}>Related News</h2>
                </div>
                <div className={styles['news-cards-container']}>
                    {/* Show 3 loading skeletons */}
                    {Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={index}
                            className={styles['news-card']}>
                            <div className={styles['card-image-container']}>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '8px',
                                        animation:
                                            'pulse 1.5s ease-in-out infinite alternate',
                                    }}
                                />
                            </div>
                            <div className={styles['card-content']}>
                                <div
                                    style={{
                                        width: '60px',
                                        height: '12px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        animation:
                                            'pulse 1.5s ease-in-out infinite alternate',
                                    }}
                                />
                                <div
                                    style={{
                                        width: '90%',
                                        height: '16px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        marginBottom: '4px',
                                        animation:
                                            'pulse 1.5s ease-in-out infinite alternate',
                                    }}
                                />
                                <div
                                    style={{
                                        width: '70%',
                                        height: '16px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        animation:
                                            'pulse 1.5s ease-in-out infinite alternate',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <style jsx>{`
                    @keyframes pulse {
                        0% {
                            opacity: 0.6;
                        }
                        100% {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles['right-content-container']}>
                <div className={styles['header-container']}>
                    <h2 className={styles['section-title']}>Related News</h2>
                </div>
                <div className={styles['news-cards-container']}>
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#999',
                        }}>
                        <p>Failed to load related news</p>
                        <button
                            onClick={refetch}
                            style={{
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginTop: '8px',
                            }}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!selectedNews || selectedNews.length === 0) {
        return (
            <div className={styles['right-content-container']}>
                <div className={styles['header-container']}>
                    <h2 className={styles['section-title']}>Related News</h2>
                </div>
                <div className={styles['news-cards-container']}>
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#666',
                        }}>
                        No related news available
                        <button
                            onClick={refetch}
                            style={{
                                display: 'block',
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginTop: '8px',
                                margin: '8px auto 0',
                            }}>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['right-content-container']}>
            <div className={styles['header-container']}>
                <h2 className={styles['section-title']}>Related News</h2>
                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                    }}>
                    <Link
                        to="/news"
                        className={styles['see-all-link']}>
                        See all
                    </Link>
                </div>
            </div>

            <div className={styles['news-cards-container']}>
                {selectedNews.map((news, index) => (
                    <Link
                        key={`${news.id}-${index}`} // Include index to ensure uniqueness for random selection
                        to={`/news/${news.id}`}
                        className={styles['news-card']}>
                        <div className={styles['card-image-container']}>
                            <img
                                src={news.image}
                                alt={news.title}
                                className={styles['card-image']}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src =
                                        'https://placehold.co/300x200/f0f0f0/666666?text=News';
                                }}
                            />
                            <div className={styles['category-badge']}>
                                <span className={styles['category-text']}>
                                    {news.category}
                                </span>
                            </div>
                        </div>

                        <div className={styles['card-content']}>
                            <div className={styles['views-container']}>
                                <Eye
                                    size={14}
                                    className={styles['eye-icon']}
                                />
                                <span className={styles['views-text']}>
                                    {news.views}
                                </span>
                            </div>
                            <h3 className={styles['card-title']}>
                                {news.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RightContent;
