import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import logo from '../../../assets/images/logo-ecorumbo.png';
import heroImage from '../../../assets/images/hero-fondo.jpg';
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

      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          <img src={logo} alt={t('app.name')} className={styles.logo} />
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
