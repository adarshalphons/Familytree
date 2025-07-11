"use client";
import styles from '../../styles/Family.module.css';

export default function Loader({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinner}></div>
    </div>
  );
}