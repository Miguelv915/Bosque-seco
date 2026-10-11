import { useTranslation } from 'react-i18next';
import { CITIES, DESTINATIONS } from '../data/destinations';
import { project } from '../lib/projection';
import styles from './SchematicMap.module.css';

const pad = (n) => String(n + 1).padStart(2, '0');

/** Mapa esquemático (no a escala) del corredor Sullana – Máncora. */
export default function SchematicMap({ activeIndex, onSelect }) {
  const { t } = useTranslation();
  const active = project(DESTINATIONS[activeIndex]);

  return (
    <div className={styles.map}>
      <div className={styles.grid} />
      <div className={styles.sea} />
      <div className={styles.ocean}>{t('explorer.ocean')}</div>

      <div className={styles.radar} style={{ left: active.x, top: active.y }} aria-hidden="true">
        <span className={styles.pulse} />
        <span className={styles.sweep} />
        <span className={styles.lineH} />
        <span className={styles.lineV} />
      </div>

      {DESTINATIONS.map((dest, i) => {
        const { x, y } = project(dest);
        const isActive = i === activeIndex;
        const name = t(`destinations.${dest.id}.short`);
        // Del centro hacia la derecha la etiqueta va a la izquierda del punto, para no cortarse.
        const flip = parseFloat(x) > 60;
        return (
          <div key={dest.id}>
            <button
              type="button"
              className={styles.pointButton}
              style={{ left: x, top: y }}
              aria-label={name}
              aria-pressed={isActive}
              onClick={() => onSelect(i)}
            >
              <span className={isActive ? styles.pointActive : styles.point} />
            </button>
            <span
              className={`${styles.label} ${flip ? styles.labelLeft : ''} ${isActive ? styles.labelActive : ''}`}
              style={{ left: x, top: y }}
            >
              {pad(i)} {name}
            </span>
          </div>
        );
      })}

      {CITIES.map((city) => {
        const { x, y } = project(city);
        return (
          <div key={city.name} className={styles.city} style={{ left: x, top: y }}>
            <span className={styles.diamond} />
            <span className={styles.cityName}>{city.name}</span>
          </div>
        );
      })}

      <div className={styles.note}>
        <span>{t('explorer.mapNote')}</span>
        <span>81.2°O ⟶ 80.3°O</span>
      </div>
    </div>
  );
}
