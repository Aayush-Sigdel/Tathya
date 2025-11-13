import React from 'react';
import LatestStories from './latestStories';
import SimilarTopics from './similarTopics';
import styles from './extraLayout.module.css';

const ExtraLayout = () => {
  return (
    <div className={styles['latest-similar-container']}>
      <div className={styles['latest-section']}>
        <LatestStories />
      </div>
      
      <div className={styles['similar-section']}>
        <SimilarTopics />
      </div>
    </div>
  );
};

export default ExtraLayout;