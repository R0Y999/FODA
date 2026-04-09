import { useState, useRef, useCallback } from 'react';
import DescriptionForm from './components/DescriptionForm/DescriptionForm';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import FodaMatrix from './components/FodaMatrix/FodaMatrix';
import ExportButtons from './components/ExportButtons/ExportButtons';
import { generateFoda } from './services/ollama';
import styles from './App.module.css';

export default function App() {
  const [fodaResult, setFodaResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedInput, setSubmittedInput] = useState(null);
  const matrixRef = useRef(null);

  async function handleSubmit(description, focus) {
    setLoading(true);
    setError(null);
    setSubmittedInput({ description, focus });
    try {
      const result = await generateFoda(description, focus);
      setFodaResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateItem = useCallback((type, index, newText) => {
    setFodaResult((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? newText : item)),
    }));
  }, []);

  function handleReset() {
    setFodaResult(null);
    setError(null);
    setSubmittedInput(null);
  }

  const focusLabels = { empresa: 'Empresa / Organización', producto: 'Producto / Servicio', mercado: 'Mercado / Competencia' };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.logo}>📊</span>
          <h1 className={styles.title}>Generador FODA</h1>
        </div>
        <p className={styles.subtitle}>
          Análisis de Fortalezas, Oportunidades, Debilidades y Amenazas potenciado con IA
        </p>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Ollama · gemma4:e2b
        </div>
      </header>

      {!fodaResult && !loading && (
        <DescriptionForm onSubmit={handleSubmit} loading={loading} />
      )}

      {loading && <LoadingSpinner />}

      {error && (
        <div className={styles.error}>
          <p className={styles.errorTitle}>Error</p>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {fodaResult && !loading && (
        <div className={styles.resultsSection}>
          {submittedInput && (
            <div className={styles.inputSummary}>
              <div className={styles.inputSummaryHeader}>
                <span className={styles.inputSummaryTitle}>Descripción analizada</span>
                <span className={styles.inputSummaryFocus}>
                  {focusLabels[submittedInput.focus] || submittedInput.focus}
                </span>
              </div>
              <p className={styles.inputSummaryText}>{submittedInput.description}</p>
            </div>
          )}
          <FodaMatrix
            ref={matrixRef}
            result={fodaResult}
            onUpdateItem={handleUpdateItem}
          />
          <ExportButtons
            matrixRef={matrixRef}
            fodaResult={fodaResult}
            onReset={handleReset}
          />
        </div>
      )}

      <footer className={styles.disclaimer}>
        Este análisis es un punto de partida generado por IA. No sustituye la
        validación estratégica del equipo.
      </footer>
    </div>
  );
}
