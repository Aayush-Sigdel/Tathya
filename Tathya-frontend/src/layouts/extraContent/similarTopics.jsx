import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import styles from './SimilarTopics.module.css';
import dummyData from '../../components/NewsComponents/dummydata.json';

const SimilarTopics = () => {
    const newsGroups = dummyData.newsGroups || [];

    // Helper function to create URL-friendly strings
    const createTopicUrl = (category) => {
        return category.toLowerCase().replace(/\s+/g, '-');
    };

    // Extract categories and create topics from news data
    const categoriesFromNews = [
        ...new Set(newsGroups.map((group) => group.news[0].category)),
    ];

    // Create topics array from categories with representative images
    const topics = categoriesFromNews.map((category, index) => {
        // Find a news group with this category to get an image
        const representativeGroup = newsGroups.find(
            (group) => group.news[0].category === category
        );

        return {
            id: index + 1,
            name: category,
            icon: representativeGroup
                ? representativeGroup.news[0].imageUrl
                : '',
            url: createTopicUrl(category),
        };
    });

    // Add some additional related topics to reach 7 items if needed
    const additionalTopics = [
        {
            id: topics.length + 1,
            name: 'Government Policy',
            icon: '',
            url: 'government-policy',
        },
        {
            id: topics.length + 2,
            name: 'Economic Development',
            icon: '',
            url: 'economic-development',
        },
        {
            id: topics.length + 3,
            name: 'Innovation & Research',
            icon: '',
            url: 'innovation-research',
        },
    ];

    // Combine and limit to 7 topics
    const allTopics = [...topics, ...additionalTopics].slice(0, 7);

    return (
        <div className={styles['similar-topics-container']}>
            <h2 className={styles['section-title']}>Similar News Topics</h2>

            <div className={styles['topics-list']}>
                {allTopics.map((topic) => (
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
                                        e.target.src =
                                            'https://placehold.co/40x40';
                                    }}
                                />
                            </div>
                            <span className={styles['topic-name']}>
                                {topic.name}
                            </span>
                        </div>
                        <button className={styles['follow-button']}>
                            <Plus size={18} />
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SimilarTopics;
