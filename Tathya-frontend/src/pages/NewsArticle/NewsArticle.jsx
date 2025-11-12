import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainNews from '../../components/NewsComponents/MainNews';
import dummyData from '../../components/NewsComponents/dummydata.json';
import './NewsArticle.css';

const NewsArticle = () => {
    const { articleId } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Find the article by ID
        const foundArticle = dummyData.articles.find(
            (art) => art._id.$oid === articleId
        );

        if (foundArticle) {
            setArticle(foundArticle);
            setLoading(false);

            // Set page title
            document.title = `${foundArticle.title} - Tathya News`;
        } else {
            setError('Article not found');
            setLoading(false);
        }
    }, [articleId]);

    const handleBackToNews = () => {
        navigate('/about');
    };

    if (loading) {
        return (
            <div className="news-article-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading article...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-article-page">
                <div className="error-container">
                    <h2>Article Not Found</h2>
                    <p>Sorry, the article you're looking for doesn't exist.</p>
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
            <div className="article-navigation">
                <button
                    className="back-button"
                    onClick={handleBackToNews}>
                    <ArrowLeft size={20} />
                    Back to News Feed
                </button>

                <div className="article-breadcrumb">
                    <span
                        onClick={() => navigate('/')}
                        className="breadcrumb-link">
                        Home
                    </span>
                    <span className="breadcrumb-separator">/</span>
                    <span
                        onClick={() => navigate('/about')}
                        className="breadcrumb-link">
                        News
                    </span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">
                        {article.category}
                    </span>
                </div>
            </div>

            <MainNews article={article} />
        </div>
    );
};

export default NewsArticle;
