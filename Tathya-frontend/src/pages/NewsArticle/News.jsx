import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock, Eye, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NewsArticle.css';
import {
    useNewsByCategory,
    useRelevantNews,
} from '../../services/fetchNewsData';

const News = ({ selectedCategory = 'All', onCategoryChange }) => {
    const navigate = useNavigate();

    // Use different hooks based on category selection
    const {
        data: categoryNews,
        loading: categoryLoading,
        error: categoryError,
    } = useNewsByCategory(
        selectedCategory !== 'All' ? selectedCategory : null,
        40
    );

    const {
        data: allNews,
        loading: allLoading,
        error: allError,
    } = useRelevantNews(40);

    // Determine which data to use
    const newsGroups = selectedCategory === 'All' ? allNews : categoryNews;
    const loading = selectedCategory === 'All' ? allLoading : categoryLoading;
    const error = selectedCategory === 'All' ? allError : categoryError;

    // Rest of your existing utility functions...
    const getTimeAgo = (dateString) => {
        const posted = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
        return diffInHours < 24
            ? `${diffInHours}h ago`
            : `${Math.floor(diffInHours / 24)}d ago`;
    };

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

    const getPrimaryArticle = (newsGroup) => newsGroup.news?.[0] || {};

    const getEngagementScore = (newsGroup) => {
        const totalEngagement =
            newsGroup.news?.reduce((sum, article) => {
                const credibility =
                    article.metrics?.credibility?.upvote +
                        article.metrics?.credibility?.downvote || 0;
                const relevance =
                    article.metrics?.relevance?.upvote +
                        article.metrics?.relevance?.downvote || 0;
                return sum + credibility + relevance;
            }, 0) || 0;
        return Math.min(100, Math.round(totalEngagement / 10));
    };

    const handleCardClick = (newsGroup) => {
        navigate(`/news/${newsGroup.groupId}`);
    };

    // Loading state
    if (loading) {
        return (
            <div className="news-page-bento">
                <div className="bento-grid">
                    <div className="loading-section">
                        <Loader2
                            className="loading-spinner"
                            size={32}
                        />
                        <p>Loading news...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="news-page-bento">
                <div className="bento-grid">
                    <div className="end-message">
                        <div className="end-content">
                            <h3>Failed to Load News</h3>
                            <p>Error: {error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="news-page-bento">
            <div className="bento-grid">
                {newsGroups.map((newsGroup, index) => {
                    const primaryArticle = getPrimaryArticle(newsGroup);
                    const engagementScore = getEngagementScore(newsGroup);

                    return (
                        <div
                            key={`${newsGroup.groupId}-${index}`}
                            className="bento-card"
                            onClick={() => handleCardClick(newsGroup)}
                            style={{ '--delay': `${(index % 6) * 0.1}s` }}>
                            <div className="card-background">
                                <img
                                    src={primaryArticle.imageUrl}
                                    alt={primaryArticle.title}
                                    className="background-image"
                                    onError={(e) => {
                                        e.target.src =
                                            'https://placehold.co/600x400/f0f0f0/999999?text=News';
                                    }}
                                />
                                <div className="card-overlay-gradient"></div>
                            </div>

                            <div className="card-header">
                                <span
                                    className="category-pill"
                                    style={{
                                        backgroundColor: getCategoryColor(
                                            primaryArticle.category
                                        ),
                                    }}>
                                    {primaryArticle.category}
                                </span>
                                <div className="source-count">
                                    <Users size={14} />
                                    <span>
                                        {newsGroup.sources?.length ||
                                            newsGroup.news?.length ||
                                            1}
                                    </span>
                                </div>
                            </div>

                            <div className="card-content">
                                <h3 className="card-title">
                                    {primaryArticle.title}
                                </h3>

                                <div className="card-meta">
                                    <div className="meta-left">
                                        <span className="time-badge">
                                            <Clock size={12} />
                                            {getTimeAgo(
                                                primaryArticle.postedAt
                                            )}
                                        </span>
                                    </div>
                                    <div className="meta-right">
                                        <div className="engagement-badge">
                                            <Eye size={12} />
                                            <span>{engagementScore}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="source-list">
                                    {newsGroup.sources
                                        ?.slice(0, 3)
                                        .map((source, idx) => (
                                            <span
                                                key={idx}
                                                className="source-dot"
                                                title={source}></span>
                                        ))}
                                    {newsGroup.sources?.length > 3 && (
                                        <span className="source-more">
                                            +{newsGroup.sources.length - 3}
                                        </span>
                                    )}
                                </div>
                                <span className="read-indicator">
                                    Read More
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {newsGroups.length === 0 && (
                <div className="empty-state">
                    <div className="empty-content">
                        <BookOpen size={64} />
                        <h3>No news found</h3>
                        <p>
                            No articles found for "{selectedCategory}" category.
                        </p>
                        <button
                            className="reset-filter-btn"
                            onClick={() =>
                                onCategoryChange && onCategoryChange('All')
                            }>
                            View All News
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;
