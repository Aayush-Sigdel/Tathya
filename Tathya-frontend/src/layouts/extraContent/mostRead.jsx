import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MostRead.module.css';

export default function MostRead() {
  const articles = [
    {
      id: 1,
      title: "Trump says he may give Hungary an exemption on Russian oil sanctions",
      url: "#"
    },
    {
      id: 2,
      title: "DNA pioneer James Watson dies at 97",
      url: "#"
    },
    {
      id: 3,
      title: "Supreme Court rules full Snap food benefits can be temporarily halted",
      url: "#"
    },
    {
      id: 4,
      title: "Thousands of US flights cancelled or delayed over government shutdown cuts",
      url: "#"
    },
    {
      id: 5,
      title: "What does Elon Musk do with all his money?",
      url: "#"
    },
    {
      id: 6,
      title: "'Netflix': the peregrine falcon livestream that has Australians glued to their screens",
      url: "#"
    },
    {
      id: 7,
      title: "A 20-minute date with a Tinder predator destroyed my life for years",
      url: "#"
    },
    {
      id: 8,
      title: "Blame game over Air India crash goes on",
      url: "#"
    },
    {
      id: 9,
      title: "Why tech giants are offering premium AI tools to millions of Indians for free",
      url: "#"
    },
    {
      id: 10,
      title: "Multiple people fall ill after package delivered to Air Force One base",
      url: "#"
    }
  ];

  return (
    <div className={styles['main-container']}>
      <h2 className={styles['heading']}>MOST READ</h2>
      <div className={styles['articles-grid']}>
        {articles.map((article) => (
          <Link 
            key={article.id} 
            to={article.url}
            className={styles['article-item']}
          >
            <span className={styles['article-number']}>{article.id}</span>
            <h3 className={styles['article-title']}>{article.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}