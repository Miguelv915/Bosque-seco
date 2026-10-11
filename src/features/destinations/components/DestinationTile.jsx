import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Car, Compass, MapPin } from 'lucide-react';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import ContactButton from '../../../components/shared/ContactButton';
import { buttonClass } from '../../../components/shared/buttonClass';
import styles from './DestinationTile.module.css';

const FACTS = [
  { key: 'todo', Icon: Compass },
  { key: 'access', Icon: Car },
  { key: 'season', Icon: CalendarDays },
];

/** Tarjeta de destino con foto protagonista, datos prácticos y contacto. */
export default function DestinationTile({ destination }) {
  const { t } = useTranslation();
  const { id, image, credit } = destination;
  const key = `destinations.${id}`;
  const name = t(`${key}.name`);

  return (
    <article className={styles.tile} aria-labelledby={`destino-${id}`}>
      <div className={styles.photo}>
        <ImagePlaceholder
          src={image}
          credit={credit}
          alt={name}
          label={t('explorer.photo', { name })}
        />
        <span className={styles.type}>{t(`${key}.type`)}</span>
        <div className={styles.overlay}>
          <p className={styles.place}>
            <MapPin size={14} aria-hidden="true" />
            {t(`${key}.place`)}
          </p>
          <h2 id={`destino-${id}`} className={styles.name}>
            {name}
          </h2>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.desc}>{t(`${key}.desc`)}</p>

        <dl className={styles.facts}>
          {FACTS.map(({ key: fact, Icon }) => (
            <div key={fact} className={styles.fact}>
              <dt>
                <Icon size={16} aria-hidden="true" />
                {t(`explorer.${fact}`)}
              </dt>
              <dd>{t(`${key}.${fact}`)}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.actions}>
          <ContactButton message={t('places.whatsappMessage', { name })} block />
          <Link to={`/rutas?destino=${id}`} className={buttonClass('secondary', { block: true })}>
            {t('places.viewOnMap')}
          </Link>
        </div>
      </div>
    </article>
  );
}
