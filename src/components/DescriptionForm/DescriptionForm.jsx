import { useState } from 'react';
import styles from './DescriptionForm.module.css';

const MIN_CHARS = 500;

const FOCUS_OPTIONS = [
  { value: 'empresa', label: 'Empresa / Organización' },
  { value: 'producto', label: 'Producto / Servicio' },
  { value: 'mercado', label: 'Mercado / Competencia' },
];

export default function DescriptionForm({ onSubmit, loading }) {
  const [description, setDescription] = useState('');
  const [focus, setFocus] = useState('empresa');

  const charCount = description.length;
  const isValid = charCount >= MIN_CHARS;

  function handleSubmit(e) {
    e.preventDefault();
    if (isValid && !loading) {
      onSubmit(description, focus);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <label className={styles.label} htmlFor="description">
        Describe tu empresa, proyecto o producto
      </label>
      <textarea
        id="description"
        className={styles.textarea}
        placeholder="Escribe una descripción detallada de al menos 500 caracteres. Incluye información sobre el sector, tamaño, productos/servicios, mercado objetivo, competencia y cualquier dato relevante..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />
      <div className={styles.charCount}>
        <span className={!isValid ? styles.charCountError : styles.charCountOk}>
          {charCount} / {MIN_CHARS} caracteres mínimo
        </span>
        {isValid && <span className={styles.charCountOk}>✓ Listo</span>}
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${Math.min(100, (charCount / MIN_CHARS) * 100)}%`,
            background: isValid
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
          }}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.selectGroup}>
          <label className={styles.label} htmlFor="focus">
            Enfoque del análisis
          </label>
          <select
            id="focus"
            className={styles.select}
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            disabled={loading}
          >
            {FOCUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!isValid || loading}
        >
          {loading ? 'Generando...' : 'Generar FODA'}
        </button>
      </div>
    </form>
  );
}
