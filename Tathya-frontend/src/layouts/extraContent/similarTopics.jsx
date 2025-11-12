import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import styles from './SimilarTopics.module.css';
import isarealGazaPic from '../../assets/mock_images/isarealGazaPic.webp';

const SimilarTopics = () => {
  const topics = [
    {
      id: 1,
      name: 'Israel-Gaza',
      icon: isarealGazaPic,
      url: 'israel-gaza'
    },
    {
      id: 2,
      name: 'Grammy Awards',
      icon: '',
      url: 'grammyawards'
    },
    {
      id: 3,
      name: 'Government Shutdown',
      icon: '',
      url: 'governmentshutdown'
    },
    {
      id: 4,
      name: 'Basketball',
      icon: '',
      url: 'basketball'
    },
    {
      id: 5,
      name: 'Veterans',
      icon: '',
      url: 'veterans'
    },
    {
      id: 6,
      name: 'Donald Trump',
      icon: '',
      url: 'donaldtrump'
    },
    {
      id: 7,
      name: 'Stock Markets',
      icon: '',
      url: 'stockmarkets'
    }
  ];

  return (
    <div className={styles['similar-topics-container']}>
      <h2 className={styles['section-title']}>Similar News Topics</h2>
      
      <div className={styles['topics-list']}>
        {topics.map((topic) => (
          <Link 
            key={topic.id} 
            to={topic.url}
            className={styles['topic-item']}
          >
            <div className={styles['topic-content']}>
              <div className={styles['topic-icon-container']}>
                <img 
                  src={topic.icon} 
                  alt={topic.name}
                  className={styles['topic-icon']}
                />
              </div>
              <span className={styles['topic-name']}>{topic.name}</span>
            </div>
            <button className={styles['follow-button']}>
              <Plus size={18} />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarTopics;