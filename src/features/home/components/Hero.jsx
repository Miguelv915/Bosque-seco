import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import heroImage from '../../../assets/images/hero-senderismo.png';
import Ticker from './Ticker';
import styles from './Hero.module.css';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media}>
        <ImagePlaceholder
          src={heroImage}
          priority
          alt={t('hero.imageAlt')}
          label={t('hero.imagePlaceholder')}
        />
      </div>
      <div className={styles.fade} />
      <div className={styles.grid} />

      <div className={styles.coords}>
        <div>{t('hero.coords')}</div>
        <div>{t('hero.places')}</div>
        <div className={styles.signal}>{t('hero.signal')}</div>
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>{t('hero.eyebrow')}</p>
        <h1 id="hero-title" className={styles.title}>
          {t('hero.titleA')}
          <br />
          <span className={styles.outline}>{t('hero.titleB')}</span>
        </h1>
        <div className={styles.footerRow}>
          <p className={styles.lead}>{t('hero.lead')}</p>
          <div className={styles.actions}>
            <a href="#explorar" className={styles.primary}>
              {t('hero.ctaMap').toUpperCase()}
            </a>
            <a href="#comunidades" className={styles.secondary}>
              {t('hero.ctaCommunities').toUpperCase()}
            </a>
          </div>
        </div>
      </div>

      <Ticker />
    </section>
  );
}
