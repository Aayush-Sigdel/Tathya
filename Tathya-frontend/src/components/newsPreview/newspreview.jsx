import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './newspreview.css';
import dummyData from '../NewsComponents/dummydata.json';

const NewsPreview = ({
    onArticleSelect,
    selectedCategory = 'All',
    onCategoryChange,
}) => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [newsGroups, setNewsGroups] = useState([]);
    const navigate = useNavigate();

    // Load news groups from dummydata.json
    useEffect(() => {
        try {
            const groups = Array.isArray(dummyData?.newsGroups)
                ? dummyData.newsGroups
                : [];
            setNewsGroups(groups);
        } catch (e) {
            console.error('Failed to load dummy data', e);
            setNewsGroups([]);
        }
    }, []);

    // Filter news groups based on selected category
    const filteredNewsGroups =
        selectedCategory === 'All'
            ? newsGroups
            : newsGroups.filter((group) =>
                  group.news.some(
                      (article) => article.category === selectedCategory
                  )
              );

    // Calculate time ago from posted date
    const getTimeAgo = (dateString) => {
        const posted = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    // Get category color
    const getCategoryColor = (category) => {
        const colors = {
            Politics: '#e74c3c',
            Business: '#3498db',
            Technology: '#9b59b6',
            Environment: '#27ae60',
            National: '#f39c12',
            Economy: '#34495e',
        };
        return colors[category] || '#95a5a6';
    };

    // Get the primary article (first one) from the news group
    const getPrimaryArticle = (newsGroup) => {
        return newsGroup.news[0];
    };

    const handleCardClick = (newsGroup) => {
        if (onArticleSelect) {
            onArticleSelect(newsGroup);
        } else {
            navigate(`/news/${newsGroup.groupId}`);
        }
    };

    return (
        <div className="news-preview-container">
            <div className="news-preview-grid">
                {filteredNewsGroups.map((newsGroup, index) => {
                    const primaryArticle = getPrimaryArticle(newsGroup);

                    return (
                        <div
                            key={newsGroup.groupId}
                            className="news-preview-card"
                            onClick={() => handleCardClick(newsGroup)}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}>
                            <div className="card-image">
                                <img
                                    src={primaryArticle.imageUrl}
                                    alt={primaryArticle.title}
                                    onError={(e) => {
                                        e.target.src =
                                            'https://placehold.co/600x300';
                                    }}
                                />
                                {/* <div className="card-overlay">
                                    <span
                                        className="category-badge"
                                        style={{
                                            backgroundColor: getCategoryColor(
                                                primaryArticle.category
                                            ),
                                        }}>
                                        {primaryArticle.category}
                                    </span>
                                    <span className="sources-count">
                                        <Users size={12} />
                                        {newsGroup.sources.length} sources
                                    </span>
                                </div> */}
                            </div>

                            <div className="card-content">
                                <div className="card-meta">
                                    <span className="time-ago">
                                        <Calendar size={14} />
                                        {getTimeAgo(primaryArticle.postedAt)}
                                    </span>
                                </div>

                                <h3 className="card-title">
                                    {primaryArticle.title}
                                </h3>

                                {/* <div className="card-footer">
                                    <span className="read-more">
                                        Compare Sources
                                        <ArrowRight
                                            size={16}
                                            className={`arrow ${
                                                hoveredCard === index
                                                    ? 'animated'
                                                    : ''
                                            }`}
                                        />
                                    </span>
                                </div> */}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredNewsGroups.length === 0 && (
                <div className="no-articles">
                    <h3>No news found</h3>
                    <p>No articles found for "{selectedCategory}" category.</p>
                    <button
                        className="reset-filter-btn"
                        onClick={() =>
                            onCategoryChange && onCategoryChange('All')
                        }>
                        View All News
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewsPreview;
