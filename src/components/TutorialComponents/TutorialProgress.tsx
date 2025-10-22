import React from 'react';
import styles from './TutorialComponents.module.css';

interface TutorialProgressProps {
  current: number;
  total: number;
}

export function TutorialProgress({ current, total }: TutorialProgressProps) {
  const percentage = (current / total) * 100;
  const isRunning = percentage > 0 && percentage < 100;
  const isComplete = percentage === 100;
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressHeader}>
        <span className={styles.progressText}>
          Step {current} of {total}
        </span>
      </div>
      
      <div className={styles.progressBar}>
        {/* Filled portion */}
        <div 
          className={styles.progressFill} 
          style={{ width: `${percentage}%` }}
        />
        
        {/* Professor Hog running along */}
        <div 
          className={`${styles.progressHedgehog} ${
            isRunning ? styles.progressHedgehogRunning : ''
          } ${isComplete ? styles.progressHedgehogComplete : ''}`}
          style={{ left: `calc(${percentage}% - 24px)` }}
        >
          <img 
            src="/img/professor_hog.png" 
            alt="Professor Hog guiding you through the tutorial" 
            width={48}
            height={48}
          />
        </div>
      </div>
    </div>
  );
}