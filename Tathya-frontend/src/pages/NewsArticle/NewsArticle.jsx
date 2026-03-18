import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import MainNews from '../../components/NewsComponents/MainNews';
import './NewsArticle.css';
import Loading from '../../components/Loading/Loading';
import { useNewsGroup, useNewsByCategory } from '../../services/fetchNewsData';

const NewsArticle = () => {
    const { articleId } = useParams(); // This is the groupId
    const navigate = useNavigate();
    const { data: newsGroup, loading, error } = useNewsGroup(articleId);

    // Get the category from the main news article
    const currentCategory = newsGroup?.news?.[0]?.category;

    // State for managing related news with infinite scroll
    const [relatedNewsData, setRelatedNewsData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Refs for scroll detection
    const observerRef = useRef();
    const loadingElementRef = useRef();

    // Fetch related news by category (excluding current article)
    const {
        data: relatedNews,
        loading: relatedLoading,
        error: relatedError,
        refetch: refetchRelated,
    } = useNewsByCategory(currentCategory, page * 6); // Load 6 articles per "page"

    // Update related news data when new data arrives
    useEffect(() => {
        if (relatedNews && relatedNews.length > 0) {
            const filtered = relatedNews.filter(
                (item) => item.groupId !== articleId
            );

            if (initialLoad) {
                setRelatedNewsData(filtered);
                setInitialLoad(false);
            } else {
                // Check if we got new articles
                const existingIds = new Set(
                    relatedNewsData.map((item) => item.groupId)
                );
                const newArticles = filtered.filter(
                    (item) => !existingIds.has(item.groupId)
                );

                if (newArticles.length === 0) {
                    setHasMore(false);
                } else {
                    setRelatedNewsData((prev) => {
                        const combinedData = [...prev];
                        newArticles.forEach((newArticle) => {
                            if (
                                !combinedData.find(
                                    (existing) =>
                                        existing.groupId === newArticle.groupId
                                )
                            ) {
                                combinedData.push(newArticle);
                            }
                        });
                        return combinedData;
                    });
                }
            }
            setLoadingMore(false);
        } else if (relatedNews && relatedNews.length === 0) {
            setHasMore(false);
            setLoadingMore(false);
        }
    }, [relatedNews, articleId, initialLoad, relatedNewsData]);

    // Load more articles function
    const loadMore = useCallback(() => {
        if (loadingMore || relatedLoading || !hasMore || !currentCategory)
            return;

        setLoadingMore(true);
        setPage((prevPage) => prevPage + 1);
    }, [loadingMore, relatedLoading, hasMore, currentCategory]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loadingMore) {
                    loadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px', // Start loading 100px before element comes into view
            }
        );

        observerRef.current = observer;

        if (loadingElementRef.current) {
            observer.observe(loadingElementRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore, hasMore, loadingMore]);

    // Navigation handlers
    const handleBackToNews = () => {
        navigate('/news');
    };

    const handleRelatedNewsClick = (groupId) => {
        navigate(`/news/${groupId}`);
        // Scroll to top when navigating to new article
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefreshRelated = () => {
        setPage(1);
        setRelatedNewsData([]);
        setHasMore(true);
        setInitialLoad(true);
        setLoadingMore(false);
        refetchRelated();
    };

    // Update page title when news group is loaded
    useEffect(() => {
        if (newsGroup && newsGroup.news?.[0]?.title) {
            document.title = `${newsGroup.news[0].title} - Tathya News`;
        }
        return () => {
            document.title = 'Tathya News'; // Reset title on unmount
        };
    }, [newsGroup]);

    // Reset related news state when article changes
    useEffect(() => {
        setPage(1);
        setRelatedNewsData([]);
        setHasMore(true);
        setInitialLoad(true);
        setLoadingMore(false);
    }, [articleId]);

    if (loading) {
        return (
            <div className="news-article-page">
                <div className="loading-container">
                    <Loading />
                    <p>Loading news article...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-article-page">
                <div className="error-container">
                    <h2>News Article Not Found</h2>
                    <p>
                        Sorry, the news article you're looking for doesn't exist
                        or couldn't be loaded.
                    </p>
                    <p className="error-message">Error: {error}</p>
                    <button
                        className="back-button"
                        onClick={handleBackToNews}>
                        <ArrowLeft size={20} />
                        Back to News Feed
                    </button>
                </div>
            </div>
        );
    }

    if (!newsGroup) {
        return (
            <div className="news-article-page">
                <div className="error-container">
                    <h2>News Article Not Found</h2>
                    <p>
                        Sorry, the news article you're looking for doesn't
                        exist.
                    </p>
                    <button
                        className="back-button"
                        onClick={handleBackToNews}>
                        <ArrowLeft size={20} />
                        Back to News Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="news-article-page">
            {/* Navigation Bar */}

            {/* Main News Content */}
            <MainNews newsGroup={newsGroup} />
        </div>
    );
};

export default NewsArticle;
