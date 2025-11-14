import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import styles from './RightContent.module.css';
import dummyData from '../../components/NewsComponents/dummydata.json';

const RightContent = () => {
    const newsGroups = dummyData.newsGroups || [];

    // Helper function to generate mock view counts
    const generateViewCount = (index) => {
        const counts = ['2.5m', '1.8m', '3.2m', '1.2m', '4.1m'];
        return counts[index % counts.length];
    };

    // Map news groups to related news format (take first 3)
    const relatedNews = newsGroups.slice(0, 3).map((group, index) => {
        const primaryArticle = group.news[0];

        return {
            id: group.groupId,
            title: primaryArticle.title,
            image: primaryArticle.imageUrl,
            category: primaryArticle.category.toUpperCase(),
            views: generateViewCount(index),
        };
    });

    return (
        <div className={styles['right-content-container']}>
            <div className={styles['header-container']}>
                <h2 className={styles['section-title']}>Related News</h2>
                <Link
                    to="/news"
                    className={styles['see-all-link']}>
                    See all
                </Link>
            </div>

            <div className={styles['news-cards-container']}>
                {relatedNews.map((news) => (
                    <Link
                        key={news.id}
                        to={`/news/${news.id}`}
                        className={styles['news-card']}>
                        <div className={styles['card-image-container']}>
                            <img
                                src={news.image}
                                alt={news.title}
                                className={styles['card-image']}
                                onError={(e) => {
                                    e.target.src =
                                        'https://placehold.co/300x200';
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
