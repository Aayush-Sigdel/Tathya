import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import styles from './SimilarTopics.module.css';
import { useAllCategories } from '../../services/fetchNewsData';

const SimilarTopics = () => {
    // Fetch categories from API
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories,
    } = useAllCategories();

    // State for storing category data with representative images
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to create URL-friendly strings
    const createTopicUrl = (category) => {
        return category.toLowerCase().replace(/\s+/g, '-');
    };

    // Helper function to get a representative image for a category
    const getRepresentativeImage = async (category) => {
        try {
            // Fetch a small sample of news for this category to get an image
            const response = await fetch(
                `http://localhost:8080/newsGroup/getNewsGroupByCategory?category=${encodeURIComponent(
                    category
                )}&count=1`
            );

            if (!response.ok) {
                return (
                    'https://placehold.co/48x48/f3f4f6/6b7280?text=' +
                    category.charAt(0)
                );
            }

            const newsGroups = await response.json();

            if (
                newsGroups &&
                newsGroups.length > 0 &&
                newsGroups[0].news &&
                newsGroups[0].news.length > 0
            ) {
                const imageUrl = newsGroups[0].news[0].imageUrl;
                return (
                    imageUrl ||
                    'https://placehold.co/48x48/f3f4f6/6b7280?text=' +
                        category.charAt(0)
                );
            }

            return (
                'https://placehold.co/48x48/f3f4f6/6b7280?text=' +
                category.charAt(0)
            );
        } catch (error) {
            console.error(
                `Error fetching image for category ${category}:`,
                error
            );
            return (
                'https://placehold.co/48x48/f3f4f6/6b7280?text=' +
                category.charAt(0)
            );
        }
    };

    // Fetch category data with representative images
    useEffect(() => {
        const fetchCategoryData = async () => {
            if (!categories || categories.length === 0 || categoriesLoading) {
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Filter out 'All' category and get actual categories
                const actualCategories = categories.filter(
                    (cat) => cat !== 'All'
                );

                // Fetch representative images for each category
                const categoryPromises = actualCategories.map(
                    async (category, index) => {
                        const icon = await getRepresentativeImage(category);

                        return {
                            id: index + 1,
                            name: category,
                            icon: icon,
                            url: createTopicUrl(category),
                        };
                    }
                );

                const categoryResults = await Promise.all(categoryPromises);

                // Sort categories by name for consistency
                const sortedCategories = categoryResults.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                // Add some additional related topics if we have less than 7
                const additionalTopics = [
                    {
                        id: sortedCategories.length + 1,
                        name: 'Government Policy',
                        icon: 'https://placehold.co/48x48/3b82f6/ffffff?text=GP',
                        url: 'government-policy',
                    },
                    {
                        id: sortedCategories.length + 2,
                        name: 'Economic Development',
                        icon: 'https://placehold.co/48x48/10b981/ffffff?text=ED',
                        url: 'economic-development',
                    },
                    {
                        id: sortedCategories.length + 3,
                        name: 'Innovation & Research',
                        icon: 'https://placehold.co/48x48/8b5cf6/ffffff?text=IR',
                        url: 'innovation-research',
                    },
                ];

                // Combine and limit to 7 topics
                const allTopics = [
                    ...sortedCategories,
                    ...additionalTopics,
                ].slice(0, 7);

                setCategoryData(allTopics);
            } catch (err) {
                console.error('Error fetching category data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [categories, categoriesLoading]);

    // Handle retry
    const handleRetry = () => {
        refetchCategories();
        // Clear current data and refetch
        setCategoryData([]);
        setError(null);
    };

    // Loading state
    if (categoriesLoading || loading) {
        return (
            <div className={styles['similar-topics-container']}>
                <h2 className={styles['section-title']}>Similar News Topics</h2>
                <div className={styles['topics-list']}>
                    {Array.from({ length: 7 }, (_, i) => (
                        <div
                            key={i}
                            className={styles['topic-item']}>
                            <div className={styles['topic-content']}>
                                <div className={styles['topic-icon-container']}>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#f3f4f6',
                                            borderRadius: '50%',
                                            animation:
                                                'pulse 1.5s ease-in-out infinite alternate',
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        width: '120px',
                                        height: '20px',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '4px',
                                        animation:
                                            'pulse 1.5s ease-in-out infinite alternate',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '50%',
                                    animation:
                                        'pulse 1.5s ease-in-out infinite alternate',
                                }}
                            />
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
    if (categoriesError || error) {
        return (
            <div className={styles['similar-topics-container']}>
                <h2 className={styles['section-title']}>Similar News Topics</h2>
                <div
                    style={{
                        textAlign: 'center',
                        padding: '2rem 1rem',
                        color: '#6b7280',
                    }}>
                    <p style={{ marginBottom: '1rem' }}>
                        Unable to load topics
                    </p>
                    <button
                        onClick={handleRetry}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            margin: '0 auto',
                        }}>
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!categoryData || categoryData.length === 0) {
        return (
            <div className={styles['similar-topics-container']}>
                <h2 className={styles['section-title']}>Similar News Topics</h2>
                <div
                    style={{
                        textAlign: 'center',
                        padding: '2rem 1rem',
                        color: '#6b7280',
                    }}>
                    <p>No topics available at the moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['similar-topics-container']}>
            <h2 className={styles['section-title']}>Similar News Topics</h2>

            <div className={styles['topics-list']}>
                {categoryData.map((topic) => (
                    <Link
                        key={topic.id}
                        to={`/news?category=${encodeURIComponent(topic.name)}`}
                        className={styles['topic-item']}>
                        <div className={styles['topic-content']}>
                            <div className={styles['topic-icon-container']}>
                                <img
                                    src={topic.icon}
                                    alt={topic.name}
                                    className={styles['topic-icon']}
                                    onError={(e) => {
                                        e.target.src = `https://placehold.co/48x48/f3f4f6/6b7280?text=${topic.name.charAt(
                                            0
                                        )}`;
                                    }}
                                />
                            </div>
                            <span className={styles['topic-name']}>
                                {topic.name}
                            </span>
                        </div>
                        <button
                            className={styles['follow-button']}
                            onClick={(e) => {
                                e.preventDefault();
                                // Add follow/unfollow functionality here if needed
                                console.log(
                                    'Follow/unfollow topic:',
                                    topic.name
                                );
                            }}>
                            <Plus size={18} />
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SimilarTopics;
