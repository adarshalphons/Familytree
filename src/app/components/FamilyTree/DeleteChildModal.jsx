import React from 'react';
import styles from "../../styles/Family.module.css";

export default function DeleteChildModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className={styles.overlayDelete}>
      <div className={styles.deleteModal}>
        <h3
        style={{fontSize: "1.5rem", fontWeight: "bold", marginBottom: ".5rem"}}
        >Are you sure you want to delete this child?</h3>
        <p>This action cannot be undone.</p>
        <div className={styles.deleteActions}>
          <button className={styles.cancelDelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmDelBtn} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
