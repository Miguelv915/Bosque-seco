import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, Car, Compass, Map, MapPin } from 'lucide-react';
import ImagePlaceholder from '../../components/shared/ImagePlaceholder';
import ContactButton from '../../components/shared/ContactButton';
import { buttonClass } from '../../components/shared/buttonClass';
import DestinationTile from '../../features/destinations/components/DestinationTile';
import { DESTINATIONS, findDestination } from '../../features/destinations/data/destinations';
import styles from './DestinationPage.module.css';

const FACTS = [
  { key: 'todo', Icon: Compass },
  { key: 'access', Icon: Car },
  { key: 'season', Icon: CalendarDays },
];

/**
 * Ficha de un destino: fotos grandes primero (lo que engancha), datos
 * prácticos y el WhatsApp siempre a la vista (barra fija en el celular).
 */
export default function DestinationPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const destination = findDestination(id);
  if (!destination) return <Navigate to="/lugares" replace />;

  const key = `destinations.${id}`;
  const name = t(`${key}.name`);
  const message = t('places.whatsappMessage', { name });
  const gallery = destination.gallery ?? [];
  const others = DESTINATIONS.filter((d) => d.id !== id).slice(0, 3);

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.media}>
          <ImagePlaceholder
            src={destination.image}
            credit={destination.credit}
            alt={name}
            label={t('explorer.photo', { name })}
            priority
          />
        </div>
        <div className={styles.content}>
          <Link to="/lugares" className={styles.back}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t('places.back')}
          </Link>
          <span className={styles.type}>{t(`${key}.type`)}</span>
          <h1 className={styles.title}>{name}</h1>
          <p className={styles.place}>
            <MapPin size={16} aria-hidden="true" />
            {t(`${key}.place`)}
          </p>
          <div className={styles.heroActions}>
            <ContactButton message={message} size="lg" />
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <p className={styles.desc}>{t(`${key}.desc`)}</p>

          {gallery.length > 0 && (
            <section aria-labelledby="galeria">
              <h2 id="galeria" className={styles.heading}>
                {t('places.gallery')}
              </h2>
              <ul className={styles.gallery}>
                {gallery.map((photo) => (
                  <li key={photo.src} className={styles.shot}>
                    <ImagePlaceholder src={photo.src} credit={photo.credit} alt={name} label={name} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className={styles.panel} aria-label={t('places.planTitle')}>
          <h2 className={styles.panelTitle}>{t('places.planTitle')}</h2>
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
          <p className={styles.note}>{t('places.guideNote')}</p>
          <ContactButton message={message} block />
          <Link to={`/rutas?destino=${id}`} className={buttonClass('secondary', { block: true })}>
            <Map size={18} aria-hidden="true" />
            {t('places.viewOnMap')}
          </Link>
        </aside>
      </div>

      <section className={styles.more} aria-labelledby="otros-destinos">
        <h2 id="otros-destinos" className={styles.heading}>
          {t('places.moreTitle')}
        </h2>
        <ul className={styles.moreGrid}>
          {others.map((d) => (
            <li key={d.id}>
              <DestinationTile destination={d} />
            </li>
          ))}
        </ul>
      </section>

      {/* En el celular el contacto queda siempre a un toque. */}
      <div className={styles.stickyBar}>
        <ContactButton message={message} block />
      </div>
    </>
  );
}
