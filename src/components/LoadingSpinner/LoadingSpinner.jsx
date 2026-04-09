import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinnerWrap}>
        <div className={styles.spinner} />
        <div className={styles.spinnerInner} />
      </div>
      <p className={styles.text}>Generando análisis FODA...</p>
      <p className={styles.subtext}>Esto puede tardar unos segundos dependiendo del modelo</p>
    </div>
  );
}
