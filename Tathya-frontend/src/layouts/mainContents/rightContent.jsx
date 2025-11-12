import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import styles from './RightContent.module.css';
import govpic from '../../assets/mock_images/govpic.jpeg';

const RightContent = () => {
  const relatedNews = [
    {
      id: 1,
      title: 'Dems move rapidly on impeachment with first Judiciary Committee hearing',
      image: govpic,
      category: 'IMPEACHMENT',
      views: '2.5m'
    },
    {
      id: 2,
      title: 'Quicksand engulfs a bipartisan plan that even Trump backs',
      image: '',
      category: 'CONGRESS',
      views: '2.5m'
    },
    {
      id: 3,
      title: "Behind Trump's secret war-zone trip: A Mar-a-Lago escape, a twin Air Force One",
      image: '',
      category: 'WHITE HOUSE',
      views: '2.5m'
    }
  ];

  return (
    <div className={styles["right-content-container"]}>
      <div className={styles["header-container"]}>
        <h2 className={styles["section-title"]}>Related News</h2>
        <Link to="all" className={styles["see-all-link"]}>See all</Link>
      </div>

      <div className={styles["news-cards-container"]}>
        {relatedNews.map((news) => (
          <Link 
            key={news.id} 
            to={`news/${news.id}`}
            className={styles["news-card"]}
          >
            <div className={styles["card-image-container"]}>
              <img 
                src={news.image} 
                alt={news.title}
                className={styles["card-image"]}
              />
              <div className={styles["category-badge"]}>
                <span className={styles["category-text"]}>{news.category}</span>
              </div>
            </div>
            
            <div className={styles["card-content"]}>
              <div className={styles["views-container"]}>
                <Eye size={14} className={styles["eye-icon"]} />
                <span className={styles["views-text"]}>{news.views}</span>
              </div>
              <h3 className={styles["card-title"]}>{news.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RightContent;
