import React from 'react';
import {
    BookMarkedIcon,
    ChartNoAxesColumn,
    Code,
    Facebook,
    LinkedinIcon,
    Link,
    Mail,
    RedoDotIcon,
    Twitter,
} from 'lucide-react';

const NewsHeader = ({ publishedDate, location, updatedTime, onShare }) => {
    const handleShareClick = (platform) => {
        if (onShare) {
            onShare(platform);
        }
    };

    const handleBookmark = () => {
        
        console.log('Article bookmarked');
        alert('Article bookmarked!');
    };

    const handleCopyLink = () => {
        navigator.clipboard
            .writeText(window.location.href)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Failed to copy link'));
    };

    return (
        <div className="news-main">
            <div className="news-top">
                <span>Published {publishedDate}</span>
                <ul>
                    <li>{location}</li>
                    <li>Updated {updatedTime}</li>
                </ul>
            </div>

            <div className="news-share-main">
                <div className="news-share-icon">
                    <Facebook onClick={() => handleShareClick('facebook')} />
                    <Twitter onClick={() => handleShareClick('twitter')} />
                    <LinkedinIcon
                        onClick={() => handleShareClick('linkedin')}
                    />
                    <RedoDotIcon onClick={() => window.location.reload()} />
                    <Mail onClick={() => handleShareClick('email')} />
                    <Code onClick={() => console.log('Embed code')} />
                </div>
                <div className="news-share-icon">
                    <Link onClick={handleCopyLink} />
                    <BookMarkedIcon onClick={handleBookmark} />
                    <ChartNoAxesColumn
                        onClick={() => console.log('Analytics')}
                    />
                </div>
            </div>
        </div>
    );
};

export default NewsHeader;
