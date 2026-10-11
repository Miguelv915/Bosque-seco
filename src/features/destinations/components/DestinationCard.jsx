import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import { DESTINATIONS } from '../data/destinations';
import styles from './DestinationCard.module.css';

const pad = (n) => String(n + 1).padStart(2, '0');

/** Ficha del destino activo con selector de pestañas. */
export default function DestinationCard({ activeIndex, onSelect }) {
  const { t } = useTranslation();
  const { id, image, credit } = DESTINATIONS[activeIndex];
  const key = `destinations.${id}`;
  const facts = ['todo', 'access', 'season'];

  return (
    <article className={styles.card} aria-live="polite">
      <div className={styles.photo}>
        <ImagePlaceholder
          src={image}
          credit={credit}
          alt={t(`${key}.name`)}
          label={t('explorer.photo', { name: t(`${key}.name`) })}
        />
        <span className={styles.counter}>
          {pad(activeIndex)} / {pad(DESTINATIONS.length - 1)}
        </span>
      </div>

      <div className={styles.body}>
        <div>
          <p className={styles.kicker}>
            {t(`${key}.type`).toUpperCase()} · {t(`${key}.place`).toUpperCase()}
          </p>
          <h3 className={styles.name}>{t(`${key}.name`)}</h3>
        </div>

        <p className={styles.desc}>{t(`${key}.desc`)}</p>

        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact} className={styles.fact}>
              <dt>{t(`explorer.${fact}`).toUpperCase()}</dt>
              <dd>{t(`${key}.${fact}`)}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.tabs}>
          {DESTINATIONS.map((dest, i) => (
            <button
              key={dest.id}
              type="button"
              className={styles.tab}
              aria-pressed={i === activeIndex}
              onClick={() => onSelect(i)}
            >
              {pad(i)} {t(`destinations.${dest.id}.short`)}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
