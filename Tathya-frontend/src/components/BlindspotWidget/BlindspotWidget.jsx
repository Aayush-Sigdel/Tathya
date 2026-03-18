import React, { useState, useCallback, useMemo } from 'react';
import {
    Eye,
    Clock,
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    ChevronRight,
    Bookmark,
    Share2,
    TrendingUp,
    MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBlindspotNews } from '../../services/fetchNewsData';
import './BlindspotWidget.css';

// Utility functions
const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';

    try {
        const posted = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - posted) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks}w ago`;
    } catch (error) {
        return 'Unknown time';
    }
};

const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    const cleanText = text.replace(/\s+/g, ' ').trim();
    return cleanText.length > maxLength
        ? `${cleanText.substring(0, maxLength)}...`
        : cleanText;
};

const getCategoryColor = (category) => {
    const colors = {
        Economy: '#3b82f6',
        Politics: '#ef4444',
        Technology: '#8b5cf6',
        Business: '#10b981',
        Environment: '#22c55e',
        National: '#f59e0b',
        Sports: '#e67e22',
        Health: '#2ecc71',
        Education: '#8e44ad',
        International: '#16a085',
    };
    return colors[category] || '#6b7280';
};

const getReadingTime = (content) => {
    if (!content) return '2 min';
    const words = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min`;
};

// Sub-components
const BlindspotCard = ({ story, onClick }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleImageError = useCallback((e) => {
        e.target.src = 'https://placehold.co/300x200/f8f9fa/9ca3af?text=News';
        setImageLoaded(true);
    }, []);

    return (
        <article
            className="blindspot-card"
            onClick={onClick}>
            <div className="card-image">
                <img
                    src={
                        story.imageUrl ||
                        'https://placehold.co/300x200/f8f9fa/9ca3af?text=News'
                    }
                    alt={story.title || 'Blindspot article'}
                    loading="lazy"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className={imageLoaded ? 'loaded' : 'loading'}
                />
            </div>

            <div className="card-content">
                <h3 className="card-title-header">
                    {story.title || 'Untitled Article'}
                </h3>
                <p className="card-excerpt">
                    {truncateText(
                        story.lead || story.description || story.summary,
                        140
                    )}
                </p>

                <div className="card-footer">
                    <div className="footer-left"></div>

                    <div className="footer-right">
                        <ChevronRight
                            size={16}
                            className="read-more-icon"
                        />
                    </div>
                </div>
            </div>
        </article>
    );
};

const LoadingCard = () => (
    <div className="loading-card">
        <div className="loading-image"></div>
        <div className="loading-content">
            <div className="loading-title"></div>
            <div className="loading-meta"></div>
            <div className="loading-text"></div>
            <div className="loading-text short"></div>
        </div>
    </div>
);

const EmptyState = ({ onRetry }) => (
    <div className="empty-state">
        <Eye
            size={48}
            className="empty-icon"
        />
        <h3>No Blindspots Available</h3>
        <p>We couldn't find any underreported stories at the moment.</p>
        <button
            onClick={onRetry}
            className="retry-button">
            <RefreshCw size={16} />
            Try Again
        </button>
    </div>
);

const ErrorState = ({ error, onRetry }) => (
    <div className="error-state">
        <AlertTriangle
            size={48}
            className="error-icon"
        />
        <h3>Failed to Load Blindspots</h3>
        <p>
            Something went wrong while fetching the latest underreported
            stories.
        </p>
        {error && (
            <details className="error-details">
                <summary>Error Details</summary>
                <code>{error}</code>
            </details>
        )}
        <button
            onClick={onRetry}
            className="retry-button">
            <RefreshCw size={16} />
            Retry
        </button>
    </div>
);

// Main component
const BlindspotWidget = ({
    limit = 6,
    showHeader = true,
    title = 'Media Blindspots',
    subtitle = 'Underreported stories that matter',
}) => {
    const navigate = useNavigate();
    const {
        data: blindspots,
        loading,
        error,
        refetch,
    } = useBlindspotNews(limit);

    // Memoized handlers
    const handleBlindspotClick = useCallback(
        (blindspot) => {
            navigate(`/blindspot-article/${blindspot.id}`);
        },
        [navigate]
    );

    const handleViewAll = useCallback(() => {
        navigate('/blindspot');
    }, [navigate]);

    // Memoized blindspot cards
    const blindspotCards = useMemo(() => {
        if (!blindspots) return [];

        return blindspots.slice(0, limit).map((story) => (
            <BlindspotCard
                key={story.id || story.groupId || Math.random()}
                story={story}
                onClick={() => handleBlindspotClick(story)}
            />
        ));
    }, [blindspots, limit, handleBlindspotClick]);

    // Loading state
    if (loading) {
        return (
            <div className="blindspot-widget">
                {showHeader && (
                    <div className="widget-header">
                        <div className="header-content">
                            <div className="header-text">
                                <h2 className="widget-title">
                                    <Eye size={20} />
                                    {title}
                                </h2>
                                <p className="widget-subtitle">{subtitle}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="widget-grid">
                    {Array.from({ length: limit }, (_, i) => (
                        <LoadingCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="blindspot-widget">
                {showHeader && (
                    <div className="widget-header">
                        <div className="header-content">
                            <div className="header-text">
                                <h2 className="widget-title">
                                    <Eye size={20} />
                                    {title}
                                </h2>
                                <p className="widget-subtitle">{subtitle}</p>
                            </div>
                        </div>
                    </div>
                )}

                <ErrorState
                    error={error}
                    onRetry={refetch}
                />
            </div>
        );
    }

    // Empty state
    if (!blindspots || blindspots.length === 0) {
        return (
            <div className="blindspot-widget">
                {showHeader && (
                    <div className="widget-header">
                        <div className="header-content">
                            <div className="header-text">
                                <h2 className="widget-title">
                                    <Eye size={20} />
                                    {title}
                                </h2>
                                <p className="widget-subtitle">{subtitle}</p>
                            </div>
                        </div>
                    </div>
                )}

                <EmptyState onRetry={refetch} />
            </div>
        );
    }

    return (
        <div className="blindspot-widget">
            {showHeader && (
                <div className="widget-header">
                    <div className="header-content">
                        <div className="header-text">
                            <h2 className="widget-title">
                                <Eye size={20} />
                                {title}
                            </h2>
                            <p className="widget-subtitle">{subtitle}</p>
                        </div>

                        <div className="header-actions">
                            <span className="blindspot-count">
                                {blindspots.length}{' '}
                                {blindspots.length === 1 ? 'story' : 'stories'}
                            </span>

                            <button
                                onClick={handleViewAll}
                                className="view-all-button">
                                View All
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="widget-grid">{blindspotCards}</div>
        </div>
    );
};

export default BlindspotWidget;
