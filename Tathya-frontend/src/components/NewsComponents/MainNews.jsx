import React, { useState, useEffect } from 'react';
import {
    ThumbsUp,
    MessageSquare,
    Share2,
    Flag,
    ThumbsDown,
} from 'lucide-react';
import NewsHeader from './NewsHeader';
import NewsTitle from './NewsTitle';
import NewsSourceButtons from './NewsSourceButtons';
import NewsFooter from './NewsFooter';
import NewsIframe from './NewsIframe';
import './mainNews.css';
import Loading from '../../components/Loading/Loading';

const MainNews = ({ newsGroup }) => {
    const [activeSource, setActiveSource] = useState('');
    const [currentArticle, setCurrentArticle] = useState(null);
    const [newsData, setNewsData] = useState(null);
    const [upvotes, setUpvotes] = useState(273);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [metrics, setMetrics] = useState({
        depthOfReporting: { upvote: 0, downvote: 0 },
        politicalBiasness: { upvote: 0, downvote: 0 },
        credibility: { upvote: 0, downvote: 0 },
        relevance: { upvote: 0, downvote: 0 },
    });
    const [userVotes, setUserVotes] = useState({
        depthOfReporting: null,
        politicalBiasness: null,
        credibility: null,
        relevance: null,
    });

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

    const extractLocation = (lead) => {
        const locationMatch = lead.match(/^([^,]+),/);
        return locationMatch ? locationMatch[1].trim() : 'Nepal';
    };

    useEffect(() => {
        if (newsGroup && newsGroup.news && newsGroup.news.length > 0) {
            // Use the first article as default
            const firstArticle = newsGroup.news[0];

            const processedData = {
                publishedDate: getTimeAgo(firstArticle.postedAt),
                location: extractLocation(firstArticle.lead),
                updatedTime: getTimeAgo(firstArticle.postedAt),
                title: firstArticle.title,
                description: firstArticle.description,
                lead: firstArticle.lead,
                category: firstArticle.category,
                imageUrl: firstArticle.imageUrl,
                newsPortal: firstArticle.newsPortal,
                url: firstArticle.url,
                sources: newsGroup.sources || [],
                summary: firstArticle.summary,
                groupId: newsGroup.groupId,
            };

            setNewsData(processedData);
            setActiveSource(firstArticle.newsPortal);
            setCurrentArticle(firstArticle);
            setMetrics(
                firstArticle.metrics || {
                    depthOfReporting: { upvote: 0, downvote: 0 },
                    politicalBiasness: { upvote: 0, downvote: 0 },
                    credibility: { upvote: 0, downvote: 0 },
                    relevance: { upvote: 0, downvote: 0 },
                }
            );
        }
    }, [newsGroup]);

    const handleSourceSelect = (source) => {
        setActiveSource(source);

        // Find the article from the selected source
        const sourceArticle = newsGroup.news.find(
            (article) => article.newsPortal === source
        );

        if (sourceArticle) {
            setCurrentArticle(sourceArticle);
            setMetrics(
                sourceArticle.metrics || {
                    depthOfReporting: { upvote: 0, downvote: 0 },
                    politicalBiasness: { upvote: 0, downvote: 0 },
                    credibility: { upvote: 0, downvote: 0 },
                    relevance: { upvote: 0, downvote: 0 },
                }
            );

            // Update the display data
            const updatedData = {
                ...newsData,
                title: sourceArticle.title,
                description: sourceArticle.description,
                imageUrl: sourceArticle.imageUrl,
                url: sourceArticle.url,
                summary: sourceArticle.summary,
            };
            setNewsData(updatedData);
        }
    };

    const getSourceUrl = (sourceName) => {
        const sourceArticle = newsGroup?.news?.find(
            (article) => article.newsPortal === sourceName
        );
        if (sourceArticle) {
            return sourceArticle.url;
        }

        // Fallback URLs
        const sourceUrls = {
            eKantipur: 'https://ekantipur.com',
            'Kathmandu Post': 'https://kathmandupost.com',
            'The Kathmandu Post': 'https://kathmandupost.com',
            'Online Khabar': 'https://onlinekhabar.com',
            'Nepal News': 'https://nepalnews.com',
            'DC Nepal': 'https://english.dcnepal.com',
            'The Himalayan Times': 'https://thehimalayantimes.com',
            'Primetime News': 'https://primetimenews.com.np',
        };

        return (
            sourceUrls[sourceName] ||
            currentArticle?.url ||
            'https://nepalnews.com'
        );
    };

    const handleUpvote = () => {
        if (hasUpvoted) {
            setUpvotes(upvotes - 1);
            setHasUpvoted(false);
        } else {
            setUpvotes(upvotes + 1);
            setHasUpvoted(true);
        }
    };

    const handleMetricVote = (metricType, voteType) => {
        const currentVote = userVotes[metricType];
        let newMetrics = { ...metrics };
        let newUserVotes = { ...userVotes };

        // If user had already voted
        if (currentVote) {
            // Remove the previous vote
            newMetrics[metricType][currentVote]--;
        }

        // If clicking the same vote type, remove the vote
        if (currentVote === voteType) {
            newUserVotes[metricType] = null;
        } else {
            // Add the new vote
            newMetrics[metricType][voteType]++;
            newUserVotes[metricType] = voteType;
        }

        setMetrics(newMetrics);
        setUserVotes(newUserVotes);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            setComments([
                ...comments,
                {
                    id: Date.now(),
                    text: commentText,
                    author: 'Anonymous User',
                    timestamp: new Date().toISOString(),
                },
            ]);
            setCommentText('');
        }
    };

    const handleFeedback = () => {
        if (!newsData || !currentArticle) return;

        const shareUrl = encodeURIComponent(
            currentArticle.url || window.location.href
        );
        const shareTitle = encodeURIComponent(currentArticle.title);

        const subject = encodeURIComponent(
            `Feedback on article: ${shareTitle}`
        );
        const body = encodeURIComponent(
            `Hello,\n\nI would like to give feedback on the article titled ${shareUrl}.\n\nMy feedback:\n`
        );

        const email = 'tathya@service.com';
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    const handleShare = (platform) => {
        if (!newsData || !currentArticle) return;

        const shareUrl = encodeURIComponent(
            currentArticle.url || window.location.href
        );
        const shareTitle = encodeURIComponent(currentArticle.title);
        const shareText = encodeURIComponent(newsData.summary || newsData.lead);

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
            email: `mailto:?subject=${shareTitle}&body=${shareText}%0A%0A${shareUrl}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    if (!newsData && newsGroup) {
        return (
            <div className="main">
                <div className="loading-container">
                    <Loading />
                </div>
            </div>
        );
    }

    if (!newsGroup || !newsGroup.news || newsGroup.news.length === 0) {
        return (
            <div className="main">
                <div className="loading-container">
                    <p>No news data provided</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main">
            {/* Main Content Layout - Story in Center, Bias Info on Right */}
            <div className="news-layout-container">
                {/* Main Content Area - Story */}
                <main className="news-main-content">
                    <div className="news-main-container">
                        <NewsHeader
                            publishedDate={newsData.publishedDate}
                            location={newsData.location}
                            updatedTime={newsData.updatedTime}
                            onShare={handleShare}
                        />

                        <NewsTitle
                            title={currentArticle?.title || newsData.title}
                        />

                        <NewsSourceButtons
                            sources={newsData.sources}
                            onSourceSelect={handleSourceSelect}
                            activeSource={activeSource}
                        />

                        {(currentArticle?.imageUrl || newsData.imageUrl) && (
                            <div className="article-image-container">
                                <img
                                    src={
                                        currentArticle?.imageUrl ||
                                        newsData.imageUrl
                                    }
                                    alt={
                                        currentArticle?.title || newsData.title
                                    }
                                    className="article-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div className="article-content">
                            <div className="article-lead">
                                <p>{newsData.lead}</p>
                            </div>

                            <div className="article-description">
                                <p>
                                    {currentArticle?.description ||
                                        newsData.description}
                                </p>
                            </div>

                            {(currentArticle?.summary || newsData.summary) && (
                                <div className="article-summary">
                                    <h3>Summary</h3>
                                    <p>
                                        {currentArticle?.summary ||
                                            newsData.summary}
                                    </p>
                                </div>
                            )}

                            {/* News Quality Metrics */}
                            <div className="article-metrics">
                                <h3>Rate this Article</h3>
                                <div className="metrics-grid">
                                    {Object.entries(metrics).map(
                                        ([metricType, votes]) => (
                                            <div
                                                key={metricType}
                                                className="metric-item">
                                                <h4 className="metric-title">
                                                    {metricType
                                                        .replace(
                                                            /([A-Z])/g,
                                                            ' $1'
                                                        )
                                                        .replace(/^./, (str) =>
                                                            str.toUpperCase()
                                                        )}
                                                </h4>
                                                <div className="metric-votes">
                                                    <button
                                                        className={`vote-btn upvote ${
                                                            userVotes[
                                                                metricType
                                                            ] === 'upvote'
                                                                ? 'active'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            handleMetricVote(
                                                                metricType,
                                                                'upvote'
                                                            )
                                                        }>
                                                        <ThumbsUp size={16} />
                                                        <span>
                                                            {votes.upvote}
                                                        </span>
                                                    </button>
                                                    <button
                                                        className={`vote-btn downvote ${
                                                            userVotes[
                                                                metricType
                                                            ] === 'downvote'
                                                                ? 'active'
                                                                : ''
                                                        }`}
                                                        onClick={() =>
                                                            handleMetricVote(
                                                                metricType,
                                                                'downvote'
                                                            )
                                                        }>
                                                        <ThumbsDown size={16} />
                                                        <span>
                                                            {votes.downvote}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        <NewsFooter onFeedback={handleFeedback} />
                    </div>
                </main>

                {/* Right Sidebar - Bias & Factuality */}
                <aside className="news-sidebar-right">
                    <div className="sidebar-panel">
                        <h3>Coverage Details</h3>

                        <div className="coverage-stats">
                            <div className="stat-item">
                                <span className="stat-label">
                                    Total News Sources
                                </span>
                                <span className="stat-value">
                                    {newsData.sources.length}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">
                                    Articles in Group
                                </span>
                                <span className="stat-value">
                                    {newsGroup.news.length}
                                </span>
                            </div>
                        </div>

                        {/* Available Sources */}
                        <div className="sources-panel">
                            <h4>Available Sources</h4>
                            <div className="sources-list">
                                {newsGroup.news.map((article, index) => (
                                    <div
                                        key={index}
                                        className={`source-item ${
                                            article.newsPortal === activeSource
                                                ? 'active'
                                                : ''
                                        }`}>
                                        <span className="source-name">
                                            {article.newsPortal}
                                        </span>
                                        <span className="source-category">
                                            {article.category}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bias-distribution">
                            <h4>Bias Distribution</h4>
                            <div className="bias-chart-placeholder">
                                <div className="bias-bar">
                                    <div
                                        className="bias-segment left"
                                        style={{ width: '30%' }}></div>
                                    <div
                                        className="bias-segment center"
                                        style={{ width: '40%' }}></div>
                                    <div
                                        className="bias-segment right"
                                        style={{ width: '30%' }}></div>
                                </div>
                                <div className="bias-labels">
                                    <span>Left</span>
                                    <span>Center</span>
                                    <span>Right</span>
                                </div>
                            </div>
                        </div>

                        <div className="factuality-panel">
                            <h4>Factuality</h4>
                            <div className="factuality-placeholder">
                                <p>
                                    Factuality information will be displayed
                                    here
                                </p>
                            </div>
                        </div>

                        <div className="ownership-panel">
                            <h4>Ownership</h4>
                            <div className="ownership-placeholder">
                                <p>Ownership details will be displayed here</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Section - Iframe and Engagement/Comments Side by Side */}
            <div className="bottom-section-container">
                {/* Source Iframe */}
                <div className="iframe-section">
                    <div className="iframe-header">
                        <h3>Read from Original Source: {activeSource}</h3>
                    </div>
                    <NewsIframe
                        src={getSourceUrl(activeSource)}
                        title={`${activeSource} - ${
                            currentArticle?.title || newsData.title
                        }`}
                    />
                </div>

                {/* Right Side - Engagement Panel and Comments */}
                <div className="engagement-comments-section">
                    {/* Engagement Panel */}
                    <div className="engagement-panel">
                        {/* Upvotes Section */}
                        <div className="upvote-section">
                            <button
                                className={`upvote-btn ${
                                    hasUpvoted ? 'upvoted' : ''
                                }`}
                                onClick={handleUpvote}>
                                <ThumbsUp size={24} />
                                <span className="upvote-count">{upvotes}</span>
                            </button>
                            <p className="upvote-label">Upvotes</p>
                        </div>

                        {/* Share Section */}
                        <div className="share-section">
                            <button
                                className="action-btn"
                                onClick={() => handleShare('twitter')}>
                                <Share2 size={20} />
                                <span>Share</span>
                            </button>
                        </div>

                        {/* Report Section */}
                        <div className="report-section">
                            <button
                                className="action-btn report-btn"
                                onClick={handleFeedback}>
                                <Flag size={20} />
                                <span>Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-panel">
                        <div className="comments-header">
                            <MessageSquare size={20} />
                            <h3>Comments ({comments.length})</h3>
                        </div>

                        <form
                            className="comment-form"
                            onSubmit={handleCommentSubmit}>
                            <textarea
                                placeholder="Add your comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                            />
                            <button
                                type="submit"
                                className="submit-comment-btn">
                                Post Comment
                            </button>
                        </form>

                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="comment-item">
                                        <div className="comment-author">
                                            {comment.author}
                                        </div>
                                        <div className="comment-text">
                                            {comment.text}
                                        </div>
                                        <div className="comment-time">
                                            {getTimeAgo(comment.timestamp)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainNews;
