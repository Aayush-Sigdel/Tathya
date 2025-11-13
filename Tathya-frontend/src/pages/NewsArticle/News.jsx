import React from 'react';
import NewsPreview from '../../components/newsPreview/newspreview';
import { useNavigate } from 'react-router-dom';
import './NewsArticle.css';

const News = ({ selectedCategory, onCategoryChange }) => {
    const navigate = useNavigate();

    const handleArticleSelect = (article) => {
        // Navigate to the specific article page
        navigate(`/news/${article._id.$oid}`);
    };

    return (
        <div className="news-page">
            <div className="page-header">
                <h1>Latest News</h1>
                <p>Browse the latest news articles from various sources</p>
            </div>
            <NewsPreview
                onArticleSelect={handleArticleSelect}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
            />
        </div>
    );
};

export default News;
