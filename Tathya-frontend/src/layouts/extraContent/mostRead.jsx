import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MostRead.module.css';
import dummyData from '../../components/NewsComponents/dummydata.json';

export default function MostRead() {
    const newsGroups = dummyData.newsGroups || [];

    // Helper function to calculate popularity score based on total engagement
    const calculatePopularityScore = (newsGroup) => {
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
        return totalEngagement;
    };

    // Create articles array from news groups, sorted by popularity
    const articles = newsGroups
        .map((group, index) => {
            const primaryArticle = group.news[0];
            return {
                id: index + 1, // Use sequential numbering for ranking
                groupId: group.groupId,
                title: primaryArticle.title,
                url: `/news/${group.groupId}`,
                popularityScore: calculatePopularityScore(group),
            };
        })
        .sort((a, b) => b.popularityScore - a.popularityScore) // Sort by popularity
        .map((article, index) => ({
            ...article,
            id: index + 1, // Re-number after sorting
        }))
        .slice(0, 10); // Take top 10

    // If we have fewer than 10 articles, duplicate some to fill the list
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
                            {article.title}
                        </h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
