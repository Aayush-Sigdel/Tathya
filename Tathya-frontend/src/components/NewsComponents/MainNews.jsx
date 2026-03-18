import React, { useState, useEffect } from 'react';
import {
    ThumbsUp,
    MessageSquare,
    Share2,
    Flag,
    ThumbsDown,
    Lock,
    Trash2,
    RotateCcw,
    Send,
    AlertTriangle,
    LinkIcon,
} from 'lucide-react';
import NewsHeader from './NewsHeader';
import NewsTitle from './NewsTitle';
import NewsSourceButtons from './NewsSourceButtons';
import NewsFooter from './NewsFooter';
import NewsIframe from './NewsIframe';
import BiasChart from './BiasChart'; // Import the new BiasChart component
// Import modularized CSS files in the correct order
import './NewsLayout.css'; // Main layout first
import './NewsSidebar.css'; // Sidebar components
import './NewsHeader.css'; // Header
import './NewsTitle.css'; // Title
import './NewsSourceButtons.css'; // Source buttons
import './NewsIframe.css'; // Iframe
import './NewsMetrics.css'; // Metrics
import './NewsComments.css'; // Comments and engagement
import './NewsFooter.css'; // Footer
import Loading from '../../components/Loading/Loading';
import { VoteService, VoteUtils } from '../../services/voteService';
import { KYCService, KYCUtils } from '../../services/kycService';
import { CommentService, CommentUtils } from '../../services/commentService';

// Custom Typewriter Component
const TypewriterText = ({ text, speed = 20 }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            // Animation complete, remove cursor after a delay
            const timeout = setTimeout(() => {
                setIsComplete(true);
            }, 500);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    // Reset animation when text changes
    useEffect(() => {
        setDisplayText('');
        setCurrentIndex(0);
        setIsComplete(false);
    }, [text]);

    return (
        <p className={`typewriter-text ${isComplete ? 'completed' : ''}`}>
            {displayText}
        </p>
    );
};

const MainNews = ({ newsGroup }) => {
    const [activeSource, setActiveSource] = useState('');
    const [currentArticle, setCurrentArticle] = useState(null);
    const [newsData, setNewsData] = useState(null);
    const [upvotes, setUpvotes] = useState(273);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [summaryKey, setSummaryKey] = useState(0); // Key to trigger re-animation
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
    const [isLoadingVotes, setIsLoadingVotes] = useState(false);
    const [userId] = useState(VoteUtils.getUserId());
    const [isKycVerified, setIsKycVerified] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingKyc, setIsCheckingKyc] = useState(true);

    // Comment-related state
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentSortBy, setCommentSortBy] = useState('NEWEST');
    const [commentError, setCommentError] = useState(null);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

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

    // Check user KYC status using the enhanced comment service
    const checkKycStatus = async () => {
        try {
            setIsCheckingKyc(true);
            const loggedIn = CommentUtils.isLoggedIn();
            setIsLoggedIn(loggedIn);

            if (loggedIn) {
                // Use the comment service KYC check for consistency
                const verified = await CommentService.checkKycVerification();
                setIsKycVerified(verified);
            } else {
                setIsKycVerified(false);
            }
        } catch (error) {
            console.error('Failed to check KYC status:', error);
            setIsKycVerified(false);
        } finally {
            setIsCheckingKyc(false);
        }
    };

    // Load comments for the current article
    const loadComments = async (newsId) => {
        if (!newsId) {
            console.log('No newsId provided for loading comments');
            return;
        }

        try {
            setIsLoadingComments(true);
            setCommentError(null);

            console.log(`Loading comments for article: ${newsId}`);
            const fetchedComments = await CommentService.getCommentsByNewsId(
                newsId,
                commentSortBy
            );

            // Sort comments using utility function
            const sortedComments = CommentUtils.sortComments(
                fetchedComments,
                commentSortBy
            );
            setComments(sortedComments);
            console.log(`Loaded ${sortedComments.length} comments`);
        } catch (error) {
            console.error('Failed to load comments:', error);
            setCommentError('Failed to load comments. Please try again.');
            setComments([]); // Clear comments on error
        } finally {
            setIsLoadingComments(false);
        }
    };

    // Load user votes for the current article
    const loadUserVotes = async (newsId) => {
        if (!newsId || !isLoggedIn) return;

        try {
            setIsLoadingVotes(true);
            const votes = await VoteService.getUserVotesForArticle(
                userId,
                newsId
            );
            setUserVotes(votes);
        } catch (error) {
            console.error('Failed to load user votes:', error);
            // Keep default state if API fails
        } finally {
            setIsLoadingVotes(false);
        }
    };

    // Check KYC status on component mount
    useEffect(() => {
        checkKycStatus();
    }, []);

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
            setSummaryKey((prev) => prev + 1); // Trigger summary re-animation
            setMetrics(
                firstArticle.metrics || {
                    depthOfReporting: { upvote: 0, downvote: 0 },
                    politicalBiasness: { upvote: 0, downvote: 0 },
                    credibility: { upvote: 0, downvote: 0 },
                    relevance: { upvote: 0, downvote: 0 },
                }
            );

            // Load user votes and comments for this article
            if (firstArticle.id) {
                if (isLoggedIn) {
                    loadUserVotes(firstArticle.id);
                }
                loadComments(firstArticle.id);
            }
        }
    }, [newsGroup, userId, isLoggedIn]);

    // Reload comments when sort order changes
    useEffect(() => {
        if (currentArticle?.id) {
            loadComments(currentArticle.id);
        }
    }, [commentSortBy]);

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
            setSummaryKey((prev) => prev + 1); // Trigger summary re-animation when source changes

            // Load user votes and comments for the new article
            if (sourceArticle.id) {
                if (isLoggedIn) {
                    loadUserVotes(sourceArticle.id);
                }
                loadComments(sourceArticle.id);
            }
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

    const handleMetricVote = async (metricType, voteType) => {
        // Check if user can perform voting action
        const canVote = await KYCUtils.canPerformAction('vote on articles');
        if (!canVote) {
            return;
        }

        if (!currentArticle?.id) {
            console.error('No article ID available for voting');
            return;
        }

        const currentVote = userVotes[metricType];
        const voteValue = VoteUtils.voteTypeToValue(voteType);

        // If user clicks the same vote type they already have, do nothing (no removal allowed)
        if (currentVote === voteValue) {
            return;
        }

        // Store previous state for rollback
        const previousMetrics = { ...metrics };
        const previousUserVotes = { ...userVotes };

        // Optimistic update
        let newMetrics = { ...metrics };
        let newUserVotes = { ...userVotes };

        // If user had already voted for the opposite type, remove that vote first
        if (currentVote) {
            const currentVoteType = VoteUtils.valueToVoteType(currentVote);
            newMetrics[metricType][currentVoteType]--;
        }

        // Add the new vote
        newMetrics[metricType][voteType]++;
        newUserVotes[metricType] = voteValue;

        // Update state optimistically
        setMetrics(newMetrics);
        setUserVotes(newUserVotes);

        try {
            // Make API call
            const response = await VoteService.submitVote(
                userId,
                currentArticle.id,
                metricType,
                voteValue
            );

            // Log the response for debugging
            console.log('Vote response:', response);
        } catch (error) {
            console.error('Failed to submit vote:', error);

            // Revert optimistic update on error
            setMetrics(previousMetrics);
            setUserVotes(previousUserVotes);

            // Show user-friendly error message
            alert('Failed to submit vote. Please try again.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        try {
            // Clear any previous errors
            setCommentError(null);

            // Check if user can perform commenting action with live KYC verification
            console.log('Checking if user can comment...');
            const canComment = await CommentUtils.canPerformAction('comment');
            if (!canComment) {
                return;
            }

            if (!currentArticle?.id) {
                setCommentError('No article selected for commenting');
                return;
            }

            // Validate comment content
            const validation = CommentUtils.validateComment(commentText);
            if (!validation.isValid) {
                setCommentError(validation.error);
                return;
            }

            setIsSubmittingComment(true);

            // Submit comment to backend
            console.log('Submitting comment to backend...');
            const newComment = await CommentService.postComment(
                CommentUtils.getUserId(),
                currentArticle.id,
                commentText.trim()
            );

            console.log('Comment submitted successfully:', newComment);

            // Add the new comment to local state (optimistic update)
            const commentWithDisplayData = {
                ...newComment,
                user: {
                    userName: localStorage.getItem('userName') || 'You',
                    email: localStorage.getItem('userEmail'),
                },
                createdAt: new Date().toISOString(),
                userId: CommentUtils.getUserId(),
            };

            // Add to the beginning for newest first sorting
            setComments((prev) => [commentWithDisplayData, ...prev]);

            // Clear the comment input
            setCommentText('');
        } catch (error) {
            console.error('Failed to submit comment:', error);
            setCommentError(`Failed to post comment: ${error.message}`);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!commentId) return;

        // Confirm deletion
        const confirmed = window.confirm(
            'Are you sure you want to delete this comment?'
        );
        if (!confirmed) return;

        try {
            setDeletingCommentId(commentId);

            // Delete comment via API
            await CommentService.deleteComment(commentId);

            // Remove comment from local state
            setComments((prev) =>
                prev.filter((comment) => comment.id !== commentId)
            );
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment. Please try again.');
        } finally {
            setDeletingCommentId(null);
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
                                <NewsSourceButtons
                                    sources={newsData.sources}
                                    onSourceSelect={handleSourceSelect}
                                    activeSource={activeSource}
                                />
                            </div>
                        )}

                        {/* NEW: Political Bias Analysis Panel */}
                        <div className="bias-panel">
                            <BiasChart
                                newsData={newsGroup}
                                activeSource={activeSource}
                            />
                        </div>
                        <div className="article-content">
                            <div className="article-lead">
                                <p>{newsData.lead}</p>
                            </div>

                            {/* <div className="article-description">
                                <p>
                                    {currentArticle?.description ||
                                        newsData.description}
                                </p>
                            </div> */}

                            {(currentArticle?.summary || newsData.summary) && (
                                <div
                                    className="typewriter-container"
                                    key={summaryKey}>
                                    <h3>Summary</h3>
                                    <TypewriterText
                                        text={
                                            currentArticle?.summary ||
                                            newsData.summary
                                        }
                                        speed={10}
                                    />
                                    <NewsFooter onFeedback={handleFeedback} />
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Enhanced with Metrics */}
                <aside className="news-sidebar-right">
                    {/* Article Quality Rating Panel */}
                    <div className="sidebar-panel metrics-panel">
                        {/* KYC Status Indicator */}
                        {!isLoggedIn ? (
                            <div className="kyc-status-indicator login-required">
                                <Lock size={16} />
                                <span>Login required to vote</span>
                            </div>
                        ) : !isKycVerified ? (
                            <div className="kyc-status-indicator kyc-required">
                                <Lock size={16} />
                                <span>KYC verification required to vote</span>
                            </div>
                        ) : null}

                        {isCheckingKyc && (
                            <div className="loading-votes">
                                <p>Checking verification status...</p>
                            </div>
                        )}

                        <div className="sidebar-metrics-grid">
                            {Object.entries(metrics).map(
                                ([metricType, votes]) => (
                                    <div
                                        key={metricType}
                                        className="sidebar-metric-item">
                                        <div className="metric-header">
                                            <h4 className="sidebar-metric-title">
                                                {metricType
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .replace(/^./, (str) =>
                                                        str.toUpperCase()
                                                    )}
                                            </h4>
                                            <div className="metric-score">
                                                <span className="score-number">
                                                    {votes.upvote -
                                                        votes.downvote >
                                                    0
                                                        ? `+${
                                                              votes.upvote -
                                                              votes.downvote
                                                          }`
                                                        : votes.upvote -
                                                          votes.downvote}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="sidebar-metric-votes">
                                            <button
                                                className={`sidebar-vote-btn upvote ${
                                                    userVotes[metricType] === 1
                                                        ? 'active'
                                                        : ''
                                                } ${
                                                    !isLoggedIn ||
                                                    !isKycVerified
                                                        ? 'disabled'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    handleMetricVote(
                                                        metricType,
                                                        'upvote'
                                                    )
                                                }
                                                disabled={
                                                    isLoadingVotes ||
                                                    isCheckingKyc ||
                                                    !isLoggedIn ||
                                                    !isKycVerified
                                                }
                                                title={
                                                    !isLoggedIn
                                                        ? 'Login required to vote'
                                                        : !isKycVerified
                                                        ? 'KYC verification required to vote'
                                                        : 'Upvote this metric'
                                                }>
                                                <ThumbsUp size={14} />
                                                <span>{votes.upvote}</span>
                                            </button>
                                            <button
                                                className={`sidebar-vote-btn downvote ${
                                                    userVotes[metricType] === -1
                                                        ? 'active'
                                                        : ''
                                                } ${
                                                    !isLoggedIn ||
                                                    !isKycVerified
                                                        ? 'disabled'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    handleMetricVote(
                                                        metricType,
                                                        'downvote'
                                                    )
                                                }
                                                disabled={
                                                    isLoadingVotes ||
                                                    isCheckingKyc ||
                                                    !isLoggedIn ||
                                                    !isKycVerified
                                                }
                                                title={
                                                    !isLoggedIn
                                                        ? 'Login required to vote'
                                                        : !isKycVerified
                                                        ? 'KYC verification required to vote'
                                                        : 'Downvote this metric'
                                                }>
                                                <ThumbsDown size={14} />
                                                <span>{votes.downvote}</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Comments Section - Moved below the voting panel */}
                    <div className="comments-panel">
                        <div className="comments-header">
                            <MessageSquare size={20} />
                            <h3>Comments ({comments.length})</h3>

                            {/* Comment Sort Options */}
                            <select
                                value={commentSortBy}
                                onChange={(e) =>
                                    setCommentSortBy(e.target.value)
                                }
                                className="comment-sort-select">
                                <option value="NEWEST">Newest First</option>
                                <option value="OLDEST">Oldest First</option>
                            </select>
                        </div>

                        {/* Comment Error Display */}
                        {commentError && (
                            <div className="comment-error">
                                <AlertTriangle size={16} />
                                <span>{commentError}</span>
                                <button onClick={() => setCommentError(null)}>
                                    ×
                                </button>
                            </div>
                        )}

                        <form
                            className="comment-form"
                            onSubmit={handleCommentSubmit}>
                            <textarea
                                placeholder={
                                    !isLoggedIn
                                        ? 'Login required to comment...'
                                        : !isKycVerified
                                        ? 'KYC verification required to comment...'
                                        : 'Add your comment...'
                                }
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                                disabled={
                                    !isLoggedIn ||
                                    !isKycVerified ||
                                    isSubmittingComment
                                }
                                maxLength={1000}
                            />
                            <div className="comment-form-footer">
                                <span className="character-count">
                                    {commentText.length}/1000
                                </span>
                                <button
                                    type="submit"
                                    className={`submit-comment-btn ${
                                        !isLoggedIn ||
                                        !isKycVerified ||
                                        isSubmittingComment
                                            ? 'disabled'
                                            : ''
                                    }`}
                                    disabled={
                                        !isLoggedIn ||
                                        !isKycVerified ||
                                        isSubmittingComment
                                    }
                                    title={
                                        !isLoggedIn
                                            ? 'Login required to comment'
                                            : !isKycVerified
                                            ? 'KYC verification required to comment'
                                            : 'Post your comment'
                                    }>
                                    {isSubmittingComment ? (
                                        <>
                                            <RotateCcw
                                                size={16}
                                                className="spinning"
                                            />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Post Comment
                                        </>
                                    )}
                                    {(!isLoggedIn || !isKycVerified) && (
                                        <Lock
                                            size={16}
                                            style={{ marginLeft: '8px' }}
                                        />
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="comments-list">
                            {isLoadingComments ? (
                                <div className="comments-loading">
                                    <Loading />
                                    <p>Loading comments...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="no-comments">
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="comment-item">
                                        <div className="comment-header">
                                            <div className="comment-author">
                                                {CommentUtils.getAuthorDisplayName(
                                                    comment
                                                )}
                                            </div>
                                            <div className="comment-meta">
                                                <span className="comment-time">
                                                    {CommentUtils.formatCommentTime(
                                                        comment.createdAt ||
                                                            comment.timestamp
                                                    )}
                                                </span>
                                                {CommentUtils.isCommentOwner(
                                                    comment
                                                ) && (
                                                    <button
                                                        className="comment-delete-btn"
                                                        onClick={() =>
                                                            handleCommentDelete(
                                                                comment.id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingCommentId ===
                                                            comment.id
                                                        }
                                                        title="Delete comment">
                                                        {deletingCommentId ===
                                                        comment.id ? (
                                                            <RotateCcw
                                                                size={12}
                                                                className="spinning"
                                                            />
                                                        ) : (
                                                            <Trash2 size={12} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="comment-content">
                                            {comment.content || comment.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Section - Only Iframe now */}
            <div className="bottom-section-container">
                {/* Source Iframe */}
                <div className="iframe-section">
                    <div
                        className="iframe-header"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <h3>Read from Original Source: {activeSource}</h3>
                        <div className="iframe-actions">
                            <a
                                href={getSourceUrl(activeSource)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="open-source-btn"
                                title={`Open ${
                                    activeSource || 'source'
                                } in a new tab`}>
                                <Send size={16} />
                            </a>
                        </div>
                    </div>
                    <NewsIframe
                        src={getSourceUrl(activeSource)}
                        title={`${activeSource} - ${
                            currentArticle?.title || newsData.title
                        }`}
                    />
                </div>
            </div>
        </div>
    );
};

export default MainNews;
