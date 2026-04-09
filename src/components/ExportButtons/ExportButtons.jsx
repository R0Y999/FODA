import { useState } from 'react';
import { exportToPdf, copyToClipboard } from '../../utils/exportUtils';
import styles from './ExportButtons.module.css';

export default function ExportButtons({ matrixRef, fodaResult, onReset }) {
  const [feedback, setFeedback] = useState('');

  async function handlePdf() {
    if (matrixRef.current) {
      await exportToPdf(matrixRef.current);
    }
  }

  async function handleCopy() {
    try {
      await copyToClipboard(fodaResult);
      setFeedback('✓ Copiado al portapapeles');
      setTimeout(() => setFeedback(''), 2500);
    } catch {
      setFeedback('Error al copiar');
    }
  }

  return (
    <div>
      <div className={styles.container}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePdf}>
          📄 Exportar PDF
        </button>
        <button className={styles.btn} onClick={handleCopy}>
          📋 Copiar al portapapeles
        </button>
        <button className={`${styles.btn} ${styles.btnReset}`} onClick={onReset}>
          ↩ Nueva consulta
        </button>
      </div>
      <p className={styles.feedback}>{feedback}</p>
    </div>
  );
}
