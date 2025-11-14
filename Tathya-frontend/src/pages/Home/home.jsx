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
        navigate(`/news/${newsGroup.groupId}`);
    };

    return (
        <div className="home-page">
            <ContentLayout />
            <MostRead />
            <ExtraLayout />
        </div>
    );
}

export default Home;
