import React, { useState, useEffect } from 'react';
import { Clock, Eye, ArrowRight, Calendar, Globe, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dummyData from '../../components/NewsComponents/dummydata.json';

const News = ({ selectedCategory, onCategoryChange }) => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [newsGroups, setNewsGroups] = useState([]);
    const navigate = useNavigate();

    // Load news groups from dummydata.json (single source of truth)
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
            return `${diffInHours} hours ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} days ago`;
        }
    };

    // Get category color based on the primary article's category
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

    // Calculate average credibility score for the news group
    const getAverageCredibility = (newsGroup) => {
        const total = newsGroup.news.reduce((sum, article) => {
            const upvotes = article.metrics.credibility.upvote;
            const downvotes = article.metrics.credibility.downvote;
            const score = (upvotes / (upvotes + downvotes)) * 100;
            return sum + score;
        }, 0);
        return Math.round(total / newsGroup.news.length);
    };

    const handleCardClick = (newsGroup) => {
        navigate(`/news/${newsGroup.groupId}`);
    };

    return (
        <div className="news-page">
            {/* News Results */}
            <div className="news-results-container">
                <div className="results-header">
                    <h3>
                        {selectedCategory === 'All'
                            ? `All News Coverage (${filteredNewsGroups.length} stories)`
                            : `${selectedCategory} News Coverage (${filteredNewsGroups.length} stories)`}
                    </h3>
                    <p>
                        Compare perspectives from multiple sources on the same
                        story
                    </p>
                </div>

                <div className="news-preview-grid">
                    {filteredNewsGroups.map((newsGroup, index) => {
                        const primaryArticle = getPrimaryArticle(newsGroup);
                        const credibilityScore =
                            getAverageCredibility(newsGroup);

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
                                                'https://placehold.co/600x400';
                                        }}
                                    />
                                    <div className="card-overlay">
                                        <span
                                            className="category-badge"
                                            style={{
                                                backgroundColor:
                                                    getCategoryColor(
                                                        primaryArticle.category
                                                    ),
                                            }}>
                                            {primaryArticle.category}
                                        </span>
                                        <div className="sources-count">
                                            <Users size={14} />
                                            <span>
                                                {newsGroup.sources.length}{' '}
                                                sources
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-content">
                                    <div className="card-meta">
                                        <div className="meta-item">
                                            <Calendar size={14} />
                                            <span>
                                                {getTimeAgo(
                                                    primaryArticle.postedAt
                                                )}
                                            </span>
                                        </div>
                                        <div className="meta-item credibility-score">
                                            <Globe size={14} />
                                            <span>
                                                {credibilityScore}% credible
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <Users size={14} />
                                            <span>
                                                {newsGroup.news.length} articles
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="card-title">
                                        {primaryArticle.title}
                                    </h3>
                                    <p className="card-lead">
                                        {primaryArticle.lead}
                                    </p>

                                    <div className="card-sources">
                                        <h4>Coverage by:</h4>
                                        <div className="sources-list">
                                            {newsGroup.sources
                                                .slice(0, 4)
                                                .map((source, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="source-tag">
                                                        {source}
                                                    </span>
                                                ))}
                                            {newsGroup.sources.length > 4 && (
                                                <span className="source-tag more">
                                                    +
                                                    {newsGroup.sources.length -
                                                        4}{' '}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="metrics">
                                            <span className="articles-count">
                                                Multiple perspectives
                                            </span>
                                            <div
                                                className="credibility-indicator"
                                                style={{
                                                    backgroundColor:
                                                        credibilityScore > 70
                                                            ? '#27ae60'
                                                            : credibilityScore >
                                                              50
                                                            ? '#f39c12'
                                                            : '#e74c3c',
                                                }}>
                                                {credibilityScore}%
                                            </div>
                                        </div>

                                        <div className="read-more">
                                            <Eye size={16} />
                                            <span>Compare Sources</span>
                                            <ArrowRight
                                                size={16}
                                                className={`arrow ${
                                                    hoveredCard === index
                                                        ? 'animated'
                                                        : ''
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredNewsGroups.length === 0 && (
                    <div className="no-articles">
                        <h3>No news coverage found</h3>
                        <p>
                            No news coverage found for the "{selectedCategory}"
                            category.
                        </p>
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
        </div>
    );
};

export default News;
