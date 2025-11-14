import React from 'react';
import NewsPreview from '../../components/newsPreview/newspreview';
import { useNavigate } from 'react-router-dom';
import ContentLayout from '../../layouts/mainContents/contentLayout';
import MostRead from '../../layouts/extraContent/mostRead';
import ExtraLayout from '../../layouts/extraContent/extraLayout';
import '../../index.css';

function Home({ selectedCategory, onCategoryChange }) {
    const navigate = useNavigate();

    const handleArticleSelect = (newsGroup) => {
        // Navigate to the news group page using groupId
        navigate(`/news/${newsGroup.groupId}`);
    };

    return (
        <div className="home-page">
            <ContentLayout />
            <MostRead />
            <ExtraLayout />

            {/* News Section */}
            <div className="home-news-section">
                <div className="section-header">
                    <h2>Latest News Coverage</h2>
                    <p>
                        Compare perspectives from multiple sources on the same
                        story
                    </p>
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
