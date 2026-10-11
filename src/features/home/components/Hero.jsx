import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import { buttonClass } from '../../../components/shared/buttonClass';
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
            <Link to="/lugares" className={buttonClass('primary', { size: 'lg' })}>
              {t('hero.ctaDestinations')}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/#comunidades" className={buttonClass('onDark', { size: 'lg' })}>
              {t('hero.ctaCommunities')}
            </Link>
          </div>
        </div>
      </div>

      <Ticker />
    </section>
  );
}
