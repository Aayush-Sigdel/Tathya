import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MostRead.module.css';
import { useRelevantNews } from '../../services/fetchNewsData';

export default function MostRead() {
    // Fetch relevant news data from API (using getAllRelevant endpoint)
    const { data: newsGroups, loading, error, refetch } = useRelevantNews(50);

    // Helper function to calculate popularity score based on total engagement
    const calculatePopularityScore = (newsGroup) => {
        if (!newsGroup.news || !Array.isArray(newsGroup.news)) {
            return 0;
        }

        const totalEngagement = newsGroup.news.reduce((sum, article) => {
            const metrics = article.metrics || {};
            const totalVotes = Object.values(metrics).reduce(
                (voteSum, metric) => {
                    const upvote = metric?.upvote || 0;
                    const downvote = metric?.downvote || 0;
                    return voteSum + upvote + downvote;
                },
                0
            );
            return sum + totalVotes;
        }, 0);

        // Also consider view count if available
        const viewCount = newsGroup.viewCount || 0;

        // Weighted score: engagement votes + view count
        return totalEngagement + viewCount * 0.1; // View count has less weight
    };

    // Helper function to get article title safely
    const getArticleTitle = (newsGroup) => {
        if (!newsGroup.news || newsGroup.news.length === 0) {
            return 'Untitled Article';
        }

        const primaryArticle = newsGroup.news[0];
        return primaryArticle.title || 'Untitled Article';
    };

    // Helper function to truncate title if too long
    const truncateTitle = (title, maxLength = 80) => {
        if (!title) return 'Untitled Article';
        return title.length > maxLength
            ? `${title.substring(0, maxLength)}...`
            : title;
    };

    // Loading state
    if (loading) {
        // Show loading skeleton that matches the original layout
        const loadingItems = Array.from({ length: 10 }, (_, i) => (
            <div
                key={i}
                className={styles['article-item']}>
                <span className={styles['article-number']}>{i + 1}</span>
                <div
                    style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite alternate',
                    }}
                />
            </div>
        ));

        return (
            <div className={styles['main-container']}>
                <h2 className={styles['heading']}>MOST READ</h2>
                <div className={styles['articles-grid']}>{loadingItems}</div>
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
            <div className={styles['main-container']}>
                <h2 className={styles['heading']}>MOST READ</h2>
                <div
                    style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#666',
                        fontSize: '0.9rem',
                    }}>
                    <p>Unable to load most read articles</p>
                    <button
                        onClick={refetch}
                        style={{
                            background: '#e35040',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                        }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Process API data - same logic as before but with API data
    const articles = (newsGroups || [])
        .filter((group) => group && group.news && group.news.length > 0) // Filter valid groups
        .map((group, index) => {
            return {
                id: index + 1,
                groupId: group.groupId,
                title: getArticleTitle(group),
                url: `/news/${group.groupId}`,
                popularityScore: calculatePopularityScore(group),
                originalGroup: group, // Keep reference for debugging
            };
        })
        .sort((a, b) => b.popularityScore - a.popularityScore) // Sort by popularity
        .map((article, index) => ({
            ...article,
            id: index + 1, // Re-number after sorting
        }))
        .slice(0, 10); // Take top 10

    // If we have fewer than 10 articles, duplicate some to fill the list
    // This maintains the original behavior
    const paddedArticles = [...articles];
    while (paddedArticles.length < 10 && articles.length > 0) {
        const originalLength = articles.length;
        for (let i = 0; i < originalLength && paddedArticles.length < 10; i++) {
            paddedArticles.push({
                ...articles[i],
                id: paddedArticles.length + 1,
                title: articles[i].title + ' (Related Coverage)',
            });
        }
    }

    // Empty state (if no articles at all)
    if (paddedArticles.length === 0) {
        return (
            <div className={styles['main-container']}>
                <h2 className={styles['heading']}>MOST READ</h2>
                <div
                    style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#666',
                        fontSize: '0.9rem',
                    }}>
                    <p>No articles available at the moment</p>
                    <button
                        onClick={refetch}
                        style={{
                            background: '#e35040',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                        }}>
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    // Render the articles using the exact same structure as before
    return (
        <div className={styles['main-container']}>
            <h2 className={styles['heading']}>MOST READ</h2>
            <div className={styles['articles-grid']}>
                {paddedArticles.map((article) => (
                    <Link
                        key={`${article.groupId}-${article.id}`}
                        to={article.url}
                        className={styles['article-item']}>
                        <span className={styles['article-number']}>
                            {article.id}
                        </span>
                        <h3 className={styles['article-title']}>
                            {truncateTitle(article.title)}
                        </h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
