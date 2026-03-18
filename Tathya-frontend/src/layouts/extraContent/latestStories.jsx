import React from 'react';
import { Link } from 'react-router-dom';
import styles from './latestStories.module.css';
import BiasMeta from '../bias/biasMeta';
import { useLatestNews } from '../../services/fetchNewsData';

const LatestStories = () => {
    const { data: newsGroups, loading, error, refetch } = useLatestNews(5);

    // Helper function to extract location from lead
    const extractLocation = (lead) => {
        const locationMatch = lead.match(/^([^,]+),/);
        return locationMatch ? locationMatch[1].trim() : '';
    };

    // Helper function to calculate average credibility percentage
    const getAverageCredibility = (newsGroup) => {
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

    // Map news groups to stories format
    const stories = newsGroups.map((group) => {
        const primaryArticle = group.news[0];
        const credibilityPercentage = getAverageCredibility(group);
        const location = extractLocation(primaryArticle.lead);

        return {
            id: group.groupId,
            category: primaryArticle.category,
            location: location,
            title: primaryArticle.title,
            biasPercentage: credibilityPercentage,
            sources: group.sources?.length || group.news.length,
            image: primaryArticle.imageUrl,
        };
    });

    // Loading state
    if (loading) {
        return (
            <div className={styles['latest-stories-container']}>
                <h2 className={styles['section-title']}>Latest Stories</h2>
                <div className={styles['loading-container']}>
                    <div className={styles['loading-spinner']}></div>
                    <p>Loading latest stories...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles['latest-stories-container']}>
                <h2 className={styles['section-title']}>Latest Stories</h2>
                <div className={styles['error-container']}>
                    <p>Failed to load latest stories</p>
                    <button
                        onClick={refetch}
                        className={styles['retry-button']}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (stories.length === 0) {
        return (
            <div className={styles['latest-stories-container']}>
                <h2 className={styles['section-title']}>Latest Stories</h2>
                <div className={styles['empty-container']}>
                    <p>No stories available at the moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['latest-stories-container']}>
            <h2 className={styles['section-title']}>Latest Stories</h2>

            <div className={styles['stories-list']}>
                {stories.map((story) => (
                    <Link
                        to={`/news/${story.id}`}
                        key={story.id}
                        className={styles['story-item']}>
                        <div className={styles['story-content']}>
                            <div className={styles['story-header']}>
                                <span className={styles['category-text']}>
                                    {story.category}
                                </span>
                                {story.location && (
                                    <>
                                        <span className={styles['separator']}>
                                            .
                                        </span>
                                        <span
                                            className={styles['location-text']}>
                                            {story.location}
                                        </span>
                                    </>
                                )}
                            </div>

                            <h3 className={styles['story-title']}>
                                {story.title}
                            </h3>

                            <BiasMeta
                                biasPercentage={story.biasPercentage}
                                sources={story.sources}
                            />
                        </div>

                        <div className={styles['story-image-container']}>
                            <img
                                src={story.image}
                                alt={story.title}
                                className={styles['story-image']}
                                onError={(e) => {
                                    e.target.src =
                                        'https://placehold.co/300x200?text=News';
                                }}
                            />
                        </div>
                    </Link>
                ))}
            </div>

            <div className={styles['refresh-container']}>
                <button
                    onClick={refetch}
                    className={styles['refresh-button']}
                    disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Stories'}
                </button>
            </div>
        </div>
    );
};

export default LatestStories;
