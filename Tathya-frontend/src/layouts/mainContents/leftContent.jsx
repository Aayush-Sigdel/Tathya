import React from 'react';
import { Link } from 'react-router-dom';
import { Circle } from 'lucide-react';
import styles from './leftContent.module.css';
import BiasMeta from '../bias/biasMeta';
import { useRelevantNews } from '../../services/fetchNewsData';

const LeftContent = () => {
    const { data: newsGroups, loading, error, refetch } = useRelevantNews(6);

    // Helper function to calculate engagement score based on votes
    const calculateEngagementScore = (newsGroup) => {
        if (!newsGroup.news || !Array.isArray(newsGroup.news)) {
            return 0;
        }

        const totalEngagement = newsGroup.news.reduce((sum, article) => {
            const metrics = article.metrics || {};
            let articleEngagement = 0;

            Object.values(metrics).forEach((metric) => {
                articleEngagement +=
                    (metric.upvote || 0) + (metric.downvote || 0);
            });

            return sum + articleEngagement;
        }, 0);

        return totalEngagement;
    };

    // Helper function to calculate total score (views + engagement)
    const calculateTotalScore = (newsGroup) => {
        const viewCount = newsGroup.viewCount || 0;
        const engagementScore = calculateEngagementScore(newsGroup);

        const viewWeight = 0.7;
        const engagementWeight = 0.3;

        return viewCount * viewWeight + engagementScore * 10 * engagementWeight;
    };

    // Helper function to calculate average credibility percentage
    const getAverageCredibility = (newsGroup) => {
        if (!newsGroup.news || !Array.isArray(newsGroup.news)) {
            return 85;
        }

        const total = newsGroup.news.reduce((sum, article) => {
            const cred = article.metrics?.credibility || {};
            const up = cred.upvote || 0;
            const down = cred.downvote || 0;
            const denom = up + down;
            const score = denom ? (up / denom) * 100 : 85;
            return sum + score;
        }, 0);

        return Math.round(total / newsGroup.news.length);
    };

    // Helper function to format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    // Process and sort news stories
    const processNewsStories = () => {
        const newsGroupsWithScores = newsGroups.map((group) => ({
            ...group,
            totalScore: calculateTotalScore(group),
            engagementScore: calculateEngagementScore(group),
        }));

        const sortedGroups = newsGroupsWithScores.sort(
            (a, b) => b.totalScore - a.totalScore
        );

        return sortedGroups.map((group) => {
            const primaryArticle = group.news?.[0] || {};
            const credibilityPercentage = getAverageCredibility(group);

            return {
                id: group.groupId || group.id,
                title: primaryArticle.title || 'Untitled',
                bias:
                    credibilityPercentage > 70
                        ? 'center'
                        : credibilityPercentage > 50
                        ? 'right'
                        : 'left',
                biasPercentage: credibilityPercentage,
                sources: group.sources?.length || group.news?.length || 1,
                viewCount: group.viewCount || 0,
                engagementScore: group.engagementScore,
                totalScore: group.totalScore,
            };
        });
    };

    const newsStories = processNewsStories();

    // Loading state
    if (loading) {
        return (
            <div className={styles['left-content-container']}>
                <div className={styles['header-container']}>
                    <h2 className={styles['section-title']}>
                        Top News Stories
                    </h2>
                </div>
                <div className={styles['news-list-container']}>
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#666',
                        }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles['left-content-container']}>
                <div className={styles['header-container']}>
                    <h2 className={styles['section-title']}>
                        Top News Stories
                    </h2>
                </div>
                <div className={styles['news-list-container']}>
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#999',
                        }}>
                        <p>Failed to load top news</p>
                        <button
                            onClick={refetch}
                            style={{
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (newsStories.length === 0) {
        return (
            <div className={styles['left-content-container']}>
                <div className={styles['header-container']}>
                    <h2 className={styles['section-title']}>
                        Top News Stories
                    </h2>
                </div>
                <div className={styles['news-list-container']}>
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#666',
                        }}>
                        No news stories available
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['left-content-container']}>
            <div className={styles['header-container']}>
                <h2 className={styles['section-title']}>Top News Stories</h2>
                <small style={{ color: '#666', fontSize: '12px' }}>
                    Ranked by views and engagement
                </small>
            </div>

            <div className={styles['news-list-container']}>
                {newsStories.map((story, index) => (
                    <Link
                        key={story.id}
                        to={`/news/${story.id}`}
                        className={styles['news-item']}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                            }}>
                            <span
                                style={{
                                    color: '#999',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    minWidth: '20px',
                                }}>
                                {index + 1}.
                            </span>
                            <div style={{ flex: 1 }}>
                                <h3 className={styles['news-title']}>
                                    {story.title}
                                </h3>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px',
                                    }}>
                                    {story.viewCount > 0 && (
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                color: '#666',
                                                background: '#f5f5f5',
                                                padding: '2px 6px',
                                                borderRadius: '8px',
                                            }}>
                                            {formatNumber(story.viewCount)}
                                        </span>
                                    )}
                                    {story.engagementScore > 0 && (
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                color: '#666',
                                                background: '#f0f8ff',
                                                padding: '2px 6px',
                                                borderRadius: '8px',
                                            }}>
                                            {story.engagementScore}
                                        </span>
                                    )}
                                </div>

                                <div className={styles['news-meta']}>
                                    <BiasMeta
                                        biasPercentage={story.biasPercentage}
                                        sources={story.sources}
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default LeftContent;
