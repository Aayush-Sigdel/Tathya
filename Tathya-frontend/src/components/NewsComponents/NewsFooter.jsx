import React from 'react';
import { Info, Wrench } from 'lucide-react';
import './NewsFooter.css';

const NewsFooter = ({ onFeedback }) => {
    return (
        <div className="news-main-footer">
            <div className="news-footer">
                <Info />
                <span>Insight by Tathya Ai</span>
            </div>
            <div className="news-footer">
                <Wrench />
                <span
                    onClick={onFeedback}
                    style={{ cursor: 'pointer' }}>
                    Does this summary seem wrong?
                </span>
            </div>
        </div>
    );
};

export default NewsFooter;
