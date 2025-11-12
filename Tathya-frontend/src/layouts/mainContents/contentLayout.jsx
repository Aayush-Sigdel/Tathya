import React from 'react';
import LeftContent from './leftContent';
import CenterContent from './centerContent';
import RightContent from './rightContent';
import styles from './contentLayout.module.css';

const ContentLayout = () => {
  return (
    <div className={styles["main-layout-container"]}>
      <aside className={styles["left-section"]}>
        <LeftContent />
      </aside>

      <main className={styles["center-section"]}>
        <CenterContent />
      </main>

      <aside className={styles["right-section"]}>
        <RightContent />
      </aside>
    </div>
  );
};

export default ContentLayout;
