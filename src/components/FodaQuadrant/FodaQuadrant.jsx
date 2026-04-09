import styles from './FodaQuadrant.module.css';

const QUADRANT_CONFIG = {
  fortalezas: {
    icon: '💪',
    title: 'Fortalezas',
    titleColor: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  oportunidades: {
    icon: '🚀',
    title: 'Oportunidades',
    titleColor: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.08)',
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  debilidades: {
    icon: '⚠️',
    title: 'Debilidades',
    titleColor: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: 'rgba(251, 146, 60, 0.2)',
  },
  amenazas: {
    icon: '🔴',
    title: 'Amenazas',
    titleColor: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.08)',
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
};

export default function FodaQuadrant({ type, items, onUpdateItem }) {
  const config = QUADRANT_CONFIG[type];

  function handleBlur(index, e) {
    const newText = e.target.textContent.trim();
    if (newText && newText !== items[index]) {
      onUpdateItem(type, index, newText);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  }

  return (
    <div
      className={styles.quadrant}
      style={{
        '--title-color': config.titleColor,
        '--bg-color': config.bgColor,
        '--border-color': config.borderColor,
      }}
    >
      <div className={styles.header}>
        <span className={styles.icon}>{config.icon}</span>
        <span className={styles.title}>{config.title}</span>
        <span className={styles.count}>{items.length} puntos</span>
      </div>
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <span className={styles.bullet}>{index + 1}</span>
            <span
              className={styles.itemText}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleBlur(index, e)}
              onKeyDown={handleKeyDown}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
