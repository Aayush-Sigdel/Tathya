import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Eye,
    Clock,
    Globe,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Calendar,
    ExternalLink,
} from 'lucide-react';
import './blindspot.css';
import { useBlindspotNews } from '../../services/fetchNewsData';

const Blindspot = () => {
    const location = useLocation();
    const { data: blindspots, loading, error, refetch } = useBlindspotNews(100);
    const articleRefs = useRef({});

    // Handle navigation from widget
    useEffect(() => {
        if (
            location.state?.highlightedStory &&
            location.state?.scrollToStory &&
            blindspots.length > 0
        ) {
            const targetId = location.state.highlightedStory;
            const targetElement = articleRefs.current[targetId];

            if (targetElement) {
                // Add highlight effect
                targetElement.classList.add('highlighted');

                // Scroll to the article
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }, 100);

                // Remove highlight after animation
                setTimeout(() => {
                    targetElement.classList.remove('highlighted');
                }, 3000);
            }
        }
    }, [blindspots, location.state]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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

    const getCategoryColor = (category) => {
        const colors = {
            Economy: '#3b82f6',
            Politics: '#ef4444',
            Technology: '#8b5cf6',
            Business: '#10b981',
            Environment: '#22c55e',
            National: '#f59e0b',
        };
        return colors[category] || '#6b7280';
    };

    const getTotalEngagement = (metrics) => {
        if (!metrics) return 0;

        return Object.values(metrics).reduce((total, metric) => {
            return total + (metric.upvote || 0) + (metric.downvote || 0);
        }, 0);
    };

    // Loading state
    if (loading) {
        return (
            <div className="bind-blindspot-page">
                <div className="bind-container">
                    <div className="bind-page-header">
                        <div className="bind-header-content">
                            <h1>Media Blindspots</h1>
                            <p>Uncovering underreported stories that matter</p>
                        </div>
                    </div>
                    <div className="bind-loading-container">
                        <div className="bind-loading-spinner"></div>
                        <p>Finding blindspots...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bind-blindspot-page">
                <div className="bind-container">
                    <div className="bind-error-container">
                        <AlertCircle size={48} />
                        <h3>Unable to Load Blindspots</h3>
                        <p>Failed to fetch blindspot data: {error}</p>
                        <button
                            onClick={refetch}
                            className="bind-retry-btn">
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bind-blindspot-page">
            <div className="bind-container">
                {/* Page Header */}
                <div className="bind-page-header">
                    <div className="bind-header-content">
                        <h1>Media Blindspots</h1>
                        <p>
                            Stories that deserve more attention but are
                            underreported in mainstream media
                        </p>
                        {location.state?.highlightedStory && (
                            <small className="bind-highlight-notice">
                                <Eye size={14} />
                                Showing highlighted article from widget
                            </small>
                        )}
                    </div>
                    <div className="bind-header-actions">
                        <button
                            onClick={refetch}
                            className="bind-refresh-btn"
                            disabled={loading}>
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Blindspots Content */}
                {blindspots.length === 0 ? (
                    <div className="bind-empty-state">
                        <Eye size={64} />
                        <h3>No Blindspots Found</h3>
                        <p>
                            No underreported stories found at the moment. Check
                            back later for new blindspots.
                        </p>
                    </div>
                ) : (
                    <div className="bind-blindspots-grid">
                        {blindspots.map((story) => (
                            <article
                                key={story.id}
                                ref={(el) =>
                                    (articleRefs.current[story.id] = el)
                                }
                                className="bind-blindspot-card">
                                <div className="bind-card-header">
                                    <div
                                        className="bind-category-badge"
                                        style={{
                                            backgroundColor: getCategoryColor(
                                                story.category
                                            ),
                                        }}>
                                        {story.category}
                                    </div>
                                    <div className="bind-source-info">
                                        <Globe size={14} />
                                        <span>{story.newsPortal}</span>
                                    </div>
                                </div>

                                <div className="bind-card-image">
                                    <img
                                        src={story.imageUrl}
                                        alt={story.title}
                                        onError={(e) => {
                                            e.target.src =
                                                'https://placehold.co/600x300/f0f0f0/666666?text=News';
                                        }}
                                    />
                                    <div className="bind-blindspot-badge">
                                        <Eye size={16} />
                                        <span>Blindspot</span>
                                    </div>
                                </div>

                                <div className="bind-card-content">
                                    <h2 className="bind-story-title">
                                        {story.title}
                                    </h2>

                                    <p className="bind-story-lead">
                                        {story.lead}
                                    </p>

                                    <div className="bind-story-meta">
                                        <div className="bind-meta-item">
                                            <Calendar size={14} />
                                            <span>
                                                {formatDate(story.postedAt)}
                                            </span>
                                        </div>
                                        <div className="bind-meta-item">
                                            <Clock size={14} />
                                            <span>
                                                {getTimeAgo(story.postedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bind-story-description">
                                        <p>{story.description}</p>
                                    </div>

                                    <div className="bind-story-summary">
                                        <h4>Summary</h4>
                                        <p>{story.summary}</p>
                                    </div>

                                    <div className="bind-engagement-metrics">
                                        <div className="bind-metrics-header">
                                            <h4>Story Metrics</h4>
                                            <span className="bind-total-engagement">
                                                {getTotalEngagement(
                                                    story.metrics
                                                )}{' '}
                                                interactions
                                            </span>
                                        </div>

                                        <div className="bind-metrics-grid">
                                            <div className="bind-metric-item">
                                                <span className="bind-metric-label">
                                                    Credibility
                                                </span>
                                                <div className="bind-metric-votes">
                                                    <span className="bind-upvotes">
                                                        ↑
                                                        {
                                                            story.metrics
                                                                .credibility
                                                                .upvote
                                                        }
                                                    </span>
                                                    <span className="bind-downvotes">
                                                        ↓
                                                        {
                                                            story.metrics
                                                                .credibility
                                                                .downvote
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bind-metric-item">
                                                <span className="bind-metric-label">
                                                    Relevance
                                                </span>
                                                <div className="bind-metric-votes">
                                                    <span className="bind-upvotes">
                                                        ↑
                                                        {
                                                            story.metrics
                                                                .relevance
                                                                .upvote
                                                        }
                                                    </span>
                                                    <span className="bind-downvotes">
                                                        ↓
                                                        {
                                                            story.metrics
                                                                .relevance
                                                                .downvote
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bind-metric-item">
                                                <span className="bind-metric-label">
                                                    Depth
                                                </span>
                                                <div className="bind-metric-votes">
                                                    <span className="bind-upvotes">
                                                        ↑
                                                        {
                                                            story.metrics
                                                                .depthOfReporting
                                                                .upvote
                                                        }
                                                    </span>
                                                    <span className="bind-downvotes">
                                                        ↓
                                                        {
                                                            story.metrics
                                                                .depthOfReporting
                                                                .downvote
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bind-metric-item">
                                                <span className="bind-metric-label">
                                                    Bias
                                                </span>
                                                <div className="bind-metric-votes">
                                                    <span className="bind-upvotes">
                                                        ↑
                                                        {
                                                            story.metrics
                                                                .politicalBiasness
                                                                .upvote
                                                        }
                                                    </span>
                                                    <span className="bind-downvotes">
                                                        ↓
                                                        {
                                                            story.metrics
                                                                .politicalBiasness
                                                                .downvote
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bind-card-actions">
                                        <a
                                            href={story.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bind-read-original-btn">
                                            <ExternalLink size={16} />
                                            Read Original Article
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blindspot;
