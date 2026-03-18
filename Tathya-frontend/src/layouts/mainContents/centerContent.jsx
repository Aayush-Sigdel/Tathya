import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import styles from './centerContent.module.css';
import BiasMeta from '../bias/biasMeta';
import { useRelevantNews } from '../../services/fetchNewsData';

const CenterContent = () => {
    // Fetch 20 news articles
    const { data: newsGroups, loading, error, refetch } = useRelevantNews(20);

    const extractLocation = (lead) => {
        if (!lead) return 'Nepal';
        const locationMatch = lead.match(/^([^,]+),/);
        return locationMatch ? locationMatch[1].trim() : 'Nepal';
    };

    const getAverageCredibility = (newsGroup) => {
        if (!newsGroup.news || newsGroup.news.length === 0) return 0;

        const total = newsGroup.news.reduce((sum, article) => {
            const cred = article.metrics?.credibility || {};
            const up = cred.upvote || 0;
            const down = cred.downvote || 0;
            const denom = up + down;
            const score = denom ? (up / denom) * 100 : 0;
            return sum + score;
        }, 0);
        return Math.round(total / newsGroup.news.length);
    };

    // Helper function to randomly select items from array
    const getRandomItems = (items, count) => {
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

    // Helper function to get a single random item from array
    const getRandomItem = (items) => {
        if (!items || items.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * items.length);
        return items[randomIndex];
    };

    // Process all news data and randomly select articles including featured
    const { featuredArticle, selectedArticles } = useMemo(() => {
        if (!newsGroups || newsGroups.length === 0) {
            return { featuredArticle: null, selectedArticles: [] };
        }

        // Filter articles that have images for featured article selection
        const articlesWithImages = newsGroups.filter(
            (group) =>
                group.news?.[0]?.imageUrl &&
                group.news[0].imageUrl !== '' &&
                !group.news[0].imageUrl.includes('placehold')
        );

        // If no articles with images, fall back to any article
        const featuredCandidates =
            articlesWithImages.length > 0 ? articlesWithImages : newsGroups;

        // Randomly select featured article
        const featuredGroup = getRandomItem(featuredCandidates);
        const featured = featuredGroup
            ? {
                  id: featuredGroup.groupId,
                  title: featuredGroup.news?.[0]?.title || 'No title available',
                  image:
                      featuredGroup.news?.[0]?.imageUrl ||
                      'https://placehold.co/1000x400/f0f0f0/666666?text=Featured+News',
                  biasLeft: 40, // Mock bias data - keeping original layout
                  biasCenter: 55,
                  biasRight: 15,
              }
            : null;

        // Get remaining articles (excluding the featured one)
        const remainingGroups = newsGroups.filter(
            (group) => group.groupId !== featuredGroup?.groupId
        );

        // Randomly select 5 articles from the remaining ones
        const randomGroups = getRandomItems(remainingGroups, 5);

        // Process selected articles - NO IMAGES
        const articles = randomGroups.map((group) => {
            const primaryArticle = group.news?.[0] || {};
            const credibilityPercentage = getAverageCredibility(group);

            return {
                id: group.groupId,
                category: primaryArticle.category || 'News',
                location: extractLocation(primaryArticle.lead),
                title: primaryArticle.title || 'No title available',
                bias:
                    credibilityPercentage > 70
                        ? 'center'
                        : credibilityPercentage > 50
                        ? 'right'
                        : 'left',
                biasPercentage: credibilityPercentage,
                sources: group.sources?.length || group.news?.length || 0,
            };
        });

        return { featuredArticle: featured, selectedArticles: articles };
    }, [newsGroups]);

    // Loading state
    if (loading) {
        return (
            <div className={styles['center-content-container']}>
                <div className={styles['loading-container']}>
                    <Loader2 className={styles['loading-spinner']} />
                    <p>Loading news content...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles['center-content-container']}>
                <div className={styles['error-container']}>
                    <h3>Unable to load news content</h3>
                    <p>Error: {error}</p>
                    <button
                        onClick={refetch}
                        className={styles['retry-button']}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (!newsGroups || newsGroups.length === 0) {
        return (
            <div className={styles['center-content-container']}>
                <div className={styles['no-data-container']}>
                    <h3>No news content available</h3>
                    <button
                        onClick={refetch}
                        className={styles['retry-button']}>
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['center-content-container']}>
            {/* Header with refresh option */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    padding: '0 4px',
                }}>
                <h2
                    style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                    }}>
                    Top Stories
                </h2>
            </div>

            {/* Featured article - WITH IMAGE (randomly selected) */}
            {featuredArticle && (
                <Link
                    to={`/news/${featuredArticle.id}`}
                    className={styles['featured-article']}>
                    <div className={styles['featured-image-container']}>
                        <img
                            src={featuredArticle.image}
                            alt={featuredArticle.title}
                            loading="lazy"
                            onError={(e) => {
                                e.target.src =
                                    'https://placehold.co/1000x400/f0f0f0/666666?text=Featured+News';
                            }}
                        />

                        <div className={styles['featured-overlay']}>
                            <h1 className={styles['featured-title']}>
                                {featuredArticle.title}
                            </h1>
                            {/* Add a small indicator that this is randomly selected */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}>
                                Featured
                            </div>
                        </div>
                    </div>
                </Link>
            )}

            {/* Articles list - NO IMAGES (5 randomly selected from remaining) */}
            <div className={styles['articles-list']}>
                {selectedArticles.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: '#6b7280',
                        }}>
                        <p>No additional articles available</p>
                        <button
                            onClick={refetch}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginTop: '8px',
                            }}>
                            Refresh
                        </button>
                    </div>
                ) : (
                    selectedArticles.map((article, index) => (
                        <Link
                            key={`${article.id}-${index}`} // Include index for uniqueness with random selection
                            to={`/news/${article.id}`}
                            className={styles['article-item']}>
                            <div className={styles['article-content']}>
                                <div className={styles['article-header']}>
                                    <span
                                        className={styles['article-category']}>
                                        {article.category}
                                    </span>
                                    <span
                                        className={styles['article-location']}>
                                        {article.location}
                                    </span>
                                </div>

                                <h3 className={styles['article-title']}>
                                    {article.title}
                                </h3>

                                <div className={styles['article-meta']}>
                                    <BiasMeta
                                        biasPercentage={article.biasPercentage}
                                        sources={article.sources}
                                    />
                                    <span className={styles['sources-text']}>
                                        {article.sources} sources
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default CenterContent;
