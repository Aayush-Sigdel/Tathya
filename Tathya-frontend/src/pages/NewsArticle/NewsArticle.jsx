import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import MainNews from '../../components/NewsComponents/MainNews';
// import newsGroupsData from '../../components/NewsComponents/newsGroupsData.json';
import './NewsArticle.css';
import Loading from '../../components/Loading/Loading';
import dummyData from '../../components/NewsComponents/dummydata.json';

const NewsArticle = () => {
    const { articleId } = useParams(); // This might be groupId now
    const navigate = useNavigate();
    const [newsGroup, setNewsGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const groups = Array.isArray(dummyData?.newsGroups)
                ? dummyData.newsGroups
                : [];
            const found = groups.find((g) => g.groupId === articleId);
            if (found) {
                setNewsGroup(found);
                document.title = `${
                    found.news?.[0]?.title || 'News'
                } - Tathya News`;
                setLoading(false);
            } else {
                setError('News group not found');
                setLoading(false);
            }
        } catch (e) {
            setError('Failed to load news data');
            setLoading(false);
        }
    }, [articleId]);

    const handleBackToNews = () => {
        navigate('/news');
    };

    if (loading) {
        return (
            <div className="news-article-page">
                <div className="loading-container">
                    <Loading />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-article-page">
                <div className="error-container">
                    <div className="loading-spinner"></div>
                    <h2>News Group Not Found</h2>
                    <p>
                        Sorry, the news group you're looking for doesn't exist.
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
            <MainNews newsGroup={newsGroup} />
            <div className="article-navigation"></div>
        </div>
    );
};

export default NewsArticle;
