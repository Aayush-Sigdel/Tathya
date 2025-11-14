import React from 'react';
import './NewsSourceButtons.css';

const NewsSourceButtons = ({ sources, onSourceSelect, activeSource }) => {
    return (
        <div className="news-source-buttons">
            {sources.map((source, index) => (
                <button
                    key={index}
                    className={activeSource === source ? 'active' : ''}
                    onClick={() => onSourceSelect && onSourceSelect(source)}>
                    {source}
                </button>
            ))}
        </div>
    );
};

export default NewsSourceButtons;
