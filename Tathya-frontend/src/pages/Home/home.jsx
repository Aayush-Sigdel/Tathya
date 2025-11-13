import React from 'react';
import NewsPreview from '../../components/newsPreview/newspreview';
import { useNavigate } from 'react-router-dom';
import ContentLayout from '../../layouts/mainContents/contentLayout';
import '../../index.css';

function Home({ selectedCategory, onCategoryChange }) {
    const navigate = useNavigate();

    const handleArticleSelect = (article) => {
        navigate(`/news/${article._id.$oid}`);
    };

    return (
        <div className="home-page">
            <ContentLayout />

            {/* News Section */}
            <div className="home-news-section">
                <div className="section-header">
                    <h2>Latest News</h2>
                    <p>Stay updated with the latest happenings</p>
                </div>
                <NewsPreview
                    onArticleSelect={handleArticleSelect}
                    selectedCategory={selectedCategory}
                    onCategoryChange={onCategoryChange}
                />
            </div>
        </div>
    );
}

export default Home;
