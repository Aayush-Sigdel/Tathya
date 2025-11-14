import React from 'react';
import { Link } from 'react-router-dom';
import { Circle } from 'lucide-react';
import styles from './leftContent.module.css';
import BiasMeta from '../bias/biasMeta';
import dummyData from '../../components/NewsComponents/dummydata.json';

const LeftContent = () => {
    const newsGroups = dummyData.newsGroups || [];

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
    const newsStories = newsGroups.map((group) => {
        const primaryArticle = group.news[0];
        const credibilityPercentage = getAverageCredibility(group);

        return {
            id: group.groupId,
            title: primaryArticle.title,
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

    // Get featured story (use last news group)
    const featuredGroup = newsGroups[newsGroups.length - 1];
    const featuredStory = featuredGroup
        ? {
              id: featuredGroup.groupId,
              title: featuredGroup.news[0].title,
              image: featuredGroup.news[0].imageUrl,
          }
        : null;

    return (
        <div className={styles['left-content-container']}>
            <div className={styles['header-container']}>
                <h2 className={styles['section-title']}>Top News Stories</h2>
            </div>

            <div className={styles['news-list-container']}>
                {newsStories.map((story) => (
                    <Link
                        key={story.id}
                        to={`/news/${story.id}`}
                        className={styles['news-item']}>
                        <h3 className={styles['news-title']}>{story.title}</h3>

                        <div className={styles['news-meta']}>
                            <BiasMeta
                                biasPercentage={story.biasPercentage}
                                sources={story.sources}
                            />
                        </div>
                    </Link>
                ))}
            </div>

            {/* <div className={styles['latest-update-upload-container']}>
                <Link
                    to="/latest"
                    className={styles['latest-update-link']}>
                    <span className={styles['latest-text']}>
                        Latest Updates
                    </span>
                    <span className={styles['live-indicator']}>
                        <Circle
                            size={10}
                            strokeWidth={12}
                        />
                    </span>
                </Link>
            </div> */}

            {/* {featuredStory && (
                <div className={styles['featured-story']}>
                    <img
                        src={featuredStory.image}
                        alt={featuredStory.title}
                        className={styles['featured-image']}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/300x200';
                        }}
                    />
                    <h3 className={styles['featured-title']}>
                        {featuredStory.title}
                    </h3>
                </div>
            )} */}
        </div>
    );
};

export default LeftContent;
