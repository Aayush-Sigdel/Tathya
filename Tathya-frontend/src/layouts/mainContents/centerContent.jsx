import React from "react";
import { Link } from "react-router-dom";
import styles from "./centerContent.module.css";
import BiasMeta from "../bias/biasMeta";

const CenterContent = () => {
  const featuredArticle = {
    id: 1,
    title: "Tesla shareholders approve Elon Musk's $1 trillion pay package",
    image: "",
    biasLeft: 30,
    biasCenter: 55,
    biasRight: 14,
  };

  const articles = [
    {
      id: 2,
      category: "Jair Bolsonaro",
      location: "Brazil",
      title:
        "Brazil top-court panel unanimously rejects Bolsonaro's prison sentence appeal",
      image: "",
      bias: "left",
      biasPercentage: 48,
      sources: 52,
    },
    {
      id: 3,
      category: "Tesla",
      location: "United States",
      title:
        "Musk expects Tesla's Full Self-Driving software to win full China approval in early 2026",
      image: "",
      bias: "center",
      biasPercentage: 45,
      sources: 9,
    },
    {
      id: 4,
      category: "Syria",
      location: "Syria",
      title:
        "Nearly 100 people abducted or disappeared in Syria since January, says UN",
      image: "",
      bias: "center",
      biasPercentage: 50,
      sources: 7,
    },
  ];

  return (
    <div className={styles["center-content-container"]}>
      {/* Featured article */}
      <Link
        to={`article/${featuredArticle.id}`}
        className={styles["featured-article"]}
      >
        <div className={styles["featured-image-container"]}>
          <img src={featuredArticle.image} alt={featuredArticle.title} />

          <div className={styles["featured-overlay"]}>
            <h1 className={styles["featured-title"]}>
              {featuredArticle.title}
            </h1>

            {/* Bias bar */}
            <div className={styles["bias-bar-container"]}>
              <div
                className={styles["bias-segment"]}
                style={{
                  width: `${featuredArticle.biasLeft}%`,
                  backgroundColor: "#dc2626",
                }}
              >
                <span className={styles["bias-label"]}>
                  Left {featuredArticle.biasLeft}%
                </span>
              </div>

              <div
                className={styles["bias-segment"]}
                style={{
                  width: `${featuredArticle.biasCenter}%`,
                  backgroundColor: "#f3f4f6",
                }}
              >
                <span className={styles["bias-label"]}>
                  Center {featuredArticle.biasCenter}%
                </span>
              </div>

              <div
                className={styles["bias-segment"]}
                style={{
                  width: `${featuredArticle.biasRight}%`,
                  backgroundColor: "#2563eb",
                }}
              >
                <span className={styles["bias-label"]}>
                  Right {featuredArticle.biasRight}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Articles list */}
      <div className={styles["articles-list"]}>
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`articles/${article.id}`}
            className={styles["article-item"]}
          >
            <div className={styles["article-content"]}>
              <div className={styles["article-header"]}>
                <span className={styles["article-category"]}>
                  {article.category}
                </span>
                <span className={styles["article-location"]}>
                  {article.location}
                </span>
              </div>

              <h3 className={styles["article-title"]}>{article.title}</h3>

              <div className={styles["article-meta"]}>
              <BiasMeta 
                biasPercentage={article.biasPercentage} 
                sources={article.sources} 
              />
                <span className={styles["sources-text"]}>
                  {article.sources} sources
                </span>
              </div>
            </div>

            <div className={styles["articles-image-container"]}>
              <img
                src={article.image}
                alt={article.title}
                className={styles["article-image"]}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CenterContent;
