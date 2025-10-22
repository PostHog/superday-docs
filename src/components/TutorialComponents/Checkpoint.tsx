import React, { ReactNode } from 'react';
import styles from './TutorialComponents.module.css';

interface CheckpointProps {
  title?: string;
  children: ReactNode;
}

export function Checkpoint({ title = "Checkpoint", children }: CheckpointProps) {
  return (
    <div className={styles.checkpoint}>
      <div className={styles.checkpointHeader}>
        <span className={styles.checkpointIcon}>✓</span>
        <h3>{title}</h3>
      </div>
      <div className={styles.checkpointContent}>
        {children}
      </div>
    </div>
  );
}