import React from 'react';
import './BiasChart.css';

const BiasChart = ({ newsData, activeSource }) => {
    // Get bias data for the currently active source
    const getCurrentSourceBias = () => {
        if (!newsData || !newsData.news || !activeSource) return null;

        // Find the current active article
        const currentArticle = newsData.news.find(
            (article) => article.newsPortal === activeSource
        );

        if (!currentArticle) return null;

        // Convert normalized bias to percentage
        const biasPercentage = Math.round(
            (currentArticle.normalizedBias || 0) * 100
        );

        return {
            source: currentArticle.newsPortal,
            biasPercentage: biasPercentage,
            unbiasedPercentage: 100 - biasPercentage,
            rawBias: currentArticle.bias || 0,
            title: currentArticle.title,
        };
    };

    const currentBias = getCurrentSourceBias();

    const getBiasLabel = (percentage) => {
        if (percentage <= 20) return 'Low Bias';
        if (percentage <= 40) return 'Moderate Bias';
        if (percentage <= 70) return 'High Bias';
        return 'Very High Bias';
    };

    const getBiasColorClass = (percentage) => {
        if (percentage <= 20) return 'bias-low';
        if (percentage <= 40) return 'bias-moderate';
        if (percentage <= 70) return 'bias-high';
        return 'bias-very-high';
    };

    if (!currentBias) {
        return (
            <div className="individual-bias-chart">
                <h3>Bias Analysis</h3>
                <p>No bias data available for selected source</p>
            </div>
        );
    }

    return (
        <div className="">
            {/* Main Bias Display */}
            <div className="bias-main-display">
                {/* Left side - Percentage and Label */}
                <div className="bias-info-section">
                    <div className="bias-percentage-large">
                        <span className="percentage-number">
                            {currentBias.biasPercentage}%
                        </span>
                        <span className="percentage-label">Biased</span>
                    </div>
                    <div
                        className={`bias-category-badge ${getBiasColorClass(
                            currentBias.biasPercentage
                        )}`}>
                        {getBiasLabel(currentBias.biasPercentage)}
                    </div>
                </div>

                {/* Right side - Visual Bar */}
                <div className="bias-visual-section">
                    <div className="bias-visual-bar">
                        <div
                            className="unbiased-portion-large"
                            style={{
                                width: `${currentBias.unbiasedPercentage}%`,
                            }}
                        />
                        <div
                            className="biased-portion-large"
                            style={{ width: `${currentBias.biasPercentage}%` }}
                        />
                    </div>

                    {/* Legend below the bar */}
                    <div className="bias-legend-inline">
                        <div className="legend-item">
                            <div className="legend-color unbiased"></div>
                            <span>
                                Unbiased {currentBias.unbiasedPercentage}%
                            </span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color biased"></div>
                            <span>Biased {currentBias.biasPercentage}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiasChart;
