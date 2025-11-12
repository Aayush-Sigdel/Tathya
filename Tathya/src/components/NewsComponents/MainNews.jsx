import React, { useState, useEffect } from 'react';
import NewsHeader from './NewsHeader';
import NewsTitle from './NewsTitle';
import NewsSourceButtons from './NewsSourceButtons';
import NewsSummary from './NewsSummary';
import NewsFooter from './NewsFooter';
import NewsIframe from './NewsIframe';
import './mainNews.css';
import dummyData from './dummydata.json';

const MainNews = ({ article }) => {
    const [activeSource, setActiveSource] = useState('');
    const [newsData, setNewsData] = useState(null);
    const [currentSourceData, setCurrentSourceData] = useState(null);

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
        if (article) {
            const processedData = {
                publishedDate: getTimeAgo(article.postedAt),
                location: extractLocation(article.lead),
                updatedTime: getTimeAgo(article.postedAt),
                title: article.title,
                description: article.description,
                lead: article.lead,
                category: article.category,
                imageUrl: article.imageUrl,
                newsPortal: article.newsPortal,
                url: article.url,
                sources: dummyData.metadata.sources,
                summaryPoints: article.keyPoints,
                metrics: article.metrics,
                summary: article.summary,
                alternativeSources: article.alternativeSources || {},
            };

            setNewsData(processedData);
            setActiveSource(article.newsPortal);
            setCurrentSourceData({
                title: article.title,
                description: article.description,
                imageUrl: article.imageUrl,
                url: article.url,
            });
        }
    }, [article]);

    const handleSourceSelect = (source) => {
        setActiveSource(source);

        if (
            newsData &&
            newsData.alternativeSources &&
            newsData.alternativeSources[source]
        ) {
            // Use alternative source data
            const altData = newsData.alternativeSources[source];
            setCurrentSourceData({
                title: altData.title,
                description: altData.description,
                imageUrl: altData.imageUrl,
                url: altData.url,
            });
        } else {
            // Use original article data
            setCurrentSourceData({
                title: newsData.title,
                description: newsData.description,
                imageUrl: newsData.imageUrl,
                url: newsData.url,
            });
        }

        console.log('Selected source:', source);
    };

    const getSourceUrl = (sourceName) => {
    
        if (
            newsData &&
            newsData.alternativeSources &&
            newsData.alternativeSources[sourceName]
        ) {
            return newsData.alternativeSources[sourceName].url;
        }

   
        const sourceUrls = {
            eKantipur: 'https://ekantipur.com',
            'Kathmandu Post': 'https://kathmandupost.com',
            'Online Khabar': 'https://onlinekhabar.com',
            'Nepal News': 'https://nepalnews.com',
            'DC Nepal': 'https://english.dcnepal.com',
            'The Himalayan Times': 'https://thehimalayantimes.com',
            'Primetime News': 'https://primetimenews.com.np',
        };

        return (
            sourceUrls[sourceName] || newsData?.url || 'https://nepalnews.com'
        );
    };

    const handleFeedback = () => {
        console.log('Feedback requested for article:', article?.title);
        alert('Thank you for your feedback! We will review this article.');
    };

    const handleShare = (platform) => {
        if (!newsData || !currentSourceData) return;

        const shareUrl = encodeURIComponent(
            currentSourceData.url || window.location.href
        );
        const shareTitle = encodeURIComponent(currentSourceData.title);
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

    if (!newsData && article) {
        return (
            <div className="main">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading article...</p>
                </div>
            </div>
        );
    }

  
    if (!article) {
        return (
            <div className="main">
                <div className="loading-container">
                    <p>No article data provided</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main">
            <div className="news-main-container">
                <NewsHeader
                    publishedDate={newsData.publishedDate}
                    location={newsData.location}
                    updatedTime={newsData.updatedTime}
                    onShare={handleShare}
                />

                <NewsTitle title={currentSourceData?.title || newsData.title} />

                {/* Source indicator */}
                <div className="current-source-indicator">
                    <span className="source-label">
                        Currently viewing from:
                    </span>
                    <span className="source-name">{activeSource}</span>
                </div>

                {(currentSourceData?.imageUrl || newsData.imageUrl) && (
                    <div className="article-image-container">
                        <img
                            src={
                                currentSourceData?.imageUrl || newsData.imageUrl
                            }
                            alt={currentSourceData?.title || newsData.title}
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
                            {currentSourceData?.description ||
                                newsData.description}
                        </p>
                    </div>

                    {newsData.summary && (
                        <div className="article-summary">
                            <h3>Summary</h3>
                            <p>{newsData.summary}</p>
                        </div>
                    )}

                    {newsData.metrics && (
                        <div className="article-metrics">
                            <span className="read-time">
                                📖 {newsData.metrics.readTime}
                            </span>
                            <span className="word-count">
                                📝 {newsData.metrics.wordCount} words
                            </span>
                            <span
                                className={`sentiment sentiment-${newsData.metrics.sentiment}`}>
                                🎯 {newsData.metrics.sentiment}
                            </span>
                        </div>
                    )}
                </div>

                <NewsSourceButtons
                    sources={newsData.sources}
                    onSourceSelect={handleSourceSelect}
                    activeSource={activeSource}
                />

                <NewsSummary summaryPoints={newsData.summaryPoints} />

                <NewsFooter onFeedback={handleFeedback} />
            </div>

            <NewsIframe
                src={getSourceUrl(activeSource)}
                title={`${activeSource} - ${
                    currentSourceData?.title || newsData.title
                }`}
            />
        </div>
    );
};

export default MainNews;
