import React from 'react';

const NewsSummary = ({ summaryPoints }) => {
    return (
        <div className="news-summary-container">
            <ul className="news-summary-unorderlist">
                {summaryPoints.map((point, index) => (
                    <li
                        key={index}
                        className="news-summary-list"
                        style={{ '--item-index': index }}>
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NewsSummary;
