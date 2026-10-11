import { useTranslation } from 'react-i18next';
import { DESTINATIONS } from '../../destinations/data/destinations';
import styles from './Ticker.module.css';

const CITIES = ['Sullana', 'Máncora'];

/** Cinta animada con los nombres de destinos. La segunda copia es decorativa. */
export default function Ticker() {
  const { t } = useTranslation();
  const words = [
    ...DESTINATIONS.map((d) => t(`destinations.${d.id}.name`)),
    ...CITIES,
  ];

  const renderRow = (hidden) => (
    <div className={styles.row} aria-hidden={hidden || undefined}>
      {words.map((word) => (
        <span key={word} className={styles.item}>
          {word.toUpperCase()}
          <span className={styles.star}>✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {renderRow(false)}
        {renderRow(true)}
      </div>
    </div>
  );
}
