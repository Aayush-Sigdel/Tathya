import React from 'react';
import styles from './BiasMeta.module.css';

const BiasMeta = ({ biasPercentage, sources, variant = 'default' }) => {
  return (
    <div className={styles['bias-meta-container']}>
      <div className={styles['bias-bars']}>
        <span className={styles['bias-bar-left']}></span>
        <span className={styles['bias-bar-center']}></span>
      </div>
      <span className={styles['meta-text']}>
        {biasPercentage}% Center coverage · {sources} sources
      </span>
    </div>
  );
};

export default BiasMeta;