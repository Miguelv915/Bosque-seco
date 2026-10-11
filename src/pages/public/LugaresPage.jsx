import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import { buttonClass } from '../../components/shared/buttonClass';
import DestinationTile from '../../features/destinations/components/DestinationTile';
import { DESTINATIONS } from '../../features/destinations/data/destinations';
import heroImage from '../../assets/images/algarrobal.jpg';
import styles from './ListingPage.module.css';

export default function LugaresPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHero
        image={heroImage}
        imageAlt={t('places.imageAlt')}
        eyebrow={t('places.eyebrow')}
        title={t('places.title')}
        lead={t('places.lead')}
      >
        <span className={styles.chip}>{t('places.count', { count: DESTINATIONS.length })}</span>
        <span className={styles.chip}>{t('places.corridor')}</span>
      </PageHero>

      <section className={styles.section} aria-label={t('places.listLabel')}>
        <ul className={styles.grid}>
          {DESTINATIONS.map((destination) => (
            <li key={destination.id}>
              <DestinationTile destination={destination} />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.band} aria-labelledby="lugares-cta">
        <div>
          <h2 id="lugares-cta" className={styles.bandTitle}>
            {t('places.ctaTitle')}
          </h2>
          <p className={styles.bandText}>{t('places.ctaText')}</p>
        </div>
        <Link to="/#antes-de-ir" className={buttonClass('primary', { size: 'lg' })}>
          {t('nav.beforeYouGo')}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
