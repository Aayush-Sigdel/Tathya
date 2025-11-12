import React from "react";
import { Link } from "react-router-dom";
import { Circle } from "lucide-react";
import styles from "./leftContent.module.css";

const LeftContent = () => {
  const newsStories = [
    {
      id: 1,
      title: "Trump Announces Cost Cuts to Weight Loss Drugs",
      bias: "center",
      biasPercentage: 55,
      sources: 282,
    },
    {
      id: 2,
      title:
        "Israeli Army Says It Has Begun Striking Hezbollah Targets in Southern Lebanon",
      bias: "center",
      biasPercentage: 50,
      sources: 168,
    },
    {
      id: 3,
      title:
        "France blocks Shein operations after controversy over child-like sex dolls",
      bias: "center",
      biasPercentage: 49,
      sources: 193,
    },
    {
      id: 4,
      title: "Zóhrán Mamdani Elected Mayor of New York City",
      bias: "center",
      biasPercentage: 42,
      sources: 552,
    },
    {
      id: 5,
      title: "Former US vice president Dick Cheney dies at 84",
      bias: "center",
      biasPercentage: 50,
      sources: 609,
    },
  ];

  return (
    <div className={styles["left-content-container"]}>
      <div className={styles["header-container"]}>
        <h2 className={styles["section-title"]}>Top News Stories!</h2>
      </div>

      <div className={styles["news-list-container"]}>
        {newsStories.map((story) => (
          <Link
            key={story.id}
            to={`news/${story.id}`}
            className={styles["news-item"]}
          >
            <h3 className={styles["news-title"]}>{story.title}</h3>

            <div className={styles["news-meta"]}>
              <div className={styles["bias-indicator"]}>
                <span
                  className={styles["bias-bar"]}
                  style={{
                    width: "20px",
                    backgroundColor: "#dc2626",
                  }}
                ></span>
                <span className={styles["bias-text"]}>
                  {story.biasPercentage}% Center coverage
                </span>
              </div>
              <span className={styles["bias-text"]}>
                {story.sources} sources
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles["latest-update-upload-container"]}>
        <Link to="/latest" className={styles["latest-update-link"]}>
          <span className={styles["latest-text"]}>Latest Updates</span>
          <span className={styles["live-indicator"]}>
            <Circle size={10} strokeWidth={12} />
          </span>
        </Link>
      </div>

      <div className={styles["featured-story"]}>
        <img
          src="#"
          alt="euta photo rakha la"
          className={styles["featured-image"]}
        />
        <h3 className={styles["featured-title"]}>
          This is a featured title.... stuff...
        </h3>
      </div>
    </div>
  );
};

export default LeftContent;
