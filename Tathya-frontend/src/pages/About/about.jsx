import React from 'react';
import NewsPreview from '../../components/newsPreview/newspreview';
import { useNavigate } from 'react-router-dom';
import './about.css';

const About = ({ selectedCategory, onCategoryChange }) => {
    const navigate = useNavigate();

    const handleArticleSelect = (article) => {
        // Navigate to the specific article page
        navigate(`/news/${article._id.$oid}`);
    };

    return (
        <div className="about-page">
            <div className="news-preview-section">
                <div className="page-header">
                    <h1>Tathya News</h1>
                    <p>
                        Stay informed with the latest news from Nepal and around
                        the world
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
