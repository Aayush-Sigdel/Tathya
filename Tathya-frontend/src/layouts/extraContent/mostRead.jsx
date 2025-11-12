import React from 'react';
import styles from './MostRead.module.css';

export default function MostRead() {
  //mock data......
  const articles = [
    {
      id: 1,
      title: "Trump says he may give Hungary an exemption on Russian oil sanctions"
    },
    {
      id: 2,
      title: "DNA pioneer James Watson dies at 97"
    },
    {
      id: 3,
      title: "Supreme Court rules full Snap food benefits can be temporarily halted"
    },
    {
      id: 4,
      title: "Thousands of US flights cancelled or delayed over government shutdown cuts"
    },
    {
      id: 5,
      title: "What does Elon Musk do with all his money?"
    },
    {
      id: 6,
      title: "'Netflix': the peregrine falcon livestream that has Australians glued to their screens"
    },
    {
      id: 7,
      title: "A 20-minute date with a Tinder predator destroyed my life for years"
    },
    {
      id: 8,
      title: "Blame game over Air India crash goes on"
    },
    {
      id: 9,
      title: "Why tech giants are offering premium AI tools to millions of Indians for free"
    },
    {
      id: 10,
      title: "Multiple people fall ill after package delivered to Air Force One base"
    }
  ];

  return (
    <div className={styles['main-container']}>
      <h2 className={styles['heading']}>MOST READ</h2>
      <div className={styles['articles-grid']}>
        {articles.map((article) => (
          <div key={article.id} className={styles['article-item']}>
            <span className={styles['article-number']}>{article.id}</span>
            <h3 className={styles['article-title']}>{article.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}