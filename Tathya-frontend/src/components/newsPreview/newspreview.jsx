import React, { useState } from 'react';
import { Clock, Eye, ArrowRight, Calendar, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dummyData from '../NewsComponents/dummydata.json';
import './newspreview.css';

const NewsPreview = ({ onArticleSelect }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [hoveredCard, setHoveredCard] = useState(null);
    const navigate = useNavigate();

    const articles = dummyData.articles;
    const categories = ['All', ...dummyData.metadata.categories];

 
    const filteredArticles =
        selectedCategory === 'All'
            ? articles
            : articles.filter(
                  (article) => article.category === selectedCategory
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

    // Get sentiment color
    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive':
                return '#4CAF50';
            case 'negative':
                return '#f44336';
            case 'neutral':
                return '#FFC107';
            default:
                return '#9E9E9E';
        }
    };

    const handleCardClick = (article) => {
        if (onArticleSelect) {
            onArticleSelect(article);
        } else {
         
            navigate(`/news/${article._id.$oid}`);
        }
    };

    return (
        <div className="news-preview-container">
            <div className="news-preview-header">
                <h2>Latest News</h2>
                <div className="category-filters">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`category-btn ${
                                selectedCategory === category ? 'active' : ''
                            }`}
                            onClick={() => setSelectedCategory(category)}>
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="news-preview-grid">
                {filteredArticles.map((article, index) => (
                    <div
                        key={article._id.$oid}
                        className="news-preview-card"
                        onClick={() => handleCardClick(article)}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}>
                        <div className="card-image">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                onError={(e) => {
                                    e.target.src =
                                        'https://via.placeholder.com/400x200?text=News+Image';
                                }}
                            />
                            <div className="card-overlay">
                                <span
                                    className="category-badge"
                                    style={{
                                        backgroundColor: getSentimentColor(
                                            article.metrics.sentiment
                                        ),
                                    }}>
                                    {article.category}
                                </span>
                            </div>
                        </div>

                        <div className="card-content">
                            <div className="card-meta">
                                <div className="meta-item">
                                    <Calendar size={14} />
                                    <span>{getTimeAgo(article.postedAt)}</span>
                                </div>
                                <div className="meta-item">
                                    <Clock size={14} />
                                    <span>{article.metrics.readTime}</span>
                                </div>
                                <div className="meta-item">
                                    <Globe size={14} />
                                    <span>{article.newsPortal}</span>
                                </div>
                            </div>

                            <h3 className="card-title">{article.title}</h3>

                            <p className="card-lead">{article.lead}</p>

                            <div className="card-summary">
                                <h4>Key Points:</h4>
                                <ul>
                                    {article.keyPoints
                                        .slice(0, 3)
                                        .map((point, idx) => (
                                            <li key={idx}>{point}</li>
                                        ))}
                                </ul>
                            </div>

                            <div className="card-footer">
                                <div className="metrics">
                                    <span className="word-count">
                                        {article.metrics.wordCount} words
                                    </span>
                                    <div
                                        className="sentiment-indicator"
                                        style={{
                                            backgroundColor: getSentimentColor(
                                                article.metrics.sentiment
                                            ),
                                        }}>
                                        {article.metrics.sentiment}
                                    </div>
                                </div>

                                <div className="read-more">
                                    <Eye size={16} />
                                    <span>Read Full Article</span>
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
                ))}
            </div>

            {filteredArticles.length === 0 && (
                <div className="no-articles">
                    <p>No articles found for the selected category.</p>
                </div>
            )}
        </div>
    );
};

export default NewsPreview;
