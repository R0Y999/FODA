import { forwardRef } from 'react';
import FodaQuadrant from '../FodaQuadrant/FodaQuadrant';
import styles from './FodaMatrix.module.css';

const QUADRANTS = ['fortalezas', 'oportunidades', 'debilidades', 'amenazas'];

const FodaMatrix = forwardRef(function FodaMatrix({ result, onUpdateItem }, ref) {
  return (
    <div className={styles.grid} ref={ref}>
      {QUADRANTS.map((type) => (
        <FodaQuadrant
          key={type}
          type={type}
          items={result[type]}
          onUpdateItem={onUpdateItem}
        />
      ))}
    </div>
  );
});

export default FodaMatrix;
