import React from 'react';
import styles from './TutorialComponents.module.css';

type StartCardProps = {
  title: string;
  description: string;
  href: string;
};

export default function StartCard({ title, description, href }: StartCardProps) {
  return (
    <a href={href} className={styles.startCardWrapper}>
      <div className={styles.startCard}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </a>
  );
}
