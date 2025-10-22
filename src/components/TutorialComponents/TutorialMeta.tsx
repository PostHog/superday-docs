import React from 'react';
import styles from './TutorialComponents.module.css';

interface TutorialMetaProps {
  audience: string;
  level: string;
  duration: string;
  stack?: string[];
  whatYouBuild?: string;
}

export function TutorialMeta({ 
  audience, 
  level, 
  duration, 
  stack, 
  whatYouBuild 
}: TutorialMetaProps) {
  return (
    <div className={styles.tutorialMeta}>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>Audience</span>
        <span className={styles.metaValue}>{audience}</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>Level</span>
        <span className={styles.metaValue}>{level}</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>Duration</span>
        <span className={styles.metaValue}>{duration}</span>
      </div>
      {stack && (
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Tech Stack</span>
          <span className={styles.metaValue}>
            {stack.map((tech, i) => (
              <span key={i} className={styles.tag}>{tech}</span>
            ))}
          </span>
        </div>
      )}
      {whatYouBuild && (
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>What You'll Build</span>
          <span className={styles.metaValue}>{whatYouBuild}</span>
        </div>
      )}
    </div>
  );
}