import { useTranslation } from 'react-i18next';
import { BadgePercent, Download, LocateFixed, Stamp, WifiOff } from 'lucide-react';
import ContactButton from '../../../components/shared/ContactButton';
import { buttonClass } from '../../../components/shared/buttonClass';
import { APP_URL } from '../../../lib/contact';
import routeImage from '../../../assets/images/algarrobal.jpg';
import styles from './AppSection.module.css';

const FEATURES = [
  { key: 'offline', Icon: WifiOff },
  { key: 'gps', Icon: LocateFixed },
  { key: 'stamps', Icon: Stamp },
  { key: 'discounts', Icon: BadgePercent },
];

/** Presenta la app móvil: lo que hace en el bosque y cómo conseguirla. */
export default function AppSection() {
  const { t } = useTranslation();

  return (
    <section id="app" className={styles.section} aria-labelledby="app-title">
      <div className={styles.layout}>
        <div>
          <p className={styles.eyebrow}>{t('appPromo.eyebrow')}</p>
          <h2 id="app-title" className={styles.title}>
            {t('appPromo.title')}
          </h2>
          <p className={styles.lead}>{t('appPromo.lead')}</p>

          <ul className={styles.features}>
            {FEATURES.map(({ key, Icon }) => (
              <li key={key} className={styles.feature}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className={styles.featureTitle}>{t(`appPromo.features.${key}.title`)}</h3>
                  <p className={styles.featureText}>{t(`appPromo.features.${key}.text`)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            {APP_URL ? (
              <a
                href={APP_URL}
                className={buttonClass('primary', { size: 'lg' })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={18} aria-hidden="true" />
                {t('nav.app')}
              </a>
            ) : (
              <>
                <p className={styles.note}>{t('appPromo.askLink')}</p>
                <ContactButton message={t('appPromo.whatsappMessage')} variant="onDark" size="lg" />
              </>
            )}
          </div>
        </div>

        {/* Maqueta decorativa de la app: mapa sin conexión, ubicación y sello. */}
        <div className={styles.phone} aria-hidden="true">
          <div className={styles.screen}>
            <img className={styles.screenImage} src={routeImage} alt="" loading="lazy" />
            <span className={styles.offline}>
              <WifiOff size={14} />
              {t('appPromo.mock.offline')}
            </span>
            <svg className={styles.route} viewBox="0 0 200 360" preserveAspectRatio="none">
              <path d="M40 330 C 60 260, 150 250, 130 190 S 60 120, 120 40" />
            </svg>
            <span className={styles.gps} />
            <span className={styles.stamp}>
              <Stamp size={16} />
              {t('appPromo.mock.stamp')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
