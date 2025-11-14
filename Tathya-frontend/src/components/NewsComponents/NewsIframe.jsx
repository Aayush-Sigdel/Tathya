import React from 'react';
import './NewsIframe.css';

const NewsIframe = ({ src, title }) => {
    return (
        <div className="news-iframe-container">
            <iframe
                src={src}
                title={title || 'News Source'}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
};

export default NewsIframe;
