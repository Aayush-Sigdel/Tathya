import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, AlertTriangle } from 'lucide-react';
import MainNews from '../../components/NewsComponents/MainNews';
import BlindspotWidget from '../../components/BlindspotWidget/BlindspotWidget';
import Loading from '../../components/Loading/Loading';
import { BlindspotService } from '../../services/blindspotService';
import './BlindspotArticle.css';

const BlindspotArticle = () => {
    const { blindspotId } = useParams();
    const navigate = useNavigate();

    const [blindspotData, setBlindspotData] = useState(null);
    const [newsGroupData, setNewsGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedBlindspots, setRelatedBlindspots] = useState([]);

    // Fetch blindspot data
    useEffect(() => {
        const fetchBlindspotData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Fetching blindspot with ID:', blindspotId);

                // Fetch the specific blindspot by string ID
                const blindspot = await BlindspotService.getBlindspotById(
                    blindspotId
                );

                if (!blindspot) {
                    throw new Error(
                        `Blindspot article with ID ${blindspotId} not found`
                    );
                }

                console.log('Blindspot data found:', blindspot);
                setBlindspotData(blindspot);

                // Transform News to NewsGroup format for MainNews
                const transformedData =
                    BlindspotService.transformNewsToNewsGroup(blindspot);
                console.log('Transformed data for MainNews:', transformedData);
                setNewsGroupData(transformedData);

                // Fetch related blindspots (same category, excluding current)
                const allBlindspots = await BlindspotService.getAllBlindSpots(
                    50
                );
                const related = allBlindspots
                    .filter(
                        (spot) =>
                            spot.category === blindspot.category &&
                            spot.id !== blindspotId // Compare as string
                    )
                    .slice(0, 5);

                console.log('Related blindspots:', related);
                setRelatedBlindspots(related);
            } catch (err) {
                console.error('Error fetching blindspot:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (blindspotId) {
            fetchBlindspotData();
        }
    }, [blindspotId]);

    // Update page title
    useEffect(() => {
        if (blindspotData?.title) {
            document.title = `${blindspotData.title} - Blindspot Article - Tathya News`;
        }
        return () => {
            document.title = 'Tathya News';
        };
    }, [blindspotData]);

    const handleBackToBlindspots = () => {
        navigate('/blindspot');
    };

    const handleRelatedBlindspotClick = (relatedBlindspot) => {
        navigate(`/blindspot-article/${relatedBlindspot.id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Unknown time';

        try {
            const posted = new Date(dateString);
            const now = new Date();
            const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));

            if (diffInHours < 1) {
                return 'Just now';
            } else if (diffInHours < 24) {
                return `${diffInHours}h ago`;
            } else {
                const diffInDays = Math.floor(diffInHours / 24);
                return `${diffInDays}d ago`;
            }
        } catch (error) {
            return 'Unknown time';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="blindspot-article-page">
                <div className="loading-container">
                    <Loading />
                    <p>Loading blindspot article...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="blindspot-article-page">
                <div className="error-container">
                    <AlertTriangle size={48} />
                    <h2>Blindspot Article Not Found</h2>
                    <p>
                        Sorry, the blindspot article you're looking for doesn't
                        exist or couldn't be loaded.
                    </p>
                    <p className="error-message">Error: {error}</p>
                    <button
                        className="back-button"
                        onClick={handleBackToBlindspots}>
                        <ArrowLeft size={20} />
                        Back to Blindspots
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (!blindspotData || !newsGroupData) {
        return (
            <div className="blindspot-article-page">
                <div className="error-container">
                    <AlertTriangle size={48} />
                    <h2>No Blindspot Data</h2>
                    <p>The blindspot article data could not be loaded.</p>
                    <button
                        className="back-button"
                        onClick={handleBackToBlindspots}>
                        <ArrowLeft size={20} />
                        Back to Blindspots
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="blindspot-article-page">
            <MainNews newsGroup={newsGroupData} />

            {/* Related Blindspots Section */}
            {relatedBlindspots.length > 0 && (
                <div className="related-blindspots-section">
                    <div className="related-blindspots-container">
                        <div className="related-blindspots-header">
                            <div className="header-content">
                                <h2>
                                    More Blindspots in {blindspotData?.category}
                                </h2>
                                <p>
                                    Other underreported stories you might find
                                    interesting
                                </p>
                            </div>
                        </div>

                        <div className="related-blindspots-grid">
                            {relatedBlindspots.map((relatedBlindspot) => (
                                <div
                                    key={relatedBlindspot.id}
                                    className="related-blindspot-card"
                                    onClick={() =>
                                        handleRelatedBlindspotClick(
                                            relatedBlindspot
                                        )
                                    }>
                                    <div className="card-image">
                                        <img
                                            src={
                                                relatedBlindspot.imageUrl ||
                                                'https://placehold.co/300x200/f0f0f0/666666?text=Blindspot'
                                            }
                                            alt={
                                                relatedBlindspot.title ||
                                                'Blindspot article'
                                            }
                                            onError={(e) => {
                                                e.target.src =
                                                    'https://placehold.co/300x200/f0f0f0/666666?text=Blindspot';
                                            }}
                                        />
                                        <div className="blindspot-overlay">
                                            <Eye size={16} />
                                            <span>Blindspot</span>
                                        </div>
                                    </div>

                                    <div className="card-content">
                                        <h3 className="card-title">
                                            {relatedBlindspot.title ||
                                                'Untitled'}
                                        </h3>
                                        <p className="card-lead">
                                            {(
                                                relatedBlindspot.lead ||
                                                relatedBlindspot.description ||
                                                ''
                                            )?.substring(0, 120)}
                                            {(
                                                relatedBlindspot.lead ||
                                                relatedBlindspot.description ||
                                                ''
                                            ).length > 120
                                                ? '...'
                                                : ''}
                                        </p>
                                        <div className="card-meta">
                                            <span className="source">
                                                {relatedBlindspot.newsPortal ||
                                                    'Unknown Source'}
                                            </span>
                                            <span className="time">
                                                {getTimeAgo(
                                                    relatedBlindspot.postedAt
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlindspotArticle;
