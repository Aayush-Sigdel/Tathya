import React from 'react';
import { Link } from 'react-router-dom';
import styles from './centerContent.module.css';
import BiasMeta from '../bias/biasMeta';
import dummyData from '../../components/NewsComponents/dummydata.json';

const CenterContent = () => {
    const newsGroups = dummyData.newsGroups || [];

    const extractLocation = (lead) => {
        const locationMatch = lead.match(/^([^,]+),/);
        return locationMatch ? locationMatch[1].trim() : 'Nepal';
    };

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

    const featuredGroup = newsGroups[0];
    const featuredArticle = featuredGroup
        ? {
              id: featuredGroup.groupId,
              title: featuredGroup.news[0].title,
              image: featuredGroup.news[0].imageUrl,
              biasLeft: 40, // Mock bias data - keeping original layout
              biasCenter: 55,
              biasRight: 15,
          }
        : null;

    // Get articles list (remaining news groups)
    const articles = newsGroups.slice(1, 4).map((group) => {
        const primaryArticle = group.news[0];
        const credibilityPercentage = getAverageCredibility(group);

        return {
            id: group.groupId,
            category: primaryArticle.category,
            location: extractLocation(primaryArticle.lead),
            title: primaryArticle.title,
            image: primaryArticle.imageUrl,
            bias:
                credibilityPercentage > 70
                    ? 'center'
                    : credibilityPercentage > 50
                    ? 'right'
                    : 'left',
            biasPercentage: credibilityPercentage,
            sources: group.sources?.length || group.news.length,
        };
    });

    return (
        <div className={styles['center-content-container']}>
            {/* Featured article */}
            {featuredArticle && (
                <Link
                    to={`/news/${featuredArticle.id}`}
                    className={styles['featured-article']}>
                    <div className={styles['featured-image-container']}>
                        <img
                            src={featuredArticle.image}
                            alt={featuredArticle.title}
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/1000x400';
                            }}
                        />

                        <div className={styles['featured-overlay']}>
                            <h1 className={styles['featured-title']}>
                                {featuredArticle.title}
                            </h1>
                        </div>
                    </div>
                </Link>
            )}

            {/* Articles list */}
            <div className={styles['articles-list']}>
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        to={`/news/${article.id}`}
                        className={styles['article-item']}>
                        <div className={styles['article-content']}>
                            <div className={styles['article-header']}>
                                <span className={styles['article-category']}>
                                    {article.category}
                                </span>
                                <span className={styles['article-location']}>
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

                        <div className={styles['articles-image-container']}>
                            <img
                                src={article.image}
                                alt={article.title}
                                className={styles['article-image']}
                                onError={(e) => {
                                    e.target.src =
                                        'https://placehold.co/300x200';
                                }}
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CenterContent;
