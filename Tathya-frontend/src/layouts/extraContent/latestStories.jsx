import React from 'react';
import {Link} from 'react-router-dom';
import styles from './latestStories.module.css';
import kenyaPic from '../../assets/mock_images/kenyaPic.webp';
import BiasMeta from '../bias/biasMeta';

const LatestStories = () => {
  //mock data
  const stories = [
    {
      id: 1,
      category: 'Crime',
      location: 'Kenya',
      title: "Ex-British Soldier Fights Extradition over Kenyan Woman's Murder",
      biasPercentage: 52,
      sources: 31,
      image: kenyaPic
    },
    {
      id: 2,
      category: 'Indonesia Politics',
      location: 'Indonesia',
      title: 'Indonesian activists rally against plan to name Suharto as national hero',
      biasPercentage: 62,
      sources: 9,
      image: ''
    },
    {
      id: 3,
      category: 'Space',
      location: '',
      title: 'Saturn Moon Enceladus May Harbor Stable Ocean for Life',
      biasPercentage: 73,
      sources: 11,
      image: ''
    },
    {
      id: 4,
      category: 'Emmanuel Macron',
      location: 'Tehran',
      title: 'Iran Frees 2 French Prisoners But Bars Them From Leaving',
      biasPercentage: 44,
      sources: 106,
      image: ''
    },
    {
      id: 5,
      category: 'Israel Politics',
      location: 'Israel',
      title: "Alleged Iranian Plot to Kill Israel's Ambassador to Mexico Was Thwarted, US and Israel Say",
      biasPercentage: 50,
      sources: 99,
      image: ''
    },
    {
      id: 6,
      category: 'Sanae Takaichi',
      location: 'Japan',
      title: 'Japan, US Considering Rare Earth Mining Near Minamitori in Pacific: PM Takaichi',
      biasPercentage: 50,
      sources: 8,
      image: ''
    }
  ];

  return (
    <div className={styles["latest-stories-container"]}>
      <h2 className={styles["section-title"]}>Latest Stories</h2>

      <div className={styles['stories-list']}>
        {stories.map((story) => (
          <Link 
          to={`story/${story.id}`}
          key={story.id}
          className={styles["story-item"]}
          >
            <div className={styles["story-content"]}>
              <div className={styles["story-header"]}>
                <span className={styles["category-text"]}>{story.category}</span>
                {story.location && (
                  <>
                    <span className={styles["separator"]}>.</span>
                    <span className={styles["location-text"]}>{story.location}</span>
                  </>
                )}
              </div>

              <h3 className={styles["story-title"]}> {story.title}</h3>

              <BiasMeta 
                biasPercentage={story.biasPercentage} 
                sources={story.sources} 
              />
            </div>
            

            <div className={styles["story-image-container"]}>
              <img
                src={story.image}
                alt={story.title}
                className={styles["story-image"]}
                />
            </div>
            
          </Link>
        ))}
      </div>
    </div>
  );


};

export default LatestStories;